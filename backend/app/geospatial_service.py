
from math import radians, sin, cos, sqrt, atan2

from app.database import SessionLocal
from app.models import RoadSegment, Observation


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two geographic coordinates.
    Returns distance in kilometers using the Haversine formula.
    """

    earth_radius = 6371.0

    lat1, lon1, lat2, lon2 = map(
        radians, [lat1, lon1, lat2, lon2]
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius * c


def find_nearby_roads(
    latitude,
    longitude,
    radius_km=1.0,
    limit=100
):
    """
    Find road segments within a radius of a coordinate.

    Uses road-segment midpoint coordinates.
    """

    db = SessionLocal()

    try:
        roads = db.query(RoadSegment).all()

        nearby = []

        for road in roads:
            distance = calculate_distance(
                latitude,
                longitude,
                road.latitude,
                road.longitude
            )

            if distance <= radius_km:
                nearby.append({
                    "road_id": road.road_id,
                    "road_name": road.road_name,
                    "road_type": road.road_type,
                    "length_meters": road.length_meters,
                    "latitude": road.latitude,
                    "longitude": road.longitude,
                    "distance_km": round(distance, 4)
                })

        nearby.sort(key=lambda road: road["distance_km"])

        return {
            "center": {
                "latitude": latitude,
                "longitude": longitude
            },
            "radius_km": radius_km,
            "total_found": len(nearby),
            "roads": nearby[:limit]
        }

    finally:
        db.close()


def find_roads_near_weather(
    weather_observation_id,
    radius_km=1.0,
    limit=100
):
    """
    Find roads near a stored weather observation.
    """

    db = SessionLocal()

    try:
        observation = db.query(Observation).filter(
            Observation.id == weather_observation_id
        ).first()

        if not observation:
            return None

        if observation.latitude is None or observation.longitude is None:
            return None

        latitude = observation.latitude
        longitude = observation.longitude

    finally:
        db.close()

    return find_nearby_roads(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        limit=limit
    )
