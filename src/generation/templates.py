import csv
import sys

def generate_csv_template(output_path: str = "template.csv"):
    """
    Generates a CSV template matching the Unified Event Schema.
    """
    headers = [
        "event_id", "timestamp", "source_ip", "method", "url", 
        "user_agent", "headers", "payload", "status_code", 
        "response_size", "attack_type", "is_successful"
    ]
    
    example_row = [
        "evt_001", "2023-10-27T10:00:00", "192.168.1.5", "GET", "http://example.com/login?user=admin",
        "Mozilla/5.0", "{}", "", "200", "1500", "Normal", "False"
    ]
    
    try:
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerow(example_row)
        print(f"Successfully generated CSV template at: {output_path}")
    except Exception as e:
        print(f"Error generating template: {e}")

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "template.csv"
    generate_csv_template(path)
