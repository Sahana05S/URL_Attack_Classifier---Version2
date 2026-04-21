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
    
    # Labels / Analytics (Inferred by detection engine - NOT from user uploads)
    attack_type: str = Field(..., description="Detected Attack Class inferred by backend detection engine (e.g., 'SQLi', 'XSS', 'Normal')")
    is_successful: bool = Field(False, description="Whether the attack was inferred to be successful based on response analysis")
    confidence: float = Field(0.0, description="Detection confidence score (0.0 - 1.0, higher = more certain)")
    rule_hits: list[str] = Field(default_factory=list, description="Detection reasons explaining why this classification was made")
