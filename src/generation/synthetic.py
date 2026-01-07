import random
import uuid
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from src.schema.events import UnifiedEvent

class SyntheticLogGenerator:
    """
    Generates synthetic security logs for training and testing.
    """
    
    ATTACK_TYPES = [
        "Normal", "SQLi", "XSS", "Traversal", 
        "CmdInjection", "SSRF", "HPP", "Typosquatting"
    ]
    
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Mozilla/5.0 (X11; Linux x86_64)",
        "Python-urllib/3.8",
        "curl/7.68.0"
    ]

    def __init__(self, seed: int = 42):
        random.seed(seed)
        self.base_time = datetime.now() - timedelta(days=1)

    def _generate_payload(self, attack_type: str, successful: bool) -> tuple[str, str, str]:
        """
        Returns (url_path, payload, method).
        """
        if attack_type == "Normal":
            path = random.choice(["/home", "/login", "/dashboard", "/api/data", "/contact"])
            return path, "", "GET"
            
        elif attack_type == "SQLi":
            payloads = ["' OR 1=1 --", "' UNION SELECT null, version() --", "admin' --"]
            return "/login", random.choice(payloads), "POST"
            
        elif attack_type == "XSS":
            payloads = ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>"]
            return "/search?q=" + random.choice(payloads), "", "GET"
            
        elif attack_type == "Traversal":
            payloads = ["../../../../etc/passwd", "..%2f..%2fwindows%2fwin.ini"]
            return "/download?file=" + random.choice(payloads), "", "GET"
            
        elif attack_type == "CmdInjection":
            payloads = ["; cat /etc/passwd", "| ipconfig", "$(whoami)"]
            return "/ping?ip=127.0.0.1" + random.choice(payloads), "", "GET"
            
        elif attack_type == "SSRF":
            targets = ["http://169.254.169.254/latest/meta-data/", "http://localhost:8080/admin"]
            return "/webhook?url=" + random.choice(targets), "", "POST"
            
        elif attack_type == "HPP":
            # HTTP Parameter Pollution
            return "/api/users?id=1&id=2", "", "GET"
            
        elif attack_type == "Typosquatting":
            # Not exactly a payload, but a URL characteristic.
            # Simulating it as a host header attack or referer? 
            # For this context, we'll put it in the URL domain if we were parsing full URLs,
            # but here we might just simulate a suspicious path or query.
            return "/goggle.com/login", "", "GET"
            
        return "/", "", "GET"

    def generate_events(self, num_events: int = 100, success_ratio: float = 0.1) -> List[UnifiedEvent]:
        events = []
        for _ in range(num_events):
            self.base_time += timedelta(seconds=random.randint(1, 300))
            
            # Decide attack type
            if random.random() < 0.6:
                attack_type = "Normal"
            else:
                attack_type = random.choice([a for a in self.ATTACK_TYPES if a != "Normal"])
            
            # Decide success
            is_successful = False
            if attack_type != "Normal" and random.random() < success_ratio:
                is_successful = True
            
            path, payload, method = self._generate_payload(attack_type, is_successful)
            
            # Response simulation
            if is_successful:
                status_code = 200
                resp_size = random.randint(5000, 50000) # Big leak
            elif attack_type == "Normal":
                status_code = 200
                resp_size = random.randint(100, 2000)
            else:
                status_code = random.choice([403, 404, 500])
                resp_size = random.randint(0, 500)

            event = UnifiedEvent(
                event_id=str(uuid.uuid4()),
                timestamp=self.base_time,
                source_ip=f"192.168.1.{random.randint(1, 20)}",
                method=method,
                url=path,
                user_agent=random.choice(self.USER_AGENTS),
                headers={"Host": "example.com"},
                payload=payload if method == "POST" else None,
                status_code=status_code,
                response_size=resp_size,
                attack_type=attack_type,
                is_successful=is_successful
            )
            events.append(event)
            
        return events

def generate_and_save(output_path: str, count: int = 100, fmt: str = "csv"):
    gen = SyntheticLogGenerator()
    events = gen.generate_events(count)
    
    if fmt == "csv":
        import pandas as pd
        df = pd.DataFrame([e.model_dump() for e in events])
        df.to_csv(output_path, index=False)
    elif fmt == "json":
        with open(output_path, 'w') as f:
            json.dump([e.model_dump(mode='json') for e in events], f, indent=2)
    
    print(f"Generated {count} events to {output_path}")

if __name__ == "__main__":
    import sys
    # Usage: python -m src.generation.synthetic data.csv 200
    if len(sys.argv) > 2:
        generate_and_save(sys.argv[1], int(sys.argv[2]))
    else:
        generate_and_save("synthetic_data.csv", 50)
