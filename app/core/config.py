import os
from dotenv import load_dotenv

load_dotenv()

ORIGINS = [o for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o]
ALLOW_ALL = len(ORIGINS) == 0
