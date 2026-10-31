
import osmnx as ox
import pandas as pd
from datetime import datetime, timezone

CHANDIGARH = "Chandigarh, India"


def fetch_road_network():
    """Fetch Chandigarh's drivable road network."""
    return ox.graph_from_place(
        CHANDIGARH,
        network_type="drive"
    )


def fetch_road_details():
    """Extract detailed road infrastructure information."""

    graph = fetch_road_network()

    edges = ox.graph_to_gdfs(
        graph,
        nodes=False,
        edges=True
    )

    roads = []

    for index, road in edges.iterrows():

        midpoint = road.geometry.interpolate(
            0.5,
            normalized=True
        )

        road_type = road.get("highway", "unknown")

        if isinstance(road_type, list):
            road_type = road_type[0]

        road_name = road.get("name")

        # Handle list-valued names before checking missing values.
        if isinstance(road_name, list):
            valid_names = [
                str(name) for name in road_name
                if not pd.isna(name)
            ]
            road_name = ", ".join(valid_names) if valid_names else None

        elif pd.isna(road_name):
            road_name = None

        roads.append({
            "road_id": f"osm-road-{index[0]}-{index[1]}-{index[2]}",
            "road_name": str(road_name) if road_name is not None else None,
            "road_type": str(road_type),
            "length_meters": float(road["length"]),
            "latitude": float(midpoint.y),
            "longitude": float(midpoint.x),
            "source": "openstreetmap",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        })

    return roads
