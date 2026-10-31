
from unittest import result

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models

from app.refresh_service import refresh_urban_data

from app.connectors.environment import fetch_environment_observations

from app.analytics_service import analyze_weather_road_proximity

from app.observation_service import get_observations_by_domain
from fastapi import FastAPI, Query, HTTPException

from app.urban_analytics_service import analyze_urban_conditions

from app.geospatial_service import (
    find_nearby_roads,
    find_roads_near_weather
)

from fastapi import Query
from sqlalchemy import func
from app.database import SessionLocal
from app.models import RoadSegment


from app.schemas import UrbanObservation
from app.connectors.weather import (
    fetch_current_weather,
    fetch_weather_observations
)
from app.observation_service import (
    store_observation,
    store_observations,
    get_all_observations,
    get_observations_by_domain
)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UrbanX API",
    description="Unified Urban Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "project": "UrbanX",
        "status": "running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "backend": "UrbanX API"
    }


# Submit one observation to central storage
@app.post("/api/observations")
def create_observation(observation: UrbanObservation):
    stored = store_observation(observation)

    return {
        "message": "Observation received",
        "observation": stored
    }


# Retrieve all stored observations
@app.get("/api/observations")
def get_observations():
    return get_all_observations()


# Fetch raw weather data
@app.get("/api/weather")
async def get_weather():
    try:
        weather = await fetch_current_weather()

        return {
            "city": "Chandigarh",
            "source": "Open-Meteo",
            "data_type": "live",
            "weather": weather
        }

    except Exception as e:
        return {
            "error": "Unable to fetch weather data",
            "details": str(e)
        }


# Fetch, normalize and store weather observations
@app.get("/api/weather/observations")
async def get_weather_observations():
    try:
        observations = await fetch_weather_observations()
        stored = store_observations(observations)

        return {
            "city": "Chandigarh",
            "source": "Open-Meteo",
            "count": len(stored),
            "observations": stored
        }

    except Exception as e:
        return {
            "error": "Unable to fetch weather observations",
            "details": str(e)
        }


# Retrieve all observations from central storage
@app.get("/api/observations/all")
def get_all_urban_observations():
    return get_all_observations()


# Retrieve observations belonging to a specific domain
@app.get("/api/observations/domain/{domain}")
def get_domain_observations(domain: str):
    return get_observations_by_domain(domain)



@app.get("/api/roads")
def get_roads(
    road_type: str | None = None,
    limit: int = Query(default=100, ge=1, le=5000),
    offset: int = Query(default=0, ge=0)
):
    db = SessionLocal()

    try:
        query = db.query(RoadSegment)

        if road_type:
            query = query.filter(
                RoadSegment.road_type == road_type
            )

        total = query.count()

        roads = query.offset(offset).limit(limit).all()

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "roads": [
                {
                    "road_id": road.road_id,
                    "road_name": road.road_name,
                    "road_type": road.road_type,
                    "length_meters": road.length_meters,
                    "latitude": road.latitude,
                    "longitude": road.longitude
                }
                for road in roads
            ]
        }

    finally:
        db.close()


@app.get("/api/roads/stats")
def get_road_stats():
    db = SessionLocal()

    try:
        results = (
            db.query(
                RoadSegment.road_type,
                func.count(RoadSegment.road_id).label("total"),
                func.sum(RoadSegment.length_meters).label("total_length")
            )
            .group_by(RoadSegment.road_type)
            .all()
        )

        return {
            "statistics": [
                {
                    "road_type": row.road_type,
                    "total_segments": row.total,
                    "total_length_meters": round(row.total_length or 0, 2)
                }
                for row in results
            ]
        }

    finally:
        db.close()


@app.get("/api/roads/types")
def get_road_types():
    db = SessionLocal()

    try:
        types = (
            db.query(RoadSegment.road_type)
            .distinct()
            .order_by(RoadSegment.road_type)
            .all()
        )

        return {
            "road_types": [row[0] for row in types]
        }

    finally:
        db.close()



@app.get("/api/geo/nearby-roads")
def nearby_roads(
    latitude: float,
    longitude: float,
    radius_km: float = Query(default=1.0, gt=0, le=10),
    limit: int = Query(default=100, ge=1, le=1000)
):
    return find_nearby_roads(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        limit=limit
    )


@app.get("/api/geo/weather-roads/{observation_id}")
def weather_nearby_roads(
    observation_id: str,
    radius_km: float = Query(default=1.0, gt=0, le=10),
    limit: int = Query(default=100, ge=1, le=1000)
):
    result = find_roads_near_weather(
        weather_observation_id=observation_id,
        radius_km=radius_km,
        limit=limit
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Weather observation not found or has no location"
        )

@app.get("/api/analytics/weather-road-proximity/{observation_id}")
def get_weather_road_analysis(
    observation_id: str,
    radius_km: float = Query(default=1.0, gt=0, le=10)
):
    result = analyze_weather_road_proximity(
        observation_id=observation_id,
        radius_km=radius_km
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Weather observation not found or location unavailable"
        )

    return result



@app.get("/api/environment")
async def get_environment():
    observations = await fetch_environment_observations()

    return {
        "city": "Chandigarh",
        "source": "Open-Meteo Air Quality",
        "data_type": "live",
        "observations": observations
    }

@app.get("/api/environment/stored")
def get_stored_environment():
    observations = get_observations_by_domain("environment")

    return {
        "domain": "environment",
        "total_observations": len(observations),
        "observations": observations
    }

@app.get("/api/analytics/urban-snapshot")
def get_urban_snapshot(
    latitude: float = Query(default=30.7333, ge=-90, le=90),
    longitude: float = Query(default=76.7794, ge=-180, le=180),
    radius_km: float = Query(default=1.0, gt=0, le=10)
):
    return analyze_urban_conditions(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km
    )

@app.post("/api/analytics/refresh")
async def refresh_urban_data_endpoint():
    try:
        result = await refresh_urban_data()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Urban data refresh failed: {str(e)}"
        )