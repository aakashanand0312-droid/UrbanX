
from sqlalchemy import Column, String, Float, DateTime
from app.database import Base


class Observation(Base):
    __tablename__ = "observations"

    id = Column(String(100), primary_key=True, index=True)
    city_id = Column(String(100), nullable=False, default="chandigarh")
    domain = Column(String(50), nullable=False, index=True)
    metric = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(30), nullable=False)
    observed_at = Column(DateTime, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    source_id = Column(String(100), nullable=False)
    data_type = Column(String(30), nullable=False)
    confidence = Column(Float, nullable=True)



class RoadSegment(Base):
    __tablename__ = "road_segments"

    road_id = Column(String(150), primary_key=True)
    road_name = Column(String(255), nullable=True)
    road_type = Column(String(100), nullable=False)
    length_meters = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    source = Column(String(100), nullable=False)
    retrieved_at = Column(DateTime, nullable=False)
