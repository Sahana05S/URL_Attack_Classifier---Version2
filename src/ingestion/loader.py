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

                # CRITICAL: Ignore pre-labeled columns from uploads
                # All detection will be performed by the backend detection engine
                # Set placeholder values that will be overwritten during upload processing
                data['attack_type'] = "Pending"      # Will be set by detection engine
                data['is_successful'] = False        # Will be inferred from response
                data['confidence'] = 0.0             # Will be set by detection engine
                data['rule_hits'] = []               # Will be populated by detection engine

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
            
            import uuid
            events = []
            for item in data:
                # Ensure required fields have defaults
                if not item.get('event_id'):
                    item['event_id'] = str(uuid.uuid4())
                if not item.get('method'):
                    item['method'] = 'GET'
                if not item.get('user_agent'):
                    item['user_agent'] = 'Unknown'
                if 'response_size' not in item:
                    item['response_size'] = 0
                if 'status_code' not in item:
                    item['status_code'] = 200
                if not isinstance(item.get('headers'), dict):
                    item['headers'] = {}
                
                # CRITICAL: Ignore pre-labeled columns from uploads
                # All detection will be performed by the backend detection engine
                item['attack_type'] = "Pending"      # Will be set by detection engine
                item['is_successful'] = False        # Will be inferred from response
                item['confidence'] = 0.0             # Will be set by detection engine
                item['rule_hits'] = []               # Will be populated by detection engine
                
                events.append(UnifiedEvent(**item))
            return events
        except Exception as e:
            print(f"Error loading JSON {path}: {e}")
            import traceback
            traceback.print_exc()
            return []
