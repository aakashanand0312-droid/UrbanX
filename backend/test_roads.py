
from app.connectors.traffic import fetch_road_details
from app.road_service import store_road_segments

print("Fetching Chandigarh road details...")

roads = fetch_road_details()

print(f"Retrieved {len(roads)} road segments")

print("Importing into MySQL...")

saved = store_road_segments(roads)

print(f"Successfully processed: {saved} road segments")
