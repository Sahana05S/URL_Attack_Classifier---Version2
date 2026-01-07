import re
from typing import List, Dict
from src.schema.events import UnifiedEvent

class RuleBasedDetector:
    """
    Baseline Model B: Rule-based scoring for Traversal, HPP, and SSRF.
    """
    
    RULES = {
        "Traversal": [
            (r"\.\./", "Unix Traversal"),
            (r"\.\.\\", "Windows Traversal"),
            (r"/etc/passwd", "Sensitive File Access"),
            (r"win\.ini", "Windows Config Access")
        ],
        "HPP": [
            # Logic handled in code, but pattern examples here
        ],
        "SSRF": [
            (r"169\.254\.169\.254", "AWS Metadata Access"),
            (r"localhost", "Localhost Access"),
            (r"127\.0\.0\.1", "Loopback Access")
        ],
        "SQLi": [
            (r"' OR 1=1", "Classic SQLi"),
            (r"UNION SELECT", "Union Based SQLi"),
            (r"--", "SQL Comment")
        ],
        "XSS": [
            (r"<script>", "Script Tag"),
            (r"javascript:", "Javascript Protocol"),
            (r"onerror=", "Event Handler")
        ]
    }

    def analyze(self, event: UnifiedEvent) -> Dict[str, list]:
        """
        Returns a dict of {attack_type: [list of rule names hit]}
        """
        hits = {}
        combined_text = f"{event.url} {event.payload or ''}"
        
        # Regex Checks
        for attack_type, rules in self.RULES.items():
            for pattern, rule_name in rules:
                if re.search(pattern, combined_text, re.IGNORECASE):
                    if attack_type not in hits:
                        hits[attack_type] = []
                    hits[attack_type].append(rule_name)
                    
        # HPP Check (heuristics on URL query)
        if "?" in event.url:
            query = event.url.split("?", 1)[1]
            params = query.split("&")
            keys = [p.split("=")[0] for p in params]
            if len(keys) != len(set(keys)):
                if "HPP" not in hits:
                    hits["HPP"] = []
                hits["HPP"].append("Duplicate Parameters")

        return hits
