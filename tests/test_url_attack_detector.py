"""
Unit tests for the URL Attack Detector.

Tests the rule-based detection engine for various attack patterns.
"""

import pytest
from src.detection.url_attack_detector import URLAttackDetector, infer_attack_success


@pytest.fixture
def detector():
    """Create a detector instance for testing."""
    return URLAttackDetector()


class TestSQLiDetection:
    """Test SQL Injection detection."""
    
    def test_classic_or_sqli(self, detector):
        result = detector.detect("/search?q=' OR 1=1 --", None)
        assert result["inferred_attack_type"] == "SQLi"
        assert result["confidence_score"] >= 0.8
        assert result["is_attack"] is True
        assert len(result["detection_reasons"]) > 0
    
    def test_union_select_sqli(self, detector):
        result = detector.detect("/api?id=1 UNION SELECT username,password FROM users", None)
        assert result["inferred_attack_type"] == "SQLi"
        assert "UNION SELECT SQLi" in result["detection_reasons"]
    
    def test_sqli_in_payload(self, detector):
        result = detector.detect("/login", "' UNION SELECT null, version() --")
        assert result["inferred_attack_type"] == "SQLi"
        assert result["is_attack"] is True
    
    def test_admin_bypass(self, detector):
        result = detector.detect("/login", "admin' --")
        assert result["inferred_attack_type"] == "SQLi"


class TestXSSDetection:
    """Test Cross-Site Scripting detection."""
    
    def test_script_tag(self, detector):
        result = detector.detect("/search?q=<script>alert(1)</script>", None)
        assert result["inferred_attack_type"] == "XSS"
        assert result["confidence_score"] >= 0.9
        assert "Script Tag" in result["detection_reasons"]
    
    def test_img_onerror(self, detector):
        result = detector.detect("/profile?name=<img src=x onerror=alert(1)>", None)
        assert result["inferred_attack_type"] == "XSS"
        assert "IMG Tag XSS" in result["detection_reasons"]
    
    def test_javascript_protocol(self, detector):
        result = detector.detect("/redirect?url=javascript:alert(document.cookie)", None)
        assert result["inferred_attack_type"] == "XSS"


class TestPathTraversalDetection:
    """Test Path Traversal detection."""
    
    def test_unix_traversal(self, detector):
        result = detector.detect("/download?file=../../../../etc/passwd", None)
        assert result["inferred_attack_type"] == "Traversal"
        assert result["confidence_score"] == 1.0
    
    def test_windows_traversal(self, detector):
        result = detector.detect("/download?file=..\\..\\windows\\win.ini", None)
        assert result["inferred_attack_type"] == "Traversal"
    
    def test_url_encoded_traversal(self, detector):
        """Test detection of URL-encoded traversal (..%2f..%2f)"""
        result = detector.detect("/download?file=..%2f..%2fwindows%2fwin.ini", None)
        assert result["inferred_attack_type"] == "Traversal"
        assert result["is_attack"] is True


class TestCommandInjectionDetection:
    """Test Command Injection detection."""
    
    def test_semicolon_cat(self, detector):
        result = detector.detect("/ping?ip=127.0.0.1; cat /etc/passwd", None)
        assert result["inferred_attack_type"] == "CmdInjection"
        assert result["confidence_score"] == 1.0
    
    def test_command_substitution(self, detector):
        result = detector.detect("/ping?ip=127.0.0.1$(whoami)", None)
        assert result["inferred_attack_type"] == "CmdInjection"
        assert "Command Substitution $()" in result["detection_reasons"]
    
    def test_pipe_injection(self, detector):
        result = detector.detect("/ping?ip=127.0.0.1| ipconfig", None)
        assert result["inferred_attack_type"] == "CmdInjection"


