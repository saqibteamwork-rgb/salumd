FROM node:20-bullseye-slim

# Install system dependencies (ffmpeg is essential for WhatsApp stickers and audio/video conversions)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package descriptors first to take advantage of Docker layer caching
COPY package*.json ./

# Install all npm dependencies
RUN npm install

# Copy application source code
COPY . .

# Start the bot
CMD ["npm", "start"]
