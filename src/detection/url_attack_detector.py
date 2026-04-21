"""
URL Attack Detector - Rule-based attack detection engine.

This module analyzes URLs and payloads to detect various web attack patterns
using URL decoding, pattern matching, and heuristics.
"""

import re
import urllib.parse
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class DetectionResult:
    """Result of attack detection analysis."""
    inferred_attack_type: str
    confidence_score: float
    detection_reasons: List[str]
    is_attack: bool
    all_matches: Dict[str, List[str]]


class URLAttackDetector:
    """
    Rule-based URL attack detector that classifies requests into:
    Normal, SQLi, XSS, Traversal, CmdInjection, SSRF, HPP, Typosquatting
    
    Uses URL decoding + keyword/pattern matching to detect attacks.
    """
    
    # Attack patterns: (regex_pattern, rule_name, confidence_weight)
    PATTERNS = {
        "SQLi": [
            (r"(?i)'\s*OR\s+\d+=\d+", "Classic OR-based SQLi", 1.0),
            (r"(?i)'\s*OR\s+'[^']*'\s*=\s*'", "String-based SQLi", 1.0),
            (r"(?i)UNION\s+(?:ALL\s+)?SELECT", "UNION SELECT SQLi", 1.0),
            (r"(?i);\s*SELECT\s+", "Stacked Query SQLi", 0.95),
            (r"(?i);\s*DROP\s+TABLE", "DROP TABLE SQLi", 1.0),
            (r"(?i);\s*DELETE\s+FROM", "DELETE FROM SQLi", 1.0),
            (r"(?i);\s*INSERT\s+INTO", "INSERT INTO SQLi", 0.95),
            (r"(?i);\s*UPDATE\s+\w+\s+SET", "UPDATE SQLi", 0.95),
            (r"(?i)WAITFOR\s+DELAY", "Time-based SQLi", 1.0),
            (r"(?i)SLEEP\s*\(\s*\d+\s*\)", "Time-based SQLi (SLEEP)", 1.0),
            (r"(?i)BENCHMARK\s*\(", "Time-based SQLi (BENCHMARK)", 1.0),
            (r"'\s*--\s*$", "SQL Comment Terminator", 0.8),
            (r"(?i)admin'\s*--", "Admin Bypass SQLi", 1.0),
            (r"(?i)version\s*\(\s*\)", "SQL Version Probe", 0.85),
            (r"(?i)@@version", "SQL Server Version", 0.9),
            (r"(?i)information_schema", "Schema Enumeration", 0.9),
            (r"(?i)CONCAT\s*\(", "SQL Concat Function", 0.7),
            (r"(?i)CHAR\s*\(\s*\d+\s*\)", "SQL CHAR Encoding", 0.8),
            (r"(?i)0x[0-9a-f]{2,}", "Hex Encoded SQL", 0.75),
        ],
        "XSS": [
            (r"<script[^>]*>", "Script Tag", 1.0),
            (r"</script>", "Script Close Tag", 0.9),
            (r"(?i)javascript\s*:", "JavaScript Protocol", 1.0),
            (r"(?i)on(?:error|load|click|mouse\w+|focus|blur)\s*=", "Event Handler XSS", 1.0),
            (r"(?i)<img[^>]+(?:src\s*=\s*['\"]?x|onerror)", "IMG Tag XSS", 1.0),
            (r"(?i)<svg[^>]*(?:onload|onerror)", "SVG XSS", 1.0),
            (r"(?i)<iframe", "IFrame Injection", 0.9),
            (r"(?i)<body[^>]+onload", "Body Onload XSS", 1.0),
            (r"(?i)alert\s*\(", "Alert Function", 0.85),
            (r"(?i)confirm\s*\(", "Confirm Function", 0.8),
            (r"(?i)prompt\s*\(", "Prompt Function", 0.8),
            (r"(?i)document\.cookie", "Cookie Access", 0.95),
            (r"(?i)document\.location", "Location Redirect", 0.85),
            (r"(?i)eval\s*\(", "Eval Function", 0.9),
            (r"(?i)<\s*\w+[^>]*\s+style\s*=\s*['\"]?[^'\"]*expression\s*\(", "CSS Expression XSS", 1.0),
        ],
        "Traversal": [
            (r"\.\.\/", "Unix Path Traversal (../)", 1.0),
            (r"\.\.\\", "Windows Path Traversal (..\\)", 1.0),
            (r"(?i)\.\.%2f", "URL Encoded Traversal (%2f)", 1.0),
            (r"(?i)\.\.%5c", "URL Encoded Traversal (%5c)", 1.0),
            (r"(?i)%2e%2e[/\\]", "Double Encoded Traversal", 1.0),
            (r"(?i)%252e%252e", "Triple Encoded Traversal", 1.0),
            (r"(?i)/etc/passwd", "Linux Passwd Access", 1.0),
            (r"(?i)/etc/shadow", "Linux Shadow Access", 1.0),
            (r"(?i)win\.ini", "Windows INI Access", 1.0),
            (r"(?i)boot\.ini", "Windows Boot INI", 1.0),
            (r"(?i)system32", "Windows System32 Access", 0.9),
            (r"(?i)/proc/self", "Linux Proc Access", 0.95),
            (r"(?i)\.htaccess", "Apache Config Access", 0.9),
            (r"(?i)web\.config", "IIS Config Access", 0.9),
        ],
        "CmdInjection": [
            (r";\s*cat\s+", "Command Injection (cat)", 1.0),
            (r";\s*ls\s*", "Command Injection (ls)", 0.95),
            (r";\s*whoami", "Command Injection (whoami)", 1.0),
            (r";\s*id\s*$", "Command Injection (id)", 0.95),
            (r";\s*uname", "Command Injection (uname)", 0.95),
            (r";\s*pwd\s*$", "Command Injection (pwd)", 0.9),
            (r"\$\([^)]+\)", "Command Substitution $()", 1.0),
            (r"`[^`]+`", "Backtick Command Execution", 1.0),
            (r"\|\s*(?:cat|ls|whoami|id|wget|curl)", "Pipe Command Injection", 1.0),
            (r"\|\s*ipconfig", "Windows Pipe Injection (ipconfig)", 1.0),
            (r"\|\s*net\s+", "Windows Pipe Injection (net)", 0.95),
            (r"&&\s*(?:cat|ls|whoami|wget|curl)", "Chained Command (&&)", 1.0),
            (r"\|\|\s*(?:cat|ls|whoami)", "OR Command Chain (||)", 0.95),
            (r">\s*/dev/null", "Output Redirection", 0.8),
            (r"(?i)powershell", "PowerShell Injection", 0.95),
            (r"(?i)cmd\.exe", "CMD.exe Injection", 0.95),
        ],
        "SSRF": [
            (r"(?i)169\.254\.169\.254", "AWS Metadata SSRF", 1.0),
            (r"(?i)metadata\.google", "GCP Metadata SSRF", 1.0),
            (r"(?i)127\.0\.0\.1", "Localhost SSRF", 0.85),
            (r"(?i)localhost(?::\d+)?(?:/|$)", "Localhost URL SSRF", 0.85),
            (r"(?i)0\.0\.0\.0", "All Interfaces SSRF", 0.9),
            (r"(?i)::1", "IPv6 Localhost SSRF", 0.85),
            (r"(?i)10\.\d{1,3}\.\d{1,3}\.\d{1,3}", "Private IP (10.x)", 0.75),
            (r"(?i)192\.168\.\d{1,3}\.\d{1,3}", "Private IP (192.168.x)", 0.7),
            (r"(?i)172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}", "Private IP (172.16-31.x)", 0.7),
            (r"(?i)file://", "File Protocol SSRF", 1.0),
            (r"(?i)gopher://", "Gopher Protocol SSRF", 1.0),
            (r"(?i)dict://", "Dict Protocol SSRF", 0.95),
            (r"(?i)ftp://(?:127|localhost|10\.|192\.168|172\.)", "FTP Internal SSRF", 0.9),
        ],
        "Typosquatting": [
            (r"(?i)goggle\.com", "Typosquatting: goggle.com", 1.0),
            (r"(?i)gogle\.com", "Typosquatting: gogle.com", 1.0),
            (r"(?i)googel\.com", "Typosquatting: googel.com", 1.0),
            (r"(?i)gooogle\.com", "Typosquatting: gooogle.com", 1.0),
            (r"(?i)facebok\.com", "Typosquatting: facebok.com", 1.0),
            (r"(?i)faceboook\.com", "Typosquatting: faceboook.com", 1.0),
            (r"(?i)twiter\.com", "Typosquatting: twiter.com", 1.0),
            (r"(?i)twtter\.com", "Typosquatting: twtter.com", 1.0),
            (r"(?i)microsft\.com", "Typosquatting: microsft.com", 1.0),
            (r"(?i)mircosoft\.com", "Typosquatting: mircosoft.com", 1.0),
            (r"(?i)paypa1\.com", "Typosquatting: paypa1.com (homoglyph)", 1.0),
            (r"(?i)arnazon\.com", "Typosquatting: arnazon.com", 1.0),
            (r"(?i)arnezon\.com", "Typosquatting: arnezon.com", 1.0),
        ],
    }
    
    # Priority order for attack type selection when multiple match
    ATTACK_PRIORITY = [
        "SQLi", "CmdInjection", "XSS", "Traversal", "SSRF", "HPP", "Typosquatting"
    ]
    
    def __init__(self):
        """Initialize the detector with compiled patterns for performance."""
        self._compiled_patterns: Dict[str, List[Tuple[re.Pattern, str, float]]] = {}
        for attack_type, patterns in self.PATTERNS.items():
            self._compiled_patterns[attack_type] = [
                (re.compile(pattern), rule_name, weight)
                for pattern, rule_name, weight in patterns
            ]
    
    def _decode_url(self, url: str) -> str:
        """
        Recursively decode URL-encoded characters until no more encoding is found.
        This catches double/triple encoding bypass attempts.
        """
        decoded = url
        max_iterations = 5  # Prevent infinite loops
        for _ in range(max_iterations):
            new_decoded = urllib.parse.unquote(decoded)
            if new_decoded == decoded:
                break
            decoded = new_decoded
        return decoded
    
    def _check_hpp(self, url: str) -> Optional[Tuple[str, float]]:
        """
        Check for HTTP Parameter Pollution (duplicate query parameters).
        Returns (rule_name, confidence) if HPP detected, None otherwise.
        """
        if "?" not in url:
            return None
        
        try:
            query = url.split("?", 1)[1]
            if not query:
                return None
            
            params = query.split("&")
            keys = [p.split("=")[0] for p in params if "=" in p]
            
            # Check for duplicate keys
            if len(keys) != len(set(keys)):
                duplicates = [k for k in set(keys) if keys.count(k) > 1]
                return (f"Duplicate Parameters: {', '.join(duplicates)}", 0.9)
        except Exception:
            pass
        
        return None
    
    def detect(self, url: str, payload: Optional[str] = None) -> Dict:
        """
        Analyze a URL and optional payload for attack patterns.
        
        Args:
            url: The request URL to analyze
            payload: Optional request body/payload
            
        Returns:
            Detection result dictionary with:
            - inferred_attack_type: str
            - confidence_score: float
            - detection_reasons: List[str]
            - is_attack: bool
            - all_matches: Dict[str, List[str]]
        """
        all_matches: Dict[str, List[str]] = {}
        confidence_scores: Dict[str, float] = {}
        
        # Decode URL for pattern matching
        decoded_url = self._decode_url(url)
        
        # Combine URL and payload for analysis
        combined_text = decoded_url
        if payload:
            decoded_payload = self._decode_url(payload)
            combined_text = f"{decoded_url} {decoded_payload}"
        
        # Check all pattern-based attacks
        for attack_type, patterns in self._compiled_patterns.items():
            for compiled_pattern, rule_name, weight in patterns:
                if compiled_pattern.search(combined_text):
                    if attack_type not in all_matches:
                        all_matches[attack_type] = []
                        confidence_scores[attack_type] = 0.0
                    all_matches[attack_type].append(rule_name)
                    # Take max confidence for each attack type
                    confidence_scores[attack_type] = max(
                        confidence_scores[attack_type], weight
                    )
        
        # Check for HPP
        hpp_result = self._check_hpp(url)
        if hpp_result:
            rule_name, confidence = hpp_result
            all_matches["HPP"] = [rule_name]
            confidence_scores["HPP"] = confidence
        
        # Determine primary attack type based on priority
        inferred_attack_type = "Normal"
        max_confidence = 0.0
        
        for attack_type in self.ATTACK_PRIORITY:
            if attack_type in all_matches:
                if confidence_scores[attack_type] > max_confidence:
                    max_confidence = confidence_scores[attack_type]
                    inferred_attack_type = attack_type
                elif confidence_scores[attack_type] == max_confidence:
                    # If equal confidence, priority order wins
                    pass
        
        # Build detection reasons from all matches for the primary type
        detection_reasons: List[str] = []
        if inferred_attack_type != "Normal":
            detection_reasons = all_matches.get(inferred_attack_type, [])
        
        # For normal URLs, set a baseline confidence
        if inferred_attack_type == "Normal":
            max_confidence = 0.95  # High confidence it's normal
        
        return {
            "inferred_attack_type": inferred_attack_type,
            "confidence_score": round(max_confidence, 3),
            "detection_reasons": detection_reasons,
            "is_attack": inferred_attack_type != "Normal",
            "all_matches": all_matches
        }
    
    def detect_batch(self, events: List[Tuple[str, Optional[str]]]) -> List[Dict]:
        """
        Analyze multiple URL/payload pairs.
        
        Args:
            events: List of (url, payload) tuples
            
        Returns:
            List of detection result dictionaries
        """
        return [self.detect(url, payload) for url, payload in events]


def infer_attack_success(status_code: int, response_size: int, attack_type: str) -> bool:
    """
    Infer whether an attack was successful based on response characteristics.
    
    Heuristics:
    - 2xx status with large response for data exfiltration attacks (SQLi, Traversal)
    - 2xx status for command injection (indicates command may have run)
    - 5xx may indicate successful injection causing errors
    
    Args:
        status_code: HTTP response status code
        response_size: Size of response in bytes
        attack_type: The detected attack type
        
    Returns:
        True if attack appears successful, False otherwise
    """
    if attack_type == "Normal":
        return False
    
    # Large successful responses often indicate data exfiltration
    if status_code == 200:
        # Data exfiltration attacks with large responses
        if attack_type in ("SQLi", "Traversal", "SSRF") and response_size > 5000:
            return True
        # Command injection with output
        if attack_type == "CmdInjection" and response_size > 1000:
            return True
        # HPP/Typosquatting with successful response
        if attack_type in ("HPP", "Typosquatting") and response_size > 10000:
            return True
        # XSS reflected back
        if attack_type == "XSS" and response_size > 2000:
            return True
    
    return False