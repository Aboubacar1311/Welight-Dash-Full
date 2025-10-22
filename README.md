# Welight Dashboard - Architecture & Setup Guide

This document outlines the steps to set up and run the full-stack Welight Dashboard application, which includes a React frontend and a Python/Django backend.

## Architecture

```
+----------------+      +-----------------------+      +---------------------+
| React Frontend | <=>  |   Django Backend API  | <=>  | Data Warehouse (DWH)|
| (Browser)      |      | (localhost:8000)      |      | (MySQL, etc.)       |
+----------------+      +-----------------------+      +---------------------+
```

- **Frontend**: A React application that provides the user interface.
- **Backend**: A Django REST Framework API that securely connects to the Data Warehouse, executes SQL queries, and serves the data as JSON to the frontend.

---

## 1. Backend Setup (Python / Django)

The backend is located in the `backend/` directory.

### Prerequisites

- Python 3.8+
- `pip` (Python package installer)

### Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file inside the `backend/` directory by copying the example file.
    ```bash
    cp .env.example .env
    ```
    Now, edit the `.env` file and fill in your Data Warehouse connection details:
    ```
    # backend/.env
    DB_HOST=your_dwh_host
    DB_USER=your_dwh_username
    DB_PASSWORD=your_dwh_password
    DB_DATABASE=your_dwh_database
    DB_PORT=3306
    ```

### Running the Backend Server

1.  From the `backend/` directory (with your virtual environment activated), run the Django development server:
    ```bash
    python manage.py runserver
    ```

2.  The backend API will now be running at `http://127.0.0.1:8000`. You can test an endpoint by visiting `http://127.0.0.1:8000/api/commercial-data/` in your browser.

---

## 2. Frontend Setup (React)

The frontend is located in the root directory.

### Prerequisites

- A running instance of the backend server (see above).
- The development environment where you are running this application.

### Running the Frontend

1.  Open a **new terminal** (leave the backend server running in the first one).
2.  The frontend should start automatically in your development environment. If you were running this locally, you would typically run `npm install` and `npm start`.

The frontend is configured to make API calls to `http://localhost:8000`, so it's crucial that the backend server is running for the dashboard to be populated with data.
