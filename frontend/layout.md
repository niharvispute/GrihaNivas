/app
│
├── (public)/                         # All public-facing pages
│   │
│   ├── layout.js                     # Header + Footer layout
│   ├── page.js                       # Home → mumbai_real_estate_home_page
│   │
│   ├── buy/
│   │   └── page.js                   # Property Listings (Buy)
│   │
│   ├── rent/
│   │   └── page.js                   # Property Listings (Rent)
│   │
│   ├── commercial/
│   │   └── page.js                   # Commercial Listings
│   │
│   ├── new-launch/
│   │   └── page.js                   # New Launch Projects
│   │
│   ├── property/
│   │   └── [id]/
│   │       └── page.js               # Property Detail → mumbai_property_detail_page
│   │
│   ├── featured-project/
│   │   └── [slug]/
│   │       └── page.js               # marine_drive_luxe
│   │
│   ├── compare/
│   │   └── page.js                   # compare_properties
│   │
│   ├── saved/
│   │   └── page.js                   # saved_properties (public access view)
│   │
│   ├── blogs/
│   │   ├── page.js                   # blogs_mumbai_editorial
│   │   └── [slug]/
│   │       └── page.js               # blog_detail_mumbai_editorial
│   │
│   ├── about/
│   │   └── page.js                   # about_us_mumbai_editorial
│   │
│   ├── contact/
│   │   └── page.js                   # contact_us_mumbai_editorial
│   │
│   ├── list-property/
│   │   └── page.js                   # list_your_property_mumbai_editorial
│   │
│   ├── home-loan/
│   │   └── page.js                   # home_loan_assistance_mumbai_editorial
│   │
│   ├── rent-agreement/
│   │   └── page.js                   # rent_agreement_e_registration_mumbai_editorial
│   │
│   ├── emi-calculator/
│   │   └── page.js                   # emi_calculator_mumbai_editorial
│   │
│   ├── stamp-duty/
│   │   └── page.js                   # stamp_duty_calculator_mumbai_editorial
│
│
├── (dashboard)/                      # USER PANEL
│   │
│   ├── layout.js                     # Sidebar + Topbar
│   │
│   ├── account/
│   │   ├── page.js                   # my_dashboard_user_panel
│   │   │
│   │   ├── profile/
│   │   │   └── page.js               # my_profile_user_panel
│   │   │
│   │   ├── enquiries/
│   │   │   └── page.js               # my_enquiries_user_panel
│   │   │
│   │   ├── saved/
│   │   │   └── page.js               # saved_properties_user_panel
│   │   │
│   │   └── compare/
│   │       └── page.js               # compare inside dashboard
│
│
├── (admin)/                          # ADMIN CONSOLE
│   │
│   ├── layout.js                     # Admin Sidebar Layout
│   │
│   ├── dashboard/
│   │   └── page.js                   # admin_dashboard_overview
│   │
│   ├── properties/
│   │   ├── page.js                   # property_management_admin_console
│   │   ├── add/
│   │   │   └── page.js
│   │   └── [id]/
│   │       └── page.js               # edit property
│   │
│   ├── leads/
│   │   └── page.js                   # lead_crm_admin_console
│   │
│   ├── users/
│   │   └── page.js                   # user_management_admin_console
│   │
│   ├── blogs/
│   │   ├── page.js                   # blog_cms_admin_console
│   │   ├── add/
│   │   │   └── page.js
│   │   └── [id]/
│   │       └── page.js
│   │
│   ├── banners/
│   │   └── page.js                   # banner_management_admin_console
│   │
│   ├── testimonials/
│   │   └── page.js                   # testimonial_manager_admin_console
│
│
├── api/                              # (Optional) Next API routes
│   └── ...
│
├── globals.css
└── layout.js                         # Root layout (fonts, metadata)