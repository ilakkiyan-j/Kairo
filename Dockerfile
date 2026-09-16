FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies
COPY agent/requirements.txt ./agent/requirements.txt
RUN pip install --no-cache-dir -r agent/requirements.txt

# Copy application files and data
COPY agent/ ./agent/
COPY data/ ./data/
COPY .env ./

ENV PYTHONUNBUFFERED=1

CMD ["python", "agent/agent.py", "start"]
