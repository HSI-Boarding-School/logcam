import asyncio
from app.utils.redis_client import get_redis
from app.utils.cache_utils import seed_students_cache


async def startup_event():
    try:
        redis = get_redis()
        await redis.ping()
        print("✅ Redis connected")
    except Exception as e:
        print("⚠️ Redis not available:", e)
        redis = None

    try:
        await seed_students_cache()
        print("✅ Students cache seeded")
    except Exception as e:
        print("⚠️ Failed to seed students cache:", e)

    async def refresher():
        while True:
            try:
                await asyncio.sleep(300)
                await seed_students_cache()
                print("🔁 Students cache refreshed")
            except asyncio.CancelledError:
                break
            except Exception as e:
                print("⚠️ Cache refresh error:", e)
                await asyncio.sleep(3)

    from app.main import app
    app.state.cache_refresher_task = asyncio.create_task(refresher())
