from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class UnifiedEvent(BaseModel):
    """
    Unified Schema for Security Events (Ingested or Generated).
    """
    event_id: str = Field(..., description="Unique ID for the event")
    timestamp: datetime = Field(..., description="Time of the event")
    source_ip: str = Field(..., description="Source IP address")
    method: str = Field(..., description="HTTP Method (GET, POST, etc.)")
    url: str = Field(..., description="Full Request URL")
    user_agent: str = Field(default="Unknown", description="User Agent String")
    headers: Dict[str, str] = Field(default_factory=dict, description="Request Headers")
    payload: Optional[str] = Field(None, description="Request Body/Payload")
    
    # Response attributes (used for success labeling)
    status_code: int = Field(..., description="HTTP Response Status Code")
    response_size: int = Field(..., description="Size of the response in bytes")
    
    # Labels / Analytics
    attack_type: str = Field(..., description="Attack Class (e.g., 'SQLi', 'Normal')")
    is_successful: bool = Field(False, description="Whether the attack was successful (True/False)")
    confidence: float = Field(0.0, description="Model confidence score (0.0 - 1.0)")
    rule_hits: list[str] = Field(default_factory=list, description="List of rule names that triggered")
