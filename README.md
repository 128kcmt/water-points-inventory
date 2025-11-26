# Malawi Water Point Inventory Dashboard Backend

This is the backend for the Malawi Water Point Inventory Dashboard, built with NestJS, PostgreSQL, and PostGIS.

## Features

- **Nearest Water Points**: Find the 5 nearest water points to a given location.
- **Population in Buffer**: Calculate population (or water point count) within a 5km buffer.
- **Statistics**: Get national and district-level statistics.
- **Swagger Documentation**: Interactive API documentation available at `/api`.

## Prerequisites

- Node.js (v18+)
- PostgreSQL with PostGIS extension enabled
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd water_points_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Ensure your PostgreSQL database has PostGIS enabled:
   ```sql
   CREATE EXTENSION postgis;
   ```

4. Run the application:
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

Once the application is running, visit `http://localhost:3000/api` to view the Swagger documentation.

## Deployment

This project is configured for deployment on Render.com.

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Use the following settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. Add the environment variables defined in `.env` to the Render dashboard.

## Project Structure

- `src/water-points`: Module for water point related operations (nearest, buffer).
- `src/stats`: Module for statistical operations.
- `src/roads`: Module for road network (placeholder for routing).
- `src/adm`: Entities for administrative boundaries.

## License

UNLICENSED
