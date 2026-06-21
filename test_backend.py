import requests
import json

BASE_URL = "http://localhost:8000"

# Test 1: Register a user
print("Test 1: Registering a user...")
register_data = {
    "username": "test_engineer",
    "email": "engineer@test.com",
    "password": "testpass123",
    "user_type": "engineer"
}
response = requests.post(f"{BASE_URL}/register", json=register_data)
print(f"Register response: {response.status_code}")
if response.status_code == 200:
    print(f"User registered: {response.json()}")
else:
    print(f"Error: {response.text}")

# Test 2: Login to get token
print("\nTest 2: Logging in...")
login_data = {
    "username": "test_engineer",
    "password": "testpass123"
}
response = requests.post(f"{BASE_URL}/token", data=login_data)
print(f"Login response: {response.status_code}")
if response.status_code == 200:
    token_data = response.json()
    print(f"Token received: {token_data['token_type']}")
    token = token_data["access_token"]
else:
    print(f"Error: {response.text}")
    token = None

# Test 3: Get current user info
if token:
    print("\nTest 3: Getting current user info...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    print(f"User info response: {response.status_code}")
    if response.status_code == 200:
        print(f"User info: {response.json()}")

# Test 4: Upload an image
if token:
    print("\nTest 4: Uploading crack image...")
    try:
        with open("crack.jpg", "rb") as f:
            files = {"file": ("crack.jpg", f, "image/jpeg")}
            data = {"pixels_per_mm": "10.0"}
            response = requests.post(f"{BASE_URL}/upload", headers=headers, files=files, data=data)
            print(f"Upload response: {response.status_code}")
            if response.status_code == 200:
                print(f"Upload result: {response.json()}")
            else:
                print(f"Error: {response.text}")
    except FileNotFoundError:
        print("crack.jpg not found, skipping upload test")

# Test 5: Get upload history
if token:
    print("\nTest 5: Getting upload history...")
    response = requests.get(f"{BASE_URL}/history", headers=headers)
    print(f"History response: {response.status_code}")
    if response.status_code == 200:
        history = response.json()
        print(f"Upload history count: {len(history)}")
        if history:
            print(f"First upload: {history[0]}")
            upload_id = history[0]["id"]
            
            # Test 6: Get specific upload detail
            print(f"\nTest 6: Getting specific upload detail (ID: {upload_id})...")
            response = requests.get(f"{BASE_URL}/history/{upload_id}", headers=headers)
            print(f"Upload detail response: {response.status_code}")
            if response.status_code == 200:
                print(f"Upload detail: {response.json()}")

print("\nAll tests completed!")
