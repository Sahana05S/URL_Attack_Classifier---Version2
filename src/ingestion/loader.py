import pandas as pd
import json
from typing import List
from src.schema.events import UnifiedEvent

class DataLoader:
    """
    Ingests data from CSV/JSON into UnifiedEvent objects.
    """
    
    @staticmethod
    def load_csv(path: str) -> List[UnifiedEvent]:
        try:
            df = pd.read_csv(path)
            # Ensure timestamps are parsed
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            events = []
            import ast
            for _, row in df.iterrows():
                # Filter out NaN/None to avoid Pydantic errors if optional
                data = row.where(pd.notnull(row), None).to_dict()
                
                # Parse headers if it's a string (CSV serialization)
                if isinstance(data.get('headers'), str):
                    try:
                        data['headers'] = ast.literal_eval(data['headers'])
                    except:
                        data['headers'] = {}
                
                # Parse rule_hits if it's a string
                if isinstance(data.get('rule_hits'), str):
                    try:
                        data['rule_hits'] = ast.literal_eval(data['rule_hits'])
                    except:
                        data['rule_hits'] = []

                events.append(UnifiedEvent(**data))
            return events
        except Exception as e:
            print(f"Error loading CSV {path}: {e}")
            return []

    @staticmethod
    def load_json(path: str) -> List[UnifiedEvent]:
        try:
            with open(path, 'r') as f:
                data = json.load(f)
            return [UnifiedEvent(**item) for item in data]
        except Exception as e:
            print(f"Error loading JSON {path}: {e}")
            return []
