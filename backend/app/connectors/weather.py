from datetime import datetime, timezone
from urllib import response
from app.schemas import UrbanObservation, Location

import httpx

CHANDIGARH_LAT = 30.7333
CHANDIGARH_LON = 76.7794

WEATHER_URL = "https://api.open-meteo.com/v1/forecast"


async def fetch_current_weather():
    params = {
        "latitude": CHANDIGARH_LAT,
        "longitude": CHANDIGARH_LON,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "wind_speed_10m"
        ],
        "timezone": "UTC"
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(WEATHER_URL, params=params)
        if response.status_code == 429:
            print("Open-Meteo weather rate limit reached. Keeping previously stored data.")
            return {}

        response.raise_for_status()
        return response.json()


async def fetch_weather_observations():
    data = await fetch_current_weather()
    if not data:
        return []

    current = data["current"]
    observed_at = datetime.fromisoformat(
        current["time"]
    ).replace(tzinfo=timezone.utc)

    location = Location(
        latitude=data["latitude"],
        longitude=data["longitude"]
    )

    measurements = [
        ("temperature_2m", "temperature", "weather"),
        ("relative_humidity_2m", "relative_humidity", "weather"),
        ("precipitation", "rainfall", "weather"),
        ("wind_speed_10m", "wind_speed", "weather")
    ]

    observations = []

    for api_field, metric, domain in measurements:
        observations.append(
            UrbanObservation(
                id=f"open-meteo-{metric}-{current['time']}",
                city_id="chandigarh",
                domain=domain,
                metric=metric,
                value=current[api_field],
                unit=data["current_units"][api_field],
                observed_at=observed_at,
                location=location,
                source_id="open-meteo",
                data_type="live"
            )
        )

    return observations
