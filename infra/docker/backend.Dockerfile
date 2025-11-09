FROM python:3.10-slim

# Avoid Python writing .pyc files and ensure unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps needed for dlib, OpenCV
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       cmake \
       libgl1 \
       libglib2.0-0 \
       libstdc++6 \
       libopenblas-dev \
       gfortran \
       pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (leverage docker layer caching + BuildKit cache)
COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy application code
COPY app ./app

EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
