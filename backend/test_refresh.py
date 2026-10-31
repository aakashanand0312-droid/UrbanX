import asyncio

from app.refresh_service import refresh_urban_data


async def main():
    print("Starting UrbanX data refresh...", flush=True)

    result = await refresh_urban_data()

    print("\nUrbanX data refresh result:", flush=True)
    print(result, flush=True)


if __name__ == "__main__":
    asyncio.run(main())
