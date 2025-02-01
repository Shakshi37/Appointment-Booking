# Authentication and Expert/User Module Documentation

This document explains the authentication flow, expert module, and related API endpoints in our project.

## Authentication Flow

### Registration API

To register a user or an expert, use the following API.

```bash
curl --location 'localhost:4004/auth/registration/v1' \
--header 'apps_name: web' \
--header 'Content-Type: application/json' \
--data-raw '{
    "identifier":"shakshi.thakur@srkay.com",
    "user_name":"Shakshi Thakur",
    "user_category_code":2
}'
```

**Explanation:**
- `identifier`: The email address of the user/expert.
- `user_name`: The name of the user/expert.
- `user_category_code`: 2 identifies the expert, and other values can identify different categories.

**Important Notes:**
- The `apps_name` header is required because it is used as the JWT token issuer.
- After hitting the API, an OTP will be sent to the email, and `token` and `refresh_token` will be provided in the response headers.
- Initially, the `is_password_set` flag will be `false`, meaning the password will be set after the first login.

### OTP Verification API

To verify the OTP sent to the user's email, use the following API.

```bash
curl --location 'localhost:4004/auth/verify/otp/v1' \
--header 'apps_name: web' \
--header 'token: <token>' \
--header 'refresh_token: <refresh_token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "identifier":"shakshi.thakur@srkay.com",
    "otp":"773976",
    "is_login":false
}'
```

**Explanation:**
- `identifier`: The user's email.
- `otp`: The OTP received in the user's email.
- `is_login`: Set to `false` during registration.

After OTP verification, the user's `is_verified` flag will be set to `true`, and they can proceed to login.

### Login API

To log in, users will first use an OTP (since they don't have a password yet).

```bash
curl --location 'localhost:4004/auth/login/v1?is_password_login=false' \
--header 'apps_name: web' \
--header 'Content-Type: application/json' \
--data-raw '{
    "identifier":"shakshi.thakur@srkay.com"
}'
```

**Explanation:**
- The `identifier` is the email address of the user.
- An OTP will be sent to the email.

### OTP Verification for Login

After receiving the OTP, the user must verify it using the following API.

```bash
curl --location 'localhost:4004/auth/verify/otp/v1' \
--header 'apps_name: web' \
--header 'token: <token>' \
--header 'refresh_token: <refresh_token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "identifier":"shakshi.thakur@srkay.com",
    "otp":"773976",
    "is_login":true
}'
```

**Explanation:**
- After OTP verification, the user's `is_login` flag will be set to `true`.

### Setting Password

After successful OTP login, users must set a password using the following API.

```bash
curl --location 'localhost:4004/auth/set/password/v1' \
--header 'apps_name: web' \
--header 'token: <token>' \
--header 'refresh_token: <refresh_token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "identifier":"shakshi.thakur@srkay.com",
    "password":"Shakshi@1234"
}'
```

**Explanation:**
- `identifier`: The email address of the user.
- `password`: The user's password (encrypted before storing).

### Login with Password

After setting the password, users can log in using their credentials.

```bash
curl --location 'localhost:4004/auth/login/v1?is_password_login=true' \
--header 'apps_name: web' \
--header 'Content-Type: application/json' \
--data-raw '{
    "identifier":"shakshi.thakur@srkay.com",
    "password":"Shakshi@1234"
}'
```

**Explanation:**
- The system will compare the encrypted password in the database with the provided password.

---

## Expert Module

### Slot Creation API

Experts can create their availability slots using the following API.

```bash
curl --location 'localhost:4004/slot/upsert/slot/v1' \
--header 'token: <expert_token>' \
--header 'refresh_token: <refresh_token>' \
--header 'apps_name: web' \
--header 'Content-Type: application/json' \
--data-raw '{
  "identifier": "shakshi.thakur@srkay.com",
  "timeRange": {
    "startDate":"2025-02-02",
    "endDate":"2025-02-10",
    "startTime": "10:00:00 AM",
    "endTime": "01:00:00 PM"
  },
  "days": ["Monday", "Wednesday"]
}'
```

**Explanation:**
- Experts define a date range (start and end date) and specify the days (e.g., Monday, Wednesday).
- The slot will recur for the selected days, and each slot is 30 minutes long.

### Get Slot Details API

Experts can retrieve the details of their created slots with this API.

```bash
curl --location 'localhost:4004/slot/get/slot/v1' \
--header 'token: <expert_token>' \
--header 'refresh_token: <refresh_token>' \
--header 'apps_name: web' \
--header 'Content-Type: application/json' \
--data-raw '{
  "identifier": "shakshi.thakur@srkay.com"
}'
```

**Explanation:**
- This API will return the list of all slots created by the expert.

### Booking Status Update API

Experts can update the status of their bookings (e.g., approved or canceled) using the following API.

```bash
curl --location 'localhost:4004/booking/update/status/v1' \
--header 'apps_name: web' \
--header 'token: <expert_token>' \
--header 'refresh_token: <refresh_token>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "slotId": "<slot_id>",
  "bookingId": "<booking_id>",
  "status": "approved"
}'
```

**Explanation:**
- Experts can approve or cancel bookings.
- The system ensures no more than 5 bookings per slot are approved.

---


Here's a suggested addition for your README file based on the booking user module you've shared:

---

## Booking User Module

This module ensures that users can book available slots for experts, while enforcing several business rules, such as limiting the number of bookings per slot and ensuring there are no overlapping availability slots for experts. The APIs are protected with JWT token validation and CORS origin validation to ensure secure access.

### **Booking Slot API**

This API allows a user to book a slot for an expert, with the following restrictions:

- **Slot Availability Check**: A user can only book a slot if it has fewer than 5 approved bookings.
- **Expert Slot Restriction**: Experts cannot create overlapping availability slots.
- **Weekday Booking**: Bookings are only allowed on weekdays (Monday to Friday).
- **Role-based Access Control**: Only users with the "User" role can access this API.

#### Request:

```bash
curl --location 'localhost:4004/booking/slot/v1' \
--header 'apps_name: web' \
--header 'token: <user-jwt-token>' \
--header 'refresh_token: <refresh-token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "expert_identifier": "shakshi.thakur@srkay.com", 
    "slot_id": "679e4d31853931d63fc6d85b"
}'
```

#### Response:

- **200 OK**: If the booking is successful.
- **400 Bad Request**: If the slot is unavailable or the maximum number of bookings has been reached.

### **Booking List API**

This API allows users to view their own booking slots. It ensures that users can only see their own bookings and prevents unauthorized access to other users' bookings.

#### Request:

```bash
curl --location 'localhost:4004/booking/list/v1' \
--header 'apps_name: web' \
--header 'token: <user-jwt-token>' \
--header 'refresh_token: <refresh-token>'
```

#### Response:

- **200 OK**: A list of the authenticated user's booking slots.
- **404 Not Found**: If no bookings are found for the authenticated user.

### **Environment Variables**

Make sure to set the following environment variables in your `.env` file for the email configuration:

```plaintext
MAIL_HOST="MAIL_HOST"
MAIL_USER="MAIL_USER"
MAIL_PASSWORD="MAIL_PASSWORD"
```

Note: For testing purposes, we are using an Outlook account for sending emails.

---

## Conclusion

This document outlines the core functionality of the Authentication and Expert modules. It covers the registration, OTP verification, login, password setting, and expert slot management processes.

---

This template is comprehensive, including all the details for each API. You can customize it further as per the project specifics!