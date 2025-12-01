# Malawi Water Point Inventory API Documentation

## Overview
Base URL: `http://localhost:3000`
Swagger UI: `http://localhost:3000/api`

## Endpoints

### 1. Get Nearest Water Points
Retrieves the 5 nearest water points to a given location.

- **URL:** `/api/nearest`
- **Method:** `GET`
- **Query Parameters:**
  - `lat` (required): Latitude of the center point.
  - `lon` (required): Longitude of the center point.
- **Response:** Array of water point objects.
  ```json
  [
    {
      "id": 123,
      "name": "Village Pump",
      "status": "functional",
      "district": "Lilongwe",
      "lat": -13.456,
      "lon": 33.123,
      "geom": {
        "type": "Point",
        "coordinates": [33.123, -13.456]
      },
      "distance": 150.5, // Distance in meters
      "route": "Route calculation requires pgRouting setup on roads table" // Placeholder
    }
  ]
  ```

### 2. Get Population in Buffer
Calculates the estimated population served within a 5km buffer of a point.
*Note: Currently uses a proxy calculation (water points count * 100) as population data is not yet integrated.*

- **URL:** `/api/pop-in-buffer`
- **Method:** `GET`
- **Query Parameters:**
  - `lat` (required): Latitude of the center point.
  - `lon` (required): Longitude of the center point.
- **Response:**
  ```json
  {
    "lat": -13.456,
    "lon": 33.123,
    "bufferRadius": 5000,
    "waterPointsCount": 12,
    "estimatedPopulation": 1200
  }
  ```

### 3. Get National and District Statistics
Retrieves aggregated statistics for water points.

- **URL:** `/api/stats`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "national": {
      "totalWaterPoints": 12500
    },
    "byDistrict": [
      {
        "district": "Lilongwe",
        "count": 1500
      },
      {
        "district": "Blantyre",
        "count": 1200
      }
      // ...
    ]
  }
  ```

### 4. Get All Water Points
Retrieves a list of water points (limited to 100).

- **URL:** `/api/water-points`
- **Method:** `GET`
- **Response:** Array of water point objects.

## Data Models

### WaterPoint
- `id`: Unique identifier
- `name`: Local name
- `status`: Operational status
- `district`: District name
- `lat`: Latitude
- `lon`: Longitude
- `geom`: GeoJSON geometry (Point)
