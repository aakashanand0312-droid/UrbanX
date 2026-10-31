
from datetime import datetime, timezone

from app.database import SessionLocal
from app.models import Observation, RoadSegment
from app.geospatial_service import calculate_distance


# 1. Calculate observation freshness
def calculate_freshness(observed_at, max_age_minutes):
    now = datetime.now(timezone.utc)

    if observed_at.tzinfo is None:
        observed_at = observed_at.replace(tzinfo=timezone.utc)

    age_minutes = (
        now - observed_at
    ).total_seconds() / 60

    if age_minutes <= max_age_minutes:
        status = "fresh"
    elif age_minutes <= max_age_minutes * 3:
        status = "stale"
    else:
        status = "expired"

    return {
        "status": status,
        "age_minutes": round(age_minutes, 1),
        "max_age_minutes": max_age_minutes
    }


# 2. Retrieve the latest observation for each metric
def get_latest_observations(db, domain):
    observations = (
        db.query(Observation)
        .filter(
            Observation.domain == domain,
            Observation.city_id == "chandigarh"
        )
        .order_by(Observation.observed_at.desc())
        .all()
    )

    latest_by_metric = {}

    for observation in observations:
        if observation.metric not in latest_by_metric:
            latest_by_metric[observation.metric] = observation

    return list(latest_by_metric.values())


# 3. Unified urban analysis
def analyze_urban_conditions(
    latitude=30.7333,
    longitude=76.7794,
    radius_km=1.0
):
    db = SessionLocal()

    try:
        # Retrieve weather and environmental observations
        weather = get_latest_observations(db, "weather")
        environment = get_latest_observations(db, "environment")

        # Find nearby road infrastructure
        roads = db.query(RoadSegment).all()

        nearby_roads = []

        for road in roads:
            distance = calculate_distance(
                latitude,
                longitude,
                road.latitude,
                road.longitude
            )

            if distance <= radius_km:
                nearby_roads.append({
                    "road_id": road.road_id,
                    "road_name": road.road_name,
                    "road_type": road.road_type,
                    "length_meters": road.length_meters,
                    "distance_km": round(distance, 4)
                })

        # Group roads by classification
        road_breakdown = {}

        for road in nearby_roads:
            road_type = road["road_type"]

            if road_type not in road_breakdown:
                road_breakdown[road_type] = {
                    "segment_count": 0,
                    "total_length_meters": 0.0
                }

            road_breakdown[road_type]["segment_count"] += 1
            road_breakdown[road_type]["total_length_meters"] += (
                road["length_meters"]
            )

        # Serialize observations and calculate freshness
        def serialize_observations(observations, max_age_minutes):
            results = []

            for observation in observations:
                freshness = calculate_freshness(
                    observation.observed_at,
                    max_age_minutes
                )

                results.append({
                    "id": observation.id,
                    "metric": observation.metric,
                    "value": observation.value,
                    "unit": observation.unit,
                    "observed_at": observation.observed_at.isoformat(),
                    "source": observation.source_id,
                    "data_type": observation.data_type,
                    "latitude": observation.latitude,
                    "longitude": observation.longitude,
                    "freshness": freshness
                })

            return results

        # Weather: 60-minute freshness threshold
        weather_data = serialize_observations(weather, 60)

        # Environment: 120-minute freshness threshold
        environment_data = serialize_observations(environment, 120)

        # Identify the newest observation timestamp
        timestamps = [
            item["observed_at"]
            for item in weather_data + environment_data
        ]

        latest_timestamp = max(timestamps) if timestamps else None
                # Count freshness statuses across all observations
        all_observations = weather_data + environment_data

        freshness_summary = {
            "fresh": 0,
            "stale": 0,
            "expired": 0
        }

        for observation in all_observations:
            status = observation["freshness"]["status"]
            freshness_summary[status] += 1
        # Build the unified urban snapshot
        return {
            "city": "Chandigarh",

            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),

            "analysis_location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            },

                        "data_summary": {
                "weather_observations": len(weather_data),
                "environment_observations": len(environment_data),
                "nearby_road_segments": len(nearby_roads),
                "latest_observation_timestamp": latest_timestamp,
                "freshness_summary": freshness_summary
            },

            "domains": {
                "weather": weather_data,

                "environment": environment_data,

                "infrastructure": {
                    "nearby_road_segments": len(nearby_roads),

                    "road_type_breakdown": [
                        {
                            "road_type": road_type,
                            "segment_count": values["segment_count"],
                            "total_length_meters": round(
                                values["total_length_meters"], 2
                            )
                        }
                        for road_type, values in road_breakdown.items()
                    ]
                }
            },

            "data_quality": {
                "traffic_data_available": False,

                "traffic_data_note": (
                    "Live traffic observations are not currently integrated."
                ),

                "spatial_analysis_note": (
                    "Road proximity is calculated using segment midpoints. "
                    "It does not establish weather or environmental impact."
                ),

                "timestamp_note": (
                    "Observations are returned with their individual "
                    "timestamps; they are not assumed to be simultaneous."
                )
            }
        }

    finally:
        db.close()
