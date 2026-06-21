# Crack Detection Backend API

FastAPI backend with SQLite for crack detection using YOLOv8 segmentation.

## Features

- User authentication with JWT tokens
- Three user types: engineer, home_owner, admin (all have same access control)
- Image upload endpoint for crack detection
- Automatic crack dimension measurement (length, width, area, angle, type)
- Upload history tracking per user
- SQLite database for persistence

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python backend.py
```

The server will start on `http://0.0.0.0:8000`

## API Endpoints

### Register User
- **POST** `/register`
- Body: `{"username": "string", "email": "string", "password": "string", "user_type": "engineer|home_owner|admin"}`
- Returns: User object with id, username, email, user_type

### Login
- **POST** `/token`
- Body: Form data with `username` and `password`
- Returns: `{"access_token": "string", "token_type": "bearer"}`

### Get Current User
- **GET** `/users/me`
- Headers: `Authorization: Bearer <token>`
- Returns: Current user info

### Upload Crack Image
- **POST** `/upload`
- Headers: `Authorization: Bearer <token>`
- Body: Multipart form with `file` (image) and `pixels_per_mm` (float, default 10.0)
- Returns: Upload object with crack dimensions:
  - `length_mm`: Crack length in millimeters
  - `avg_width_mm`: Average width in millimeters
  - `max_width_mm`: Maximum width in millimeters
  - `area_mm2`: Area in square millimeters
  - `angle_deg`: Orientation angle in degrees
  - `crack_type`: Type (horizontal, vertical, diagonal, shear)

### Get Upload History
- **GET** `/history`
- Headers: `Authorization: Bearer <token>`
- Returns: List of all uploads for current user (sorted by date desc)

### Get Specific Upload
- **GET** `/history/{upload_id}`
- Headers: `Authorization: Bearer <token>`
- Returns: Details of specific upload

## Example Usage

```python
import requests

# Register
requests.post("http://localhost:8000/register", json={
    "username": "engineer1",
    "email": "engineer@test.com",
    "password": "pass123",
    "user_type": "engineer"
})

# Login
response = requests.post("http://localhost:8000/token", data={
    "username": "engineer1",
    "password": "pass123"
})
token = response.json()["access_token"]

# Upload image
headers = {"Authorization": f"Bearer {token}"}
with open("crack.jpg", "rb") as f:
    files = {"file": ("crack.jpg", f, "image/jpeg")}
    data = {"pixels_per_mm": "10.0"}
    response = requests.post("http://localhost:8000/upload", headers=headers, files=files, data=data)
    print(response.json())

# Get history
response = requests.get("http://localhost:8000/history", headers=headers)
print(response.json())
```

## Database

SQLite database file: `crack_detect.db`

Tables:
- `users`: id, username, email, hashed_password, user_type, created_at
- `uploads`: id, user_id, image_path, length_mm, avg_width_mm, max_width_mm, area_mm2, angle_deg, crack_type, created_at

## Notes

- Images are stored in the `uploads/` directory
- The YOLOv8 model file should be present as `YOLOv8s.pt`
- Change the `SECRET_KEY` in `auth.py` for production use
- All user types currently have the same access control policies
