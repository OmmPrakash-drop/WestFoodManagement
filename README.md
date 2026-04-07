# Food Surplus Management System

A full-stack web application designed to bridge the gap between food surplus and food scarcity. It provides a dedicated platform connecting Restaurants (who have surplus food) with NGOs (who need food to distribute).

## Features

- **Role-Based Access Control:** Distinct workflows and dashboards for Restaurants, NGOs, and Administrators.
- **Admin Verification:** Restaurants and NGOs must upload official documents during registration, subject to Admin approval before they can post or request food.
- **Surplus Food Posting:** Authorized restaurants can seamlessly post details about their available surplus food.
- **Food Requests:** NGOs can view available food listings and send requests to pick them up.
- **Real-time Status Tracking:** Track the lifecycle of food (e.g., requested, approved, picked up).
- **Email Notifications:** Users are notified dynamically about account approvals, rejections, and request updates.
- **Location Support:** Interactive maps to guide NGOs to pickup locations.

## Tech Stack

### Frontend (`food-surplus-client`)
- **Framework:** React.js powered by Vite
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Backend (`food-surplus-node-api`)
- **Runtime & Framework:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Uploads:** multer (for verification documents)
- **Email Services:** Nodemailer
- **Security:** Helmet, express-rate-limit, xss-clean, hpp, cors

## Project Structure

```text
├── food-surplus-client/     # React frontend application
├── food-surplus-node-api/   # Node.js/Express backend API
└── Pre Project.txt          # Initial project requirements
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server

### 1. Database Setup
Ensure you have MySQL running locally and create relatively empty database named `food_surplus_db`. The Sequelize ORM will automatically handle table creation upon running the server.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd food-surplus-node-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables by creating/editing the `.env` file:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=food_surplus_db
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd food-surplus-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```

## Application Access
- **Frontend App:** [http://localhost:5173/](http://localhost:5173/)
- **Backend API:** [http://localhost:5000/](http://localhost:5000/)

## Testing Credentials
To access the Admin Panel, you can use the following default credentials in a development environment:
- **Username:** `admin`
- **Password:** `admin123`
