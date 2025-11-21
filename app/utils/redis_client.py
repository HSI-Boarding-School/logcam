import os
import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client: redis.Redis | None = None

def get_redis() -> redis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    return redis_client
