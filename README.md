# Project Setup Guide

steps  to set up and run the project locally using Docker.

##  Prerequisites

Make sure you have **Docker** and **Docker Compose** installed on your system.

##  Step 1: Start the Services

Run the following command:

```bash
docker compose up --build
```

This will build the Docker images and start all required containers.

##  Step 2: Seed the Database

After the containers are running, seed the database using Prisma:

```bash
docker exec -it nest_server npx prisma db seed
```

## Step 3: API Testing

You can now start hitting all API endpoints.

### Note 1

When using the **Create User** API, the **role id** is required. You can obtain the **role id** by calling the **Get Roles** API after logging in with the **Company Admin** user.

### Note 2

All the API endpoints can be found in the Postman collection which is present in the repo.

