# Local Execution Guide

This project consists of a Flask-based backend and a Vite/React-based frontend.

## 1. Backend Setup

The backend handles logic for product recommendations.

```bash
# Navigate to backend directory
cd backend

# Install dependencies (Flask, CORS support, and AWS SDK)
pip install flask flask-cors boto3

# Start the server (Using the Python Launcher for Windows)
py back2.py
```

- **URL**: [http://localhost:5000](http://localhost:5000)
- **Note**: If AWS credentials are not configured, the app will automatically fall back to using local data and default comments.

## 2. Frontend Setup

The frontend provides the user interface for selecting moods and viewing recommendations.

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

- **URL**: [http://localhost:3000](http://localhost:3000)
- **API Connection**: The frontend is configured to connect to the backend at `http://localhost:5000`.

## Troubleshooting

- **Python Command**: On 
this system, use `py` to run Python scripts if `python` refers to a launcher or placeholder.
- **Port Conflict**: If port 3000 or 5000 is already in use, you may need to stop the conflicting service or update the configuration.
