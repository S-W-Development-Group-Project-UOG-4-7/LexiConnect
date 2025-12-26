import requests

# Test registration from frontend perspective
url = "http://127.0.0.1:8000/auth/register"
headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:5174"
}
data = {
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "testpassword",
    "role": "client"
}

try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 201:
        print("Registration successful!")
    else:
        print("Registration failed!")
except Exception as e:
    print(f"Error: {e}")
