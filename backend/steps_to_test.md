# Backend API Testing Guide (Postman)

This guide is for a beginner tester. Follow steps in order.

## 1. Goal

Test the backend APIs using Postman:
- Happy path (normal flow)
- Edge cases (invalid input, auth failures, boundary cases)

---

## 2. Prerequisites

1. Install Postman Desktop App.
2. Install Node.js (v18+).
3. Have backend code on your machine.
4. Backend `.env` is configured.

---

## 3. Start Backend Server

From terminal:

```bash
cd backend
npm install
npm run dev
```

Expected:
- Server runs on `http://localhost:5000`
- Health URL works: `GET http://localhost:5000/health`

If server fails:
1. Check `MONGODB_URI` in `.env`.
2. Check `PORT` in `.env`.
3. Re-run `npm install`.

---

## 4. Seed Admin User (One Time)

Run this once:

```bash
npm run seed:admin
```

Current admin credentials:
- Email: `admin@bricks.com`
- Phone: `+919172008630`
- Password: `admin@123`

Use either email or phone in login identifier.

---

## 5. Postman Beginner Setup

## 5.1 Create Environment

In Postman, create environment: `Bricks Local`.

Add variables:

| Variable | Initial Value |
|---|---|
| `BASE_URL` | `http://localhost:5000` |
| `accessToken` | *(blank)* |
| `refreshToken` | *(blank)* |
| `propertyId` | *(blank)* |
| `leadId` | *(blank)* |
| `userId` | *(blank)* |
| `blogId` | *(blank)* |
| `builderId` | *(blank)* |
| `contactId` | *(blank)* |

Select this environment in top-right.

## 5.2 Create Collection

Create collection: `Bricks Backend API`.

Inside collection, create folders:
1. Health
2. Auth
3. Properties
4. Leads
5. Users
6. Blogs
7. Builders
8. Admin Builders
9. Testimonials
10. Banners
11. Calculators
12. Stamp Duty
13. Contact
14. Dashboard
15. Edge Cases

## 5.3 Add Collection Authorization

Collection -> Authorization:
- Type: `Bearer Token`
- Token: `{{accessToken}}`

Important:
- Public APIs do not need token.
- Admin APIs need valid admin token.

---

## 6. Useful Postman Scripts

## 6.1 Save Tokens After Login

In `Auth > Login` request, add this in **Tests** tab:

```javascript
const json = pm.response.json();
if (json?.data?.accessToken) {
  pm.environment.set('accessToken', json.data.accessToken);
}
if (json?.data?.refreshToken) {
  pm.environment.set('refreshToken', json.data.refreshToken);
}
```

## 6.2 Save IDs From Create APIs

Example for create property / lead / blog in **Tests** tab:

```javascript
const json = pm.response.json();
if (json?.data?._id) {
  pm.environment.set('propertyId', json.data._id); // change variable per request
}
```

Use relevant variable:
- Lead create -> `leadId`
- Blog create -> `blogId`
- Contact list first item -> `contactId`

---

## 7. Test Order (Follow This Exactly)

## 7.1 Health (No Auth)

1. `GET {{BASE_URL}}/health`
2. `GET {{BASE_URL}}/health/ready`

Expected: `200`.

## 7.2 Auth (Login First)

### A) Login

`POST {{BASE_URL}}/api/auth/login`

Body JSON:

```json
{
  "identifier": "admin@bricks.com",
  "password": "admin@123"
}
```

Expected:
- `200`
- `data.accessToken` and `data.refreshToken`

### B) Me

`GET {{BASE_URL}}/api/auth/me`

Expected:
- `200`
- User role should be `admin`

### C) Refresh

`POST {{BASE_URL}}/api/auth/refresh`

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

Expected: `200` and new tokens.

## 7.3 Properties

### A) List public properties

`GET {{BASE_URL}}/api/properties`

Expected: `200`

### B) Create property (admin, form-data)

`POST {{BASE_URL}}/api/properties`

Body type: `form-data`

Required fields (example):
- `title`: Test Property A
- `description`: Long description (20+ chars)
- `category`: buy
- `price`: 5500000
- `location[area]`: Andheri West
- `bhk`: 2
- `areaSqft`: 900
- `furnishing`: semi_furnished
- `heroImage`: file

Expected:
- `201`
- Save `_id` as `propertyId`

### C) Get property by ID

`GET {{BASE_URL}}/api/properties/{{propertyId}}`

Expected: `200`

## 7.4 Leads

### A) Public lead create

`POST {{BASE_URL}}/api/leads`

```json
{
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "leadType": "buy",
  "message": "Looking for 2BHK in Andheri"
}
```

Expected: `201`, status starts as `new`.

Save `_id` as `leadId`.

### B) List leads (admin)

`GET {{BASE_URL}}/api/leads`

Expected: `200`

### C) Update lead status forward

`PUT {{BASE_URL}}/api/leads/{{leadId}}/status`

```json
{
  "status": "contacted"
}
```

Expected: `200`

## 7.5 Users

### A) My profile

`GET {{BASE_URL}}/api/users/me`

Expected: `200`

### B) Admin list users

`GET {{BASE_URL}}/api/users`

Expected: `200`

### C) Save property

`POST {{BASE_URL}}/api/users/saved`

```json
{
  "propertyId": "{{propertyId}}"
}
```

Expected: `201`

## 7.6 Blogs

