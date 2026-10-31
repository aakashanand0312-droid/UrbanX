
from app.connectors.traffic import fetch_traffic_observations
from app.observation_service import store_observations

print("Fetching Chandigarh road network...")

observations = fetch_traffic_observations()

print(f"Generated: {len(observations)} observations")

print("Saving observations to MySQL...")

saved = store_observations(observations)

print(f"Successfully saved: {len(saved)} observations")
