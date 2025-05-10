# DateMatch Dating Platform

A modern dating platform that matches users based on preferences and compatibility.

## Features

- User profile creation and management
- Advanced matching algorithm based on interests, age, and location
- Like/dislike system with mutual match notifications
- Secure authentication and data protection

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Frontend**: HTML, CSS, JavaScript (vanilla)

## Project Structure

```
├── src/
│   ├── models/        # Database models
│   ├── controllers/   # Request handlers
│   ├── services/      # Business logic
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   ├── config/        # Configuration files
│   └── app.js         # Express app setup
├── public/            # Static files
│   ├── css/           # Stylesheets
│   ├── js/            # Client-side JavaScript
│   ├── images/        # Images and icons
│   └── *.html         # HTML pages
└── package.json       # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dating-platform.git
   cd dating-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Make sure MongoDB is running on your machine
   - The default database name is `dating-app`

4. Configure environment variables:
   ```
   # The .env file is already created with default values
   # You can modify it as needed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application:
   - Open your browser and go to `http://localhost:3000`
   - The API endpoints are available at `http://localhost:3000/api`

## Pages

- **Home** (`/index.html`): Landing page with app information
- **Register** (`/register.html`): User registration form
- **Login** (`/login.html`): User login form
- **Discover** (`/discover.html`): Find and match with users
- **Matches** (`/matches.html`): View and manage matches

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get token

### User Profile
- `GET /api/users/profile` - Get current user's profile
- `PUT /api/users/profile` - Update user profile

### Matching
- `GET /api/matches/potential` - Get potential matches
- `POST /api/matches/like/:userId` - Like a user
- `POST /api/matches/dislike/:userId` - Dislike a user
- `GET /api/matches/matches` - Get all matches

## Matching Algorithm

The platform uses a compatibility scoring system based on:

1. **Shared Interests** (40%): Calculated using Jaccard similarity (intersection over union)
2. **Age Compatibility** (20%): Based on age preferences and age difference
3. **Location** (40%): Based on geographic proximity

The algorithm filters potential matches based on user preferences and then ranks them by compatibility score.

## Next Steps for Development

1. **Messaging System**: Implement real-time chat between matched users
2. **Photo Upload**: Add functionality for users to upload profile photos
3. **Geolocation**: Implement precise location-based matching using coordinates
4. **Enhanced Profiles**: Add more profile customization options
5. **Advanced Matching**: Improve the matching algorithm with machine learning
6. **Mobile App**: Develop a mobile application using React Native or Flutter

## License

MIT
