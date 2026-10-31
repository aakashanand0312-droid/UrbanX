
from app.database import SessionLocal
from app.models import RoadSegment


def store_road_segments(roads, batch_size=1000):
    db = SessionLocal()
    total_saved = 0

    try:
        for start in range(0, len(roads), batch_size):
            batch = roads[start:start + batch_size]

            records = [
                RoadSegment(
                    road_id=road["road_id"],
                    road_name=road["road_name"],
                    road_type=road["road_type"],
                    length_meters=road["length_meters"],
                    latitude=road["latitude"],
                    longitude=road["longitude"],
                    source=road["source"],
                    retrieved_at=road["retrieved_at"]
                )
                for road in batch
            ]

            db.bulk_save_objects(records)
            db.commit()

            total_saved += len(records)
            print(f"Saved {total_saved}/{len(roads)} road segments")

        return total_saved

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
