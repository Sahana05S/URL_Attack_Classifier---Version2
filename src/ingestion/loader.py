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
            import uuid
            for _, row in df.iterrows():
                # Filter out NaN/None
                data = row.where(pd.notnull(row), None).to_dict()
                
                # Ensure required fields have defaults if missing in CSV
                if not data.get('event_id'):
                    data['event_id'] = str(uuid.uuid4())
                if not data.get('method'):
                    data['method'] = 'GET'
                if not data.get('user_agent'):
                    data['user_agent'] = 'Unknown'
                if 'response_size' not in data:
                    data['response_size'] = 0
                else:
                    try:
                        data['response_size'] = int(float(data['response_size']))
                    except:
                        data['response_size'] = 0

                if 'status_code' not in data:
                    data['status_code'] = 200
                else:
                    try:
                        data['status_code'] = int(float(data['status_code']))
                    except:
                        data['status_code'] = 200

                # Ensure headers is a dict
                if isinstance(data.get('headers'), str):
                    try:
                        data['headers'] = ast.literal_eval(data['headers'])
                    except:
                        data['headers'] = {}
                
                if not isinstance(data.get('headers'), dict):
                    data['headers'] = {}
                
                # Ensure rule_hits is a list
                if isinstance(data.get('rule_hits'), str):
                    try:
                        data['rule_hits'] = ast.literal_eval(data['rule_hits'])
                    except:
                        data['rule_hits'] = []
                
                if not isinstance(data.get('rule_hits'), list):
                    data['rule_hits'] = []

                # Ensure confidence is float
                try:
                    data['confidence'] = float(data.get('confidence', 0.0))
                except:
                    data['confidence'] = 0.0

                # Ensure labels have defaults if missing (will be filled by ML in main.py)
                if not data.get('attack_type'):
                    data['attack_type'] = "Analyzing..."
                
                if data.get('is_successful') is None:
                    data['is_successful'] = False

                events.append(UnifiedEvent(**data))
            return events
        except Exception as e:
            print(f"Error loading CSV {path}: {e}")
            import traceback
            traceback.print_exc()
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
