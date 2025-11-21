from app.utils.redis_client import get_redis
import asyncio

async def shutdown_event():
    from app.main import app

    task = getattr(app.state, "cache_refresher_task", None)
    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    try:
        redis = get_redis()
        await redis.close()
        await redis.wait_closed()
        print("✅ Redis closed")
    except Exception:
        pass
