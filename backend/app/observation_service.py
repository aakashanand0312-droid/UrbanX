
from app.schemas import UrbanObservation

# Temporary in-memory storage
_observations: dict[str, UrbanObservation] = {}


def store_observation(observation: UrbanObservation):
    _observations[observation.id] = observation

    return observation


def store_observations(observations: list[UrbanObservation]):
    stored = []

    for observation in observations:
        stored.append(store_observation(observation))

    return stored


def get_all_observations():
    return list(_observations.values())


def get_observations_by_domain(domain: str):
    return [
        observation
        for observation in _observations.values()
        if observation.domain == domain
    ]
