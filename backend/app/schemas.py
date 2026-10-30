
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Location(BaseModel):
    latitude: float
    longitude: float


class UrbanObservation(BaseModel):
    id: str
    city_id: str = "chandigarh"

    domain: Literal[
        "traffic",
        "weather",
        "environment",
        "infrastructure"
    ]

    metric: str
    value: float
    unit: str

    observed_at: datetime
    location: Optional[Location] = None

    source_id: str

    data_type: Literal[
        "live",
        "historical",
        "demo",
        "simulated"
    ]

    confidence: Optional[float] = Field(
        default=None,
        ge=0,
        le=1
    )
