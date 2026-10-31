import asyncio

from app.connectors.weather import fetch_weather_observations
from app.connectors.environment import fetch_environment_observations
from app.observation_service import store_observations
from app.schemas import UrbanObservation


def normalize_observations(raw_observations):
    observations = []

    for observation in raw_observations:
        if isinstance(observation, UrbanObservation):
            observations.append(observation)
        else:
            observations.append(UrbanObservation(**observation))

    return observations


async def refresh_urban_data():
    weather_raw, environment_raw = await asyncio.gather(
        fetch_weather_observations(),
        fetch_environment_observations()
    )

    weather = normalize_observations(weather_raw)
    environment = normalize_observations(environment_raw)

    all_observations = weather + environment
    saved = store_observations(all_observations)

    return {
        "status": "success",
        "weather_fetched": len(weather),
        "environment_fetched": len(environment),
        "total_fetched": len(all_observations),
        "total_stored": len(saved)
    }
