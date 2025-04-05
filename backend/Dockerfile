FROM node:23 AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --build-from-source

# Specifically rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Second stage
FROM node:23

WORKDIR /app

# Copy built node modules and other files
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Install TypeScript globally
RUN npm install -g typescript ts-node

EXPOSE 3002

CMD ["ts-node", "index.ts"]