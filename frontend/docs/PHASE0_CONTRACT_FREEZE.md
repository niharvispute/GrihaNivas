# Phase 0 - Contract Freeze

Last updated: 2026-04-12
Owner: frontend + backend integration

## Scope Locked in Phase 0

1. Response envelope (backend standard)
2. Canonical route strategy for frontend URLs
3. Data contracts and frontend view-model mappers
4. Auth token lifecycle contract

## 1) Standard API Response Envelope

Success response:

```json
{
  "success": true,
  "message": "Properties fetched",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 200,
    "pages": 20
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": [
    { "field": "phone", "message": "Phone must be in format +91XXXXXXXXXX" }
  ]
}
```

## 2) Canonical Frontend Route Strategy

Decision:
- Property detail route should be slug-first
- Blog detail route should be slug-first

Canonical routes:
- Property detail: /property/[slug]
- Blog detail: /blogs/[slug]

Backend endpoints mapped:
- Property detail data: GET /api/properties/slug/:slug
- Blog detail data: GET /api/blogs/:slug

## 3) DTO and Mapper Contract

### Property mapper input (backend)
- _id
- slug
- title
- price (number)
- priceUnit
- location.area, location.city
- heroImage.url, gallery[].url
- bhk, areaSqft
- isFeatured, category, reraNumber, savedCount

### Property mapper output (frontend)
- id
- slug
- title
- locationLabel
- priceValue
- priceLabel
- priceSuffix
- image
- bhk
- area
- isFeatured
- isNew
- isVerified
- savedCount

### Blog mapper input (backend)
- _id
- slug
- title
- category
- excerpt
- content
- featuredImage.url
- publishedAt, createdAt

### Blog mapper output (frontend)
- id
- slug
- title
- categoryLabel
- excerpt
- image
- dateLabel
- readTime

## 4) Auth Contract

Auth flow:
1. Signup request: POST /api/auth/signup/request
2. Signup verify (OTP-only payload): POST /api/auth/signup/verify-email
3. Login: POST /api/auth/login with identifier + password
4. Forgot-password request: POST /api/auth/forgot-password/request
5. Forgot-password verify (OTP-only payload): POST /api/auth/forgot-password/verify
6. Forgot-password reset: POST /api/auth/forgot-password/reset
7. Save accessToken + refreshToken in frontend token store
8. Protected requests send Authorization: Bearer <accessToken>
9. On 401, try one refresh using POST /api/auth/refresh
10. If refresh fails, clear session and route user to login

## 5) Public Form to Endpoint Contract

- Contact form -> POST /api/contact
- Property lead form -> POST /api/leads with leadType=buy or rent
- Home loan form -> POST /api/leads with leadType=loan
- List property form -> POST /api/leads with leadType=list_property

## 6) Open contract notes (not blocking Phase 1)

- Calculator stamp-duty endpoint currently uses fallback rates in controller; DB-config wiring can be done later without breaking client contract.
- Blog comment moderation endpoint is still pending for admin workflows.