class TestSSRFDetection:
    """Test Server-Side Request Forgery detection."""
    
    def test_aws_metadata(self, detector):
        result = detector.detect("/webhook?url=http://169.254.169.254/latest/meta-data/", None)
        assert result["inferred_attack_type"] == "SSRF"
        assert "AWS Metadata SSRF" in result["detection_reasons"]
    
    def test_localhost_ssrf(self, detector):
        result = detector.detect("/webhook?url=http://localhost:8080/admin", None)
        assert result["inferred_attack_type"] == "SSRF"
    
    def test_file_protocol(self, detector):
        # Use a file URL that doesn't match path traversal patterns
        result = detector.detect("/fetch?url=file:///var/log/app.log", None)
        assert result["inferred_attack_type"] == "SSRF"
        assert "File Protocol SSRF" in result["detection_reasons"]


class TestHPPDetection:
    """Test HTTP Parameter Pollution detection."""
    
    def test_duplicate_params(self, detector):
        result = detector.detect("/api/users?id=1&id=2", None)
        assert result["inferred_attack_type"] == "HPP"
        assert "Duplicate Parameters" in result["detection_reasons"][0]


class TestTyposquattingDetection:
    """Test Typosquatting detection."""
    
    def test_goggle_typo(self, detector):
        result = detector.detect("/goggle.com/login", None)
        assert result["inferred_attack_type"] == "Typosquatting"


class TestNormalUrls:
    """Test that normal URLs are correctly classified."""
    
    def test_simple_get(self, detector):
        result = detector.detect("/api/products/123", None)
        assert result["inferred_attack_type"] == "Normal"
        assert result["is_attack"] is False
        assert result["confidence_score"] >= 0.9
    
    def test_dashboard(self, detector):
        result = detector.detect("/dashboard", None)
        assert result["inferred_attack_type"] == "Normal"
    
    def test_api_with_params(self, detector):
        result = detector.detect("/api/search?q=laptop&page=1", None)
        assert result["inferred_attack_type"] == "Normal"
    
    def test_login_page(self, detector):
        result = detector.detect("/login", None)
        assert result["inferred_attack_type"] == "Normal"


class TestAttackSuccessInference:
    """Test attack success inference from response characteristics."""
    
    def test_sqli_success_large_response(self):
        """Large 200 response for SQLi suggests data exfiltration."""
        assert infer_attack_success(200, 50000, "SQLi") is True
    
    def test_sqli_blocked(self):
        """Small response suggests blocked attack."""
        assert infer_attack_success(200, 100, "SQLi") is False
    
    def test_traversal_success(self):
        """Large response for Traversal suggests file read."""
        assert infer_attack_success(200, 10000, "Traversal") is True
    
    def test_normal_not_attack(self):
        """Normal requests should never be marked successful."""
        assert infer_attack_success(200, 50000, "Normal") is False
    
    def test_cmd_injection_output(self):
        """Command injection with output."""
        assert infer_attack_success(200, 2000, "CmdInjection") is True


class TestURLDecoding:
    """Test URL decoding functionality."""
    
    def test_double_encoded_traversal(self, detector):
        """Test detection of double URL-encoded traversal."""
        # %252e = double-encoded .
        result = detector.detect("/download?file=%252e%252e%252f%252e%252e%252fetc/passwd", None)
        # After decoding: ..%2f..%2fetc/passwd -> ../../etc/passwd
        assert result["inferred_attack_type"] == "Traversal"
    
    def test_encoded_sqli(self, detector):
        """Test detection of URL-encoded SQL injection."""
        # %27 = '
        result = detector.detect("/search?q=%27%20OR%201=1%20--", None)
        assert result["inferred_attack_type"] == "SQLi"


class TestBatchDetection:
    """Test batch detection functionality."""
    
    def test_batch_multiple_attacks(self, detector):
        events = [
            ("/api/normal", None),
            ("/search?q=<script>alert(1)</script>", None),
            ("/download?file=../../etc/passwd", None),
        ]
        results = detector.detect_batch(events)
        
        assert len(results) == 3
        assert results[0]["inferred_attack_type"] == "Normal"
        assert results[1]["inferred_attack_type"] == "XSS"
        assert results[2]["inferred_attack_type"] == "Traversal"
