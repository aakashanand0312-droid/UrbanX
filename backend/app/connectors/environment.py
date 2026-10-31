import httpx
from datetime import datetime, timezone

CHANDIGARH_LAT = 30.7333
CHANDIGARH_LON = 76.7794

AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


async def fetch_current_environment():
    params = {
        "latitude": CHANDIGARH_LAT,
        "longitude": CHANDIGARH_LON,
        "current": [
            "pm10",
            "pm2_5",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
            "us_aqi",
            "european_aqi"
        ],
        "timezone": "UTC"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            AIR_QUALITY_URL,
            params=params
        )
        if response.status_code == 429:
            print("Open-Meteo air quality rate limit reached. Keeping previously stored data.")
            return []

        response.raise_for_status()
        return response.json()


async def fetch_environment_observations():
    data = await fetch_current_environment()

    current = data.get("current", {})
    observed_at = datetime.fromisoformat(
        current["time"]
    ).replace(tzinfo=timezone.utc)

    metrics = [
        ("pm2_5", "µg/m³"),
        ("pm10", "µg/m³"),
        ("carbon_monoxide", "µg/m³"),
        ("nitrogen_dioxide", "µg/m³"),
        ("sulphur_dioxide", "µg/m³"),
        ("ozone", "µg/m³"),
        ("us_aqi", "index"),
        ("european_aqi", "index")
    ]

    observations = []

    for metric, unit in metrics:
        value = current.get(metric)

        if value is None:
            continue

        observations.append({
            "id": f"open-meteo-{metric}-{current['time']}",
            "city_id": "chandigarh",
            "domain": "environment",
            "metric": metric,
            "value": float(value),
            "unit": unit,
            "observed_at": observed_at,
            "location": {
                "latitude": data["latitude"],
                "longitude": data["longitude"]
            },
            "source_id": "open-meteo-air-quality",
            "data_type": "live",
            "confidence": None
        })

    return observations