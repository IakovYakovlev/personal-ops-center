# 🔐 Identity Service (NestJS)

## 📋 Overview

The **Identity Service** is a centralized authentication and authorization microservice built with NestJS. It acts as the "Gatekeeper" for the entire Personal Ops Center ecosystem. The service is responsible for user management, password security, and issuing self-contained JWT tokens.

## 🚀 Key Features

- **User Management:** Registration and storage of user profiles.
- **Secure Auth:** Industry-standard password hashing using `bcrypt`.
- **JWT Issuance:** Generation of Access and Refresh tokens for seamless cross-platform interaction between NestJS and .NET services.
- **Data Validation:** Strict inbound data validation using `class-validator` and `class-transformer`.

## 🛠 Tech Stack

- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Passport.js & JWT Strategy
- **Language:** TypeScript

## 📂 Project Structure

- `src/auth`: Authentication logic, JWT strategies, and login/registration controllers.
- `src/users`: User entity management and database interactions.
- `prisma/`: Database schema definitions and migrations.

## 🚦 API Endpoints

| Method | Path                        | Description                                       | Access  |
| ------ | --------------------------- | ------------------------------------------------- | ------- |
| POST   | `/auth/register`            | Start user registration (send verification email) | Public  |
| GET    | `/auth/verify-registration` | Verify email and receive password                 | Public  |
| POST   | `/auth/login`               | Authenticate and receive JWT token                | Public  |
| GET    | `/auth/me`                  | Retrieve current user profile                     | Private |
| POST   | `/auth/logout`              | Logout and blacklist JWT token                    | Private |
| POST   | `/auth/forgot-password`     | Request password reset (send verification email)  | Public  |
| GET    | `/auth/verify-reset`        | Verify reset link and receive new password        | Public  |

## ⚙️ Setup and Installation

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. Environment Configuration: Create a `.env` file (based on .env.example) and provide the following:

- `DATABASE_URL`: PostgreSQL connection string.

- `JWT_SECRET`: Symmetric key for signing tokens.

- **Mailtrap Credentials:**
  - `MAIL_HOST`: `sandbox.smtp.mailtrap.io`
  - `MAIL_USER`: Your Mailtrap username.
  - `MAIL_PASS`: Your Mailtrap password.

3. Run Database Migrations:

```bash
npx prisma migrate dev
```

4. Start the Server:

```bash
npm run start:dev
```

## 🔒 Email & Password Recovery

For development purposes, this service uses Mailtrap.io to intercept outgoing emails. When a user requests a password reset, an email with a unique token is "sent" to the Mailtrap sandbox, allowing you to view the link and complete the flow on the Frontend.

## 🛡 Cross-Service Integration

This service signs tokens using a symmetric key. Other services in the ecosystem (built on .NET 9 or NestJS) use the same shared secret to validate the signature, expiration (`exp`), and user claims (e.g., `userId`) without needing to call the Identity Service directly.

## JWT Payload Example:

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1707552000,
  "exp": 1707555600
}
```

## Rate Limiting

### Email Rate Limits

To prevent email service abuse and manage daily quotas:

- **Per Email (Registration)**: Maximum 2 registration attempts per hour per email address
- **Per Email (Password Reset)**: Maximum 2 password reset attempts per hour per email address
- **Global Daily Limit**: Maximum 100 emails sent per day across all users

When limits are exceeded:

- **Per-email limit**: `429 Too Many Requests` - "Too many attempts. Please try again in 1 hour"
- **Daily limit**: `503 Service Unavailable` - "Email service limit exceeded. Please try again tomorrow"

### General Rate Limiting

API endpoints are throttled at **3 requests per minute per IP address** using `@nestjs/throttler`.

When exceeded:

- `429 Too Many Requests` with headers:
  - `X-RateLimit-Limit: 3`
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset: 1`

## 🔐 JWT Token Types

The service uses JWT tokens with different types for security:

### Token Types

| Type       | Purpose                     | Usage                       | Expiry |
| ---------- | --------------------------- | --------------------------- | ------ |
| `register` | Email verification          | `/auth/verify-registration` | 15 min |
| `reset`    | Password reset verification | `/auth/verify-reset`        | 15 min |
| `login`    | API authentication          | Protected endpoints         | 15 min |

### Implementation

```typescript
// Registration token - can ONLY be used for email verification
const verifyToken = this.jwtService.sign({ email, type: 'register' }, { expiresIn: '15m' });

// Login token - can ONLY be used for API access
const accessToken = this.jwtService.sign(
  { sub: user.id, email: user.email, type: 'login' },
  { expiresIn: '15m' },
);

// Reset token - can ONLY be used for password reset
const resetToken = this.jwtService.sign({ sub: user.id, type: 'reset' }, { expiresIn: '15m' });
```

### Security

- Each token type is validated by `JwtAuthGuard`
- Using a token for wrong action will result in `401 Unauthorized`
- Tokens are stored in Redis with TTL for rate limiting
- Login tokens are blacklisted on logout