### A) List blogs

`GET {{BASE_URL}}/api/blogs`

Expected: `200`

### B) Create blog (admin)

`POST {{BASE_URL}}/api/blogs`

Body type: `form-data`
- `title`: Mumbai Market Insight Test
- `content`: 100+ chars
- `category`: market_trends
- optional `featuredImage`: file

Expected: `201`

## 7.7 Builders

### A) List public builders

`GET {{BASE_URL}}/api/builders`

Expected: `200`

### B) Admin list builders

`GET {{BASE_URL}}/api/admin/builders`

Expected: `200`

## 7.8 Banners & Testimonials

### A) Public list

- `GET {{BASE_URL}}/api/banners`
- `GET {{BASE_URL}}/api/testimonials`

Expected: `200`

### B) Admin create banner (form-data)

`POST {{BASE_URL}}/api/banners`
- image file required

Expected: `201`

## 7.9 Calculators & Stamp Duty

- `POST {{BASE_URL}}/api/calculators/emi`
- `POST {{BASE_URL}}/api/calculators/stamp-duty`
- `GET {{BASE_URL}}/api/stamp-duty`

Expected: `200`

## 7.10 Contact & Dashboard

- `POST {{BASE_URL}}/api/contact` (public)
- `GET {{BASE_URL}}/api/contact` (admin)
- `GET {{BASE_URL}}/api/dashboard` (admin)

Expected:
- Contact POST: `201`
- Others: `200`

---

## 8. Edge Cases (Must Test)

Each edge case includes exact test method.

## 8.1 Auth Edge Cases

1. Wrong password
- API: `POST /api/auth/login`
- Use correct identifier + wrong password.
- Expected: `401 Invalid credentials`.

2. Invalid identifier format
- Use `identifier: "abc"`.
- Expected: `400 Validation failed`.

3. Forgot password for non-existing user
- API: `POST /api/auth/forgot-password/request`
- Use unknown email.
- Expected: `200` generic success message (no account leakage).

4. Access protected API without token
- API: `GET /api/users/me`
- Remove token.
- Expected: `401`.

## 8.2 Leads Edge Cases

1. Invalid phone format
- API: `POST /api/leads`
- Phone `9876543210` (without +91)
- Expected: `400`.

2. Invalid leadType
- leadType: `sell`
- Expected: `400`.

3. Backward status transition (important)
- Move lead to `qualified`, then try back to `contacted`.
- Expected: `400 Cannot move lead back`.

## 8.3 Users Edge Cases

1. Add same property to compare twice
- API: `POST /api/users/compare`
- Send same `propertyId` twice.
- Expected: second call `200 already in compare list`.

2. Compare list over limit
- Add 4 different properties.
- Expected on 4th: `400 Compare list is full (max 3)`.

3. Admin self-deactivate
- API: `PUT /api/users/:id/deactivate` with own id.
- Expected: `400 Admins cannot deactivate their own account`.

## 8.4 Properties Edge Cases

1. Invalid category
- category `resale`
- Expected: `400`.

2. Missing required field
- Omit `title` or `price`.
- Expected: `400`.

3. Wrong data type
- price as string text `"abc"`.
- Expected: `400`.

## 8.5 Blogs Edge Cases

1. Content below minimum length
- content < 100 chars.
- Expected: `400`.

2. Invalid category
- category `news`.
- Expected: `400`.

## 8.6 Contact Edge Cases

1. Very short message
- message < 10 chars.
- Expected: `400`.

2. Invalid phone
- no +91 format.
- Expected: `400`.

## 8.7 Security/Authorization Edge Cases

1. Call admin route with no token
- `GET /api/leads`
- Expected: `401`.

2. Call admin route with non-admin token
- Login with normal user token, call `GET /api/users`.
- Expected: `403`.

---

## 9. OTP Flow Testing (Important for Postman Beginners)

Signup and forgot-password OTP flows use secure cookies.

How to test correctly:
1. Use Postman Desktop app (cookie jar enabled).
2. Send `signup/request` or `forgot-password/request` first.
3. Do not manually copy cookie; Postman stores automatically per domain.
4. Then call verify endpoint with OTP from email.

If you get "Verification session expired":
- Re-run request step and verify again quickly.

---

## 10. Expected Response Pattern

Most APIs return:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}
}
```

For errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "phone", "message": "Phone must be in format +91XXXXXXXXXX" }
  ]
}
```

---

## 11. Testing Checklist (Quick Sign-off)

Mark pass/fail:

1. Health endpoints return 200.
2. Admin login works and token saved.
3. Protected route with token works.
4. Protected route without token fails with 401.
5. At least one property created and fetched.
6. Public lead create works.
7. Lead backward status transition blocked.
8. Compare list max 3 enforced.
9. Contact submit works.
10. At least 10 edge cases from section 8 executed.

---

## 12. Tips for Beginner Tester

1. Always check Status Code first.
2. Then check `message` and `data` in response body.
3. Save IDs from create APIs for next requests.
4. If a request fails unexpectedly, verify:
- URL
- Method
- Body type (JSON vs form-data)
- Authorization token
- Environment selected
5. Keep a simple test log in spreadsheet:
- Endpoint
- Scenario
- Expected
- Actual
- Pass/Fail
- Screenshot/response snippet

---

If needed, this guide can be converted into a ready-to-import Postman Collection JSON in a next step.