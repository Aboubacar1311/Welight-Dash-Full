# Welight Dashboard - Architecture & Setup Guide

This document outlines the steps to set up and run the full-stack Welight Dashboard application, which includes a React frontend and a Python/Django backend.

## Architecture

```
+----------------+      +-----------------------+      +---------------------+
| React Frontend | <=>  |   Django Backend API  | <=>  | Data Warehouse (DWH)|
| (Browser)      |      | (localhost:8000)      |      | (MySQL, etc.)       |
+----------------+      +-----------------------+      +---------------------+
```

- **Frontend**: A React application built with TypeScript that provides the user interface.
- **Backend**: A Django REST Framework API that securely connects to the Data Warehouse, executes SQL queries, and serves the data as JSON to the frontend.

---

## Local Development Setup

Follow these steps to set up the project on your local machine.

### Prerequisites

- **Git**: For cloning the repository.
- **Python 3.8+** and `pip`: For the backend server.
- **Node.js LTS** and `npm`: For the frontend application.

### 1. Clone the Repository

First, clone the project repository to your local machine and navigate into the project directory.

```bash
git clone <your-repository-url>
cd welight-dashboard
```

---

### 2. Backend Setup (Python / Django)

The backend is located in the `backend/` directory. All commands below should be run from within this directory.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Create the environment
    python -m venv venv

    # Activate it (on macOS/Linux)
    source venv/bin/activate
    
    # On Windows, use:
    # venv\Scripts\activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file by copying the example. This file will store your database credentials securely.
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

---

### 3. Frontend Setup (React)

The frontend is located in the root directory.

1.  **Navigate to the project's root directory** (if you are in the `backend` folder, go back one level).
    ```bash
    cd ..
    ```

2.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

---

## Running the Application

To run the full application, you will need two separate terminal windows: one for the backend and one for the frontend.

### 1. Start the Backend Server

-   Open your first terminal.
-   Navigate to the `backend/` directory and ensure your virtual environment is activated.
-   Run the Django development server:

    ```bash
    # Navigate to the backend folder
    cd backend

    # Make sure your virtual environment is active
    source venv/bin/activate

    # Start the server
    python manage.py runserver
    ```
-   The backend API will now be running at **`http://127.0.0.1:8000`**.

### 2. Start the Frontend Application

-   Open a **new terminal** (leave the backend server running).
-   Navigate to the project's root directory.
-   Run the React development server:

    ```bash
    # This command starts the frontend application
    npm start
    ```
-   The frontend will open automatically in your browser, usually at **`http://localhost:3000`**. It is configured to make API calls to the backend server you started in the first step.
