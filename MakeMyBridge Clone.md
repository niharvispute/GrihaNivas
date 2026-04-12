# **🏗️ Real Estate Platform Backend Documentation**

## **📌 Project Overview**

This is a **real estate lead generation platform** focused on Mumbai properties.

### **🎯 Core Goals:**

* Display property listings (Buy, Rent, Commercial, New Launch)  
* Capture leads from users  
* Provide admin CRM for managing leads  
* Support calculators (EMI, Stamp Duty)  
* Enable user features (save, compare properties)

---

# **🧠 1\. SYSTEM ARCHITECTURE**

## **Tech Stack:**

* **Backend:** Node.js \+ Express.js  
* **Database:** MongoDB (Mongoose)  
* **Auth:** JWT \+ OTP (Firebase recommended)  
* **File Storage:** Cloudinary (images, PDFs)  
* **Email Service:** Nodemailer / SendGrid

---

# **📁 2\. PROJECT STRUCTURE**

backend/  
│── controllers/  
│── models/  
│── routes/  
│── middleware/  
│── services/  
│── utils/  
│── config/  
│── app.js  
│── server.js

---

# **🧩 3\. DATABASE DESIGN**

## **👤 User Model**

Stores user information.

{  
  name,  
  email,  
  phone,  
  isVerified,  
  savedProperties: \[ObjectId\],  
  comparedProperties: \[ObjectId\],  
  createdAt  
}

---

## **🏠 Property Model**

{  
  title,  
  description,  
  type, // buy | rent | commercial | new\_launch

  location: {  
    city,  
    area,  
    address  
  },

  price,  
  bhk,  
  carpetArea,  
  builderName,  
  possessionDate,  
  reraNumber,

  amenities: \[\],

  images: \[\],  
  videos: \[\],  
  floorPlans: \[\],  
  brochureUrl,

  isFeatured,  
  isActive,

  createdAt  
}

---

## **📊 Lead Model (IMPORTANT)**

👉 All leads are stored in ONE collection.

{  
  name,  
  phone,  
  email,

  leadType, // buy | rent | loan | agreement | list\_property

  propertyId, // optional

  message,

  status, // new | contacted | qualified | closed

  notes: \[\],

  createdAt  
}

---

## **📝 Blog Model**

{  
  title,  
  slug,  
  content,  
  featuredImage,

  category,  
  tags: \[\],

  metaTitle,  
  metaDescription,  
  keywords,

  comments: \[  
    {  
      name,  
      comment,  
      createdAt  
    }  
  \],

  createdAt  
}

---

## **⭐ Testimonial Model**

{  
  name,  
  rating,  
  message,  
  image,  
  videoUrl,  
  createdAt  
}

---

## **🧮 Stamp Duty Config**

{  
  maleRate,  
  femaleRate,  
  jointRate,  
  registrationCharge,  
  updatedAt  
}

---

# **🔐 4\. AUTHENTICATION FLOW**

## **OTP Login Flow:**

1. User enters phone/email  
2. OTP sent via Firebase  
3. User verifies OTP  
4. Backend generates JWT  
5. Token sent to frontend

---

## **JWT Middleware:**

* Protect routes like:  
  * Save property  
  * Compare property  
  * Download brochure

---

# **🔄 5\. CORE FEATURES FLOW**

## **🏠 Property Flow**

* GET all properties with filters  
* GET single property details  
* Admin can create/edit/delete

---

## **❤️ Save Property**

* User clicks save  
* Store propertyId in `savedProperties`

---

## **⚖️ Compare Property**

* Store max 3 propertyIds  
* Used for comparison page

---

## **📥 Lead Flow (VERY IMPORTANT)**

### **Lead Sources:**

* Buy  
* Rent  
* Loan  
* Agreement  
* List Property

### **Flow:**

1. User submits form  
2. Lead saved in DB  
3. Email sent to admin  
4. Admin updates status

---

# **🔍 6\. FILTERING SYSTEM**

## **API Example:**

GET /api/properties?type=buy\&bhk=2\&minPrice=5000000\&maxPrice=10000000\&area=Andheri

### **Features:**

* API-based filtering  
* Pagination required  
* Sorting:  
  * Price Low → High  
  * Price High → Low  
  * Newest

---

# **📡 7\. API DESIGN**

## **🔐 Auth**

POST /api/auth/signup/request  
POST /api/auth/signup/verify-email  
POST /api/auth/signup/resend-otp  
POST /api/auth/login  
POST /api/auth/forgot-password/request  
POST /api/auth/forgot-password/verify  
POST /api/auth/forgot-password/reset  
POST /api/auth/refresh  
POST /api/auth/logout

---

## **🏠 Properties**

GET /api/properties  
GET /api/properties/:id  
POST /api/properties (admin)  
PUT /api/properties/:id (admin)  
DELETE /api/properties/:id (admin)

---

## **❤️ User**

POST /api/user/save-property  
POST /api/user/compare-property  
GET /api/user/saved  
GET /api/user/compare

---

## **📊 Leads**

POST /api/leads  
GET /api/leads (admin)  
PUT /api/leads/:id/status (admin)

---

## **📝 Blogs**

GET /api/blogs  
GET /api/blogs/:slug  
POST /api/blogs (admin)  
POST /api/blogs/:id/comment

---

## **⭐ Testimonials**

GET /api/testimonials  
POST /api/testimonials (admin)

---

## **🧮 Stamp Duty**

GET /api/stamp-duty  
PUT /api/stamp-duty (admin)

---

# **📧 8\. EMAIL SYSTEM**

## **When to send emails:**

* New lead submission

## **Tools:**

* Nodemailer (basic)  
* SendGrid (recommended)

---

# **🛠️ 9\. ADMIN FEATURES**

Admin can:

* Manage properties  
* Manage leads (CRM)  
* Update lead status  
* Add notes  
* Manage blogs  
* Manage testimonials  
* Update stamp duty rates

---

# **📊 10\. LEAD STATUS FLOW**

new → contacted → qualified → closed

---

# **🔐 11\. SECURITY BEST PRACTICES**

* Use JWT for auth  
* Validate all inputs  
* Use rate limiting  
* Sanitize user data  
* Protect admin routes

---

# **🚀 12\. DEPLOYMENT**

* Backend hosted on Hostinger VPS  
* Use PM2 for process management  
* Use environment variables

---

# **🧠 FINAL NOTES FOR DEVELOPER**

* Write clean, modular code  
* Follow MVC pattern  
* Use async/await  
* Handle errors properly  
* Keep APIs scalable

---

# **✅ DEVELOPMENT ORDER (IMPORTANT)**

1. Setup project & DB connection  
2. Auth (OTP \+ JWT)  
3. Property APIs  
4. Lead APIs  
5. User features (save/compare)  
6. Admin APIs  
7. Blogs & testimonials  
8. Stamp duty config

---

This backend is designed to be scalable, maintainable, and production-ready.

