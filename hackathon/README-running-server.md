# Running DataMatch Server

This document explains how to run the DataMatch dating platform server.

## Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)

## Installation Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment:**
   
   The `.env` file is already created with default values. No changes needed for local testing.

3. **Start the server:**

   ```bash
   npm run dev
   ```

   This will start the server on port 3001.

## Demo Accounts

The server automatically creates demo accounts with the following credentials:

1. **Demo User**
   - Email: demo@example.com
   - Password: password123

2. **Alex**
   - Email: alex@example.com
   - Password: password123

3. **Jordan**
   - Email: jordan@example.com
   - Password: password123

4. **Taylor**
   - Email: taylor@example.com
   - Password: password123

5. **Morgan**
   - Email: morgan@example.com
   - Password: password123

## Accessing the Application

Once the server is running, you can access the application in two ways:

1. **With Server Connection:**
   - Open your web browser and navigate to: http://localhost:3001
   - This will access the application using the backend server

2. **Demo Mode (No Server Required):**
   - Open any HTML file directly from the file system
   - The application will run in demo mode with mock data

## Using the API

The API endpoints are available at `http://localhost:3001/api`. Here are some examples:

- Register a new user: `POST /api/users/register`
- Login: `POST /api/users/login`
- Get profile: `GET /api/users/profile`
- Get potential matches: `GET /api/matches/potential`
- Like a user: `POST /api/matches/like/:userId`
- Get matches: `GET /api/matches/matches`

## Notes

- The server uses a file-based JSON database located in the `/db` directory.
- No MongoDB connection is required.
- User passwords are securely hashed using bcrypt.
- User authentication is handled with JWT tokens.