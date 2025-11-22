# DaraGhar Maila - Homestay Backend

A comprehensive backend API system for managing a homestay booking and administration platform. This project provides secure, scalable REST APIs for handling bookings, guest management, payments, reviews, and contact inquiries.

## About

DaraGhar Maila Backend is built to streamline the operations of a homestay business. It enables seamless booking management, guest communication, payment processing, and administrative tasks through a well-structured, secure API infrastructure.

## Features

- **Secure Admin Authentication** - Protected admin portal with JWT-based authentication
- **Booking Management** - Complete booking lifecycle from creation to confirmation
- **Guest Management** - Comprehensive guest information tracking and management
- **Payment Processing** - Track and manage payment transactions
- **Contact Management** - Handle customer inquiries and support requests
- **Review System** - Guest review submission and moderation system
- **Email Notifications** - Automated email confirmations and notifications

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service


## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Project Structure

```
homestay-backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── models/          # Database models
├── Routes/          # API routes
├── middleware/      # Custom middleware (auth, validation)
├── utils/           # Utility functions (email service)
└── server.js        # Application entry point
```

## Security Features

- Password encryption with bcrypt
- JWT token-based authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Environment variable protection

## License

ISC

## Author

Bhupesh Sharma

