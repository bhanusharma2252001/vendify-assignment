# Base image
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the project
COPY . .

EXPOSE 3000

# Run database migrations automatically before start
CMD npx prisma migrate dev && npm run start:dev
