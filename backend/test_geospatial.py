
from app.geospatial_service import (
    find_nearby_roads,
    find_roads_near_weather
)

# Test 1: Find roads near a Chandigarh coordinate
print("\n--- Nearby Road Test ---")

result = find_nearby_roads(
    latitude=30.7333,
    longitude=76.7794,
    radius_km=1.0,
    limit=10
)

print("Roads found:", result["total_found"])

for road in result["roads"][:5]:
    print(
        road["road_name"],
        "|",
        road["road_type"],
        "|",
        road["distance_km"],
        "km"
    )


# Test 2: Find roads near a stored weather observation
print("\n--- Weather-to-Road Test ---")

weather_id = "open-meteo-temperature-2026-10-30T10:45"

weather_result = find_roads_near_weather(
    weather_observation_id=weather_id,
    radius_km=1.0,
    limit=10
)

if weather_result:
    print("Nearby roads:", weather_result["total_found"])
else:
    print("Weather observation not found or has no location")
