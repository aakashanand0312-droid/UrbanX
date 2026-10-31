
from app.database import SessionLocal
from app.models import Observation, RoadSegment
from app.geospatial_service import calculate_distance


def analyze_weather_road_proximity(
    observation_id: str,
    radius_km: float = 1.0
):
    db = SessionLocal()

    try:
        # 1. Find the weather observation
        observation = db.query(Observation).filter(
            Observation.id == observation_id,
            Observation.domain == "weather"
        ).first()

        if not observation:
            return None

        if observation.latitude is None or observation.longitude is None:
            return None

        # 2. Retrieve road infrastructure
        roads = db.query(RoadSegment).all()

        # 3. Find roads within the selected radius
        nearby_roads = []

        for road in roads:
            distance = calculate_distance(
                observation.latitude,
                observation.longitude,
                road.latitude,
                road.longitude
            )

            if distance <= radius_km:
                nearby_roads.append((road, round(distance, 4)))

        # 4. Group nearby roads by road type
        breakdown = {}

        for road, distance in nearby_roads:
            road_type = road.road_type

            if road_type not in breakdown:
                breakdown[road_type] = {
                    "segment_count": 0,
                    "total_length_meters": 0.0
                }

            breakdown[road_type]["segment_count"] += 1
            breakdown[road_type]["total_length_meters"] += (
                road.length_meters
            )

        # 5. Format the breakdown
        road_type_breakdown = []

        for road_type, values in breakdown.items():
            road_type_breakdown.append({
                "road_type": road_type,
                "segment_count": values["segment_count"],
                "total_length_meters": round(
                    values["total_length_meters"], 2
                )
            })

        road_type_breakdown.sort(
            key=lambda item: item["segment_count"],
            reverse=True
        )

        # 6. Return nearby road locations for map highlighting
        nearby_road_locations = [
            {
                "road_id": road.road_id,
                "road_name": road.road_name,
                "road_type": road.road_type,
                "latitude": road.latitude,
                "longitude": road.longitude,
                "length_meters": road.length_meters,
                "distance_km": distance
            }
            for road, distance in nearby_roads
        ]

        # 7. Return the cross-domain analysis
        return {
            "weather_observation": {
                "id": observation.id,
                "metric": observation.metric,
                "value": observation.value,
                "unit": observation.unit,
                "observed_at": observation.observed_at.isoformat(),
                "source": observation.source_id,
                "data_type": observation.data_type,
                "location": {
                    "latitude": observation.latitude,
                    "longitude": observation.longitude
                }
            },
            "spatial_analysis": {
                "radius_km": radius_km,
                "nearby_road_segments": len(nearby_roads),
                "road_type_breakdown": road_type_breakdown,
                "total_stored_edge_length_meters": round(
                    sum(
                        road.length_meters
                        for road, distance in nearby_roads
                    ),
                    2
                ),
                "nearby_road_locations": nearby_road_locations
            },
            "interpretation": (
                "This analysis measures road infrastructure near "
                "the weather observation. It does not establish "
                "that weather caused traffic disruption."
            ),
            "length_measurement_note": (
                "Length is summed from stored OpenStreetMap graph edges. "
                "Opposite-direction edges may represent the same "
                "physical road geometry."
            )
        }

    finally:
        db.close()
