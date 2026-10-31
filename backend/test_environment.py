import asyncio

from app.connectors.environment import fetch_environment_observations
from app.observation_service import store_observations
from app.schemas import UrbanObservation


async def main():
    raw_observations = await fetch_environment_observations()

    observations = [
        UrbanObservation(**observation)
        for observation in raw_observations
    ]

    saved = store_observations(observations)

    print(f"\nEnvironmental observations fetched: {len(observations)}")
    print(f"Environmental observations stored: {len(saved)}")


if __name__ == "__main__":
    asyncio.run(main())