FROM node:23-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies and specifically rebuild bcrypt
RUN npm install && npm rebuild bcrypt --build-from-source

# Copy the rest of the app
COPY . .

# Install TypeScript globally
RUN npm install -g typescript ts-node

EXPOSE 3002

CMD ["ts-node", "index.ts"]