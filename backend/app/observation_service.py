
from app.database import SessionLocal
from app.models import Observation
from app.schemas import UrbanObservation, Location


def to_schema(record):
    location = None

    if record.latitude is not None and record.longitude is not None:
        location = Location(
            latitude=record.latitude,
            longitude=record.longitude
        )

    return UrbanObservation(
        id=record.id,
        city_id=record.city_id,
        domain=record.domain,
        metric=record.metric,
        value=record.value,
        unit=record.unit,
        observed_at=record.observed_at,
        location=location,
        source_id=record.source_id,
        data_type=record.data_type,
        confidence=record.confidence
    )


def store_observation(observation: UrbanObservation):
    db = SessionLocal()

    try:
        record = Observation(
            id=observation.id,
            city_id=observation.city_id,
            domain=observation.domain,
            metric=observation.metric,
            value=observation.value,
            unit=observation.unit,
            observed_at=observation.observed_at,
            latitude=observation.location.latitude if observation.location else None,
            longitude=observation.location.longitude if observation.location else None,
            source_id=observation.source_id,
            data_type=observation.data_type,
            confidence=observation.confidence
        )

        saved_record = db.merge(record)
        db.commit()
        db.refresh(saved_record)

        return to_schema(saved_record)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def store_observations(observations):
    return [store_observation(observation) for observation in observations]


def get_all_observations():
    db = SessionLocal()

    try:
        records = db.query(Observation).all()
        return [to_schema(record) for record in records]
    finally:
        db.close()


def get_observations_by_domain(domain):
    db = SessionLocal()

    try:
        records = db.query(Observation).filter(
            Observation.domain == domain
        ).all()

        return [to_schema(record) for record in records]
    finally:
        db.close()
