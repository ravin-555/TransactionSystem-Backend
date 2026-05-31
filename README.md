# Transaction System Backend

Backend API for a secure transaction management platform built with Node.js, Express, MongoDB, and JWT authentication. This service handles user authentication, account operations, transaction processing, role-based authorization, and security mechanisms such as idempotency and rate limiting.

## Features

* User registration and login
* JWT authentication
* Refresh token mechanism using cookies
* Protected routes
* Role-based access control (Admin / User)
* Deposit functionality
* Withdraw functionality
* Transfer between users
* Transaction history
* Transaction details
* Transaction reversal (Admin only)
* Idempotency protection for financial operations
* Login rate limiting
* Global error handling
* Secure middleware architecture

---

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Cookie Parser
* Express Rate Limit

---

## Project Structure

```bash
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── config/
└── server.js
```

---



## Environment Variables

Create a `.env` file:

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_access_token_secret

JWT_REFRESH_SECRET=your_refresh_token_secret

FRONTEND_URL=http://localhost:5173
```

---

## API Routes

### Authentication

| Method | Route              | Description          |
| ------ | ------------------ | -------------------- |
| POST   | /api/auth/register | Register user        |
| POST   | /api/auth/login    | Login user           |
| POST   | /api/auth/refresh  | Refresh access token |
| POST   | /api/auth/logout   | Logout user          |
| GET    | /api/auth/user     | Get current user     |

---

### Transactions

| Method | Route                     | Description         |
| ------ | ------------------------- | ------------------- |
| POST   | /api/transaction/deposit  | Deposit funds       |
| POST   | /api/transaction/withdraw | Withdraw funds      |
| POST   | /api/transaction/transfer | Transfer funds      |
| GET    | /api/transaction/history  | Transaction history |
| GET    | /api/transaction/:id      | Transaction details |

---

### Admin Routes

| Method | Route                        | Description         |
| ------ | ---------------------------- | ------------------- |
| POST   | /api/transaction/:id/reverse | Reverse transaction |

---

## Security Features

### JWT Authentication

Short-lived access tokens are used for authenticated requests.

### Refresh Token System

Refresh tokens are stored in secure HTTP-only cookies and used to generate new access tokens.

### Rate Limiting

Limits repeated login attempts and reduces abuse.

### Idempotency Protection

Prevents duplicate financial transactions caused by repeated requests or accidental resubmissions.

### Role-based Access

Admin-only operations are protected through authorization middleware.

---

## Future Improvements

* Email verification
* OTP support
* Notification system
* Transaction analytics
* Multi-currency support
* Real-time updates with WebSockets

---

## Author

Bashudev Ghimire
