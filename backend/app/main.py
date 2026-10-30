
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
