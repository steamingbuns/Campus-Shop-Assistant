# Campus Shop Assistant

This project is a Campus Shop Assistant, a full-stack e-commerce application. It consists of a React frontend and a Node.js (Express) backend with a PostgreSQL database.

**Key Features:**
- User authentication (registration and login).
- Product browsing and searching.
- Shopping cart and checkout process.
- Order management for users and sellers.
- Seller dashboard for inventory and order management.
- User profiles.

## Setup and Running the Application

### Database Setup (PostgreSQL)

1.  **Install PostgreSQL:** Ensure you have PostgreSQL installed and running on your system.
2.  **Create a User:** Create a PostgreSQL user with appropriate permissions for the database.
3.  **Initialize Database Schema:**
    Navigate to the `backend` directory and run the following command to initialize the database schema:
    ```bash
    cd backend
    npm run db:init
    ```
    You should see a message like "Schema applied successfully." upon successful initialization.

#### Database Management Commands

After initial setup, you can use these commands to manage your database:

```bash
# Complete database rebuild with seed data (recommended for fresh start)
npm run db:reset-seed

# Reset database only (drop and recreate tables from schema)
npm run db:reset

# Seed data only (requires tables to exist)
npm run db:seed
```

**Seed Data Includes:**
- 5 test users (sellers)
- 5 product categories (Stationery, Books, Clothing, Electronics, Accessories)
- 32 sample products with varied descriptions

### Running the Application

1.  **Start the Backend Server:**
    From the `backend` directory, run:
    ```bash
    npm run dev
    ```
    The backend server will start on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    Navigate to the `frontend` directory and run:
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend application will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

## API Endpoints (cURL commands)

### User Routes (`/api/users`)

- **Register a new user:**
  ```bash
  curl -X POST http://localhost:5000/api/users/register -H "Content-Type: application/json" -d '{"username": "testuser", "password": "password", "email": "test@example.com", "user_type": "buyer"}'
  ```
- **Login a user:**
  ```bash
  curl -X POST http://localhost:5000/api/users/login -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "password"}'
  ```
- **Get user profile:** (Requires authentication token)
  ```bash
  curl -X GET http://localhost:5000/api/users/me -H "Authorization: Bearer <YOUR_TOKEN>"
  ```
- **Update user profile:** (Requires authentication token)
  ```bash
  curl -X PUT http://localhost:5000/api/users/me -H "Content-Type: application/json" -H "Authorization: Bearer <YOUR_TOKEN>" -d '{"username": "newusername"}'
  ```

### Product Routes (`/api/product`)

- **Get all products:**
  ```bash
  curl -X GET http://localhost:5000/api/product
  ```
- **Get a product by ID:**
  ```bash
  curl -X GET http://localhost:5000/api/product/1
  ```
- **Create a new product:** (Requires seller authentication token)
  ```bash
  curl -X POST http://localhost:5000/api/product -H "Content-Type: application/json" -H "Authorization: Bearer <YOUR_SELLER_TOKEN>" -d '{"name": "My Product", "description": "This is a great product.", "price": 19.99, "quantity": 100}'
  ```
- **Update a product:** (Requires seller authentication token)
  ```bash
  curl -X PUT http://localhost:5000/api/product/1 -H "Content-Type: application/json" -H "Authorization: Bearer <YOUR_SELLER_TOKEN>" -d '{"price": 24.99}'
  ```
- **Delete a product:** (Requires seller authentication token)
  ```bash
  curl -X DELETE http://localhost:5000/api/product/1 -H "Authorization: Bearer <YOUR_SELLER_TOKEN>"
  ```

### Order Routes (`/api/orders`)

- **Create a new order:** (Requires authentication token)
  ```bash
  curl -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer <YOUR_TOKEN>" -d '{"products": [{"product_id": 1, "quantity": 2}]}'
  ```
- **Get all orders for the logged-in user:** (Requires authentication token)
  ```bash
  curl -X GET http://localhost:5000/api/orders -H "Authorization: Bearer <YOUR_TOKEN>"
  ```
- **Get a specific order by ID:** (Requires authentication token)
  ```bash
  curl -X GET http://localhost:5000/api/orders/1 -H "Authorization: Bearer <YOUR_TOKEN>"
  ```
- **Update order status:** (Requires seller authentication token)
  ```bash
  curl -X PUT http://localhost:5000/api/orders/1/status -H "Content-Type: application/json" -H "Authorization: Bearer <YOUR_SELLER_TOKEN>" -d '{"status": "shipped"}'
  ```
