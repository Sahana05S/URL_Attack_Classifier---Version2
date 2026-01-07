from typing import List
from src.schema.events import UnifiedEvent

class SuccessClassifier:
    """
    Baseline Model C: Attempt vs Success Classifier.
    Uses rules based on response code, length, and error patterns.
    """
    
    def predict(self, event: UnifiedEvent, attack_type_pred: str) -> bool:
        """
        Heuristic determination of success.
        """
        code = event.status_code
        size = event.response_size
        
        # 1. Successful HTTP codes usually mean the server accepted the input
        # unless it's a 4xx blocking the attack.
        # However, for an attack to be 'successful', we often look for
        # specific anomalies (e.g., status 200 on a sensitive path, or huge size).
        
        if attack_type_pred == "Normal":
            # If we think it's normal, success/fail isn't really "attack success",
            # but usually 2xx is good behavior. For this classifier, "Is Successful Attack?" is False.
            return False
            
        # SQLi Success: Often 200 OK with distinct size, or 500 error if error-based
        if attack_type_pred == "SQLi":
            if code == 500: # Error based SQLi might be considered 'successful' info leak? 
                            # Or usually 'attempted'. Let's say successful if it bypasses auth (200).
                return False
            if code == 200:
                return True
                
        # Traversal: 200 OK and significant size usually means file found
        if attack_type_pred == "Traversal":
            if code == 200 and size > 100:
                return True
        
        # SSRF: 200 OK means it reached the target
        if attack_type_pred == "SSRF":
            if code == 200:
                return True
                
        # Default fallback
        # If the WAF blocked it (403), it's definitely NOT successful.
        if code == 403:
            return False
            
        return False

    def batch_predict(self, events: List[UnifiedEvent], attack_types: List[str]) -> List[bool]:
        return [
            self.predict(e, pred_type) 
            for e, pred_type in zip(events, attack_types)
        ]
