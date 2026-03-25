# Product Requirements Document (PRD)

**Product Name (Working Title):** Camaroo (TBD)

## 1. Product Overview
### 1.1 Vision
To build a professional mobile platform that connects photographers, cinematographers,
videographers, editors, and other creative professionals into one collaborative ecosystem
where they can:
- Showcase portfolios
- Get hired
- Hire other creatives
- Sell or rent equipment
- Learn via certified courses
- Manage bookings and availability
- Build long-term professional networks

## 2. Target Users
### 2.1 Primary User Segments
1. Photographers
2. Cinematographers
3. Videographers
4. Editors
5. We can add more as you define

### 2.2 Secondary Users
- Event organizers
- Agencies
- Production houses
- Brands looking for freelancers

## 3. Business Objectives
- Create a niche professional creative network
- Enable monetization via:
  - Subscription plans
  - Course sales
- Build recurring engagement through:
  - Feed
  - Chat
  - Hiring opportunities
  - Marketplace

## 4. Platform Type
- Mobile App (Phase 1: Android + iOS)
- Admin Web Panel - Super Admin

## 5. Feature Scope & Modules

### MODULE 1: Authentication & Onboarding
#### 5.1 User Registration
**Sign-up Options:**
- Email + Password
- Mobile OTP
- Social Login (Google, Apple, Facebook)

**User Role Selection (Mandatory)**
- Photographer
- Cinematographer
- Videographer
- Editor
- Multi-select allowed

#### 5.2 Onboarding Details
**Required Fields:**
- Full Name
- Profile Picture
- Category (Single / Multiple)
- Mobile Number
- Email
- Address
- Location (GPS + Manual Entry)
- Social Media Links:
  - Instagram
  - YouTube
  - Website
  - Other

**Optional:**
- Years of experience
- Specialization (Wedding, Fashion, Commercial, etc.)

### MODULE 2: Home Screen
#### 6.1 Home Dashboard
After login user is redirected to:
**Sections:**
1. User Discovery
2. Feed (Recent activities)
3. Quick Hire CTA - this will open post hire opportunity form

#### 6.2 User Discovery List
**Displayed Data:**
- Profile Picture
- Name
- Category
- Location
- Availability Status (Next 7 days booked/free)

**Filters:**
- Search by Name
- Search by Email
- Filter by Category
- Filter by Availability Date
- Filter by Location

#### 6.3 User Detail Page
**Includes:**
- Name
- Profile Image
- Category
- Bio
- Contact Info (based on privacy setting)
- Social Media Links
- Portfolio
- Availability Calendar
- “Hire” Button
- “Chat” Button
- Subscribe button

### MODULE 3: Portfolio Management
#### 7.1 Portfolio Upload
User can upload:
- Photos
- Videos

**Controls:**
- Public / Private toggle
- Add tags (Wedding, Commercial, Fashion etc.)
- Delete/Edit posts

#### 7.2 Portfolio Visibility
- Public: Visible to all users
- Private: Only visible after approval (optional feature)

### MODULE 4: Chat System
#### 8.1 1:1 Chat
**Features:**
- Text Messages
- Image sharing
- File sharing (optional future)
- Push Notifications
- Block/Report User

### MODULE 5: Hiring System (Opportunity Board)
#### 9.1 Post an Opportunity
User fills form:
- Required Category
- Shoot Type
- Date
- Duration
- Location
- Description
- Attach references (optional)

*Once submitted: → Post goes to Community Opportunity Board*

#### 9.2 Application Process
**Interested Users:**
- Apply
- Allow to view portfolio button
- Add Cover Note

#### 9.3 Review Applications
Creator can:
- Reject
- Chat with applicant
- Mark as Hired

### MODULE 6: Marketplace
#### 10.1 Post Types
**Categories:**
1. New Equipment
2. Used Equipment
3. Rental
4. Presets (Image and Video File)

#### 10.2 Listing Fields
- Product Name
- Category
  - New Equipment
  - Used Equipment
  - Rental
  - Presets
- Condition
- Price
- Location
- Description
- Upload Images
- Rental pricing (if applicable)
- Upload Presets file with preview
  - Image
  - Video

#### 10.3 Visibility Rules
- Appears on Feed for 24 Hours
- Stays on Marketplace for 15days
- Presets preview should be visible
- Chat to connect with seller
- Disclaimer - that communication happens between you and end user. This platform is not responsible for anything.
  - Accept button

### MODULE 7: User Feed
**Shows:**
- Subscribed users priority first
- New portfolio uploads (24 hrs)
- Marketplace posts (24 hrs)
- Opportunity posts

*Chronological feed.*

### MODULE 8: Courses
#### 11.1 Admin Side
Super Admin can:
- Create Course
- Upload Videos/Documents
- Define Price
- Upload Certificate Template

#### 11.2 User Side
Users can:
- View courses
- Purchase course
- Watch videos
- Track progress - Progress bar
- Get certification upon completion
- Button - Want to sell your courses?
  - On click open up the Contact Us form

#### 11.3 Certification System
**Dynamic Fields:**
- User Name
- Course Name
- Completion Date
- Platform Logo and name

**Static Fields:**
- Course Author Signature
- Platform Name
- Unique Certificate ID

*Certificate downloadable in PDF format.*

### MODULE 9: Calendar & Availability
#### 12.1 Personal Calendar
User can:
- Add booking manually
- Mark as busy
- Set public/private visibility
- Cancel Booking

#### 12.2 Public Availability
Other users can:
- View availability
- Filter by available date
- See next 7-day booking status

### MODULE 10: Map & Location Discovery
#### 13.1 Map View
- User searches location
- See nearby professionals
- Radius filter (5km, 10km, 50km)

#### 13.2 User Interaction
- Click profile
- Start chat
- Send hire request
- Receive notification

### MODULE 11: Quotation Templates
#### 14.1 Template Library
Users can:
- View quotation templates
- Select template
- Fill:
  - Client Name
  - Shoot Details
  - Line Items
  - Pricing
  - GST (optional)
  - Notes

#### 14.2 Output
- Download as PDF
- Save draft
- Reuse template

### MODULE 12: Subscription Plans
#### 15.1 Plan Structure
**🔹 Basic (Free)**
- Profile creation
- Portfolio upload (Limited: 20 items)
- Limited chat
- Apply to 3 opportunities/month
- No map access
- No course discount
- No premium templates

**🔹 Pro Plan**
- Unlimited portfolio uploads
- Unlimited chat
- Apply to unlimited opportunities
- Access to Map
- 10% course discount
- 5 quotation templates
- Calendar public visibility
- Priority listing in search

**🔹 Elite Plan**
- Everything in Pro
- Featured profile badge
- Boost listing once per month
- Access to all quotation templates
- 20% course discount
- Early access to opportunities

**Add on Plans**
- X number of quotation templates at x price
- Unlimited portfolio uploads for x days
- Apply to x opportunities at x price

### MODULE 13: Notifications
Push Notifications for:
- New message
- Application received
- Shortlisted
- Booking confirmed
- Course completed
- Marketplace interest

### Module 14: Contact Form
- Fill the Contact Form
  - Form will be sent to support email address

### Module 15: Profile
- Manage Profile Information
  - Full Name
  - Profile Picture
  - Category (Single / Multiple)
  - Mobile Number
  - Address
  - Location (GPS + Manual Entry)
  - Social Media Links:
    - Instagram
    - YouTube
    - Website
    - Other
- Change Password
- Logout

## 6. Non-Functional Requirements
- Secure authentication (JWT)
- Scalable backend
- Media storage (Cloud)
- Role-based access
- GDPR compliant
- Data encryption
- Performance optimized for media content

## 7. Tech Architecture (Suggested)
**Frontend:**
- React Native

**Backend:**
- Node.js
- PostgreSQL
- Redis/Stream 3rd Party (chat)

**Cloud:**
- AWS

**Storage:**
- S3 for media

**Real-time:**
- WebSockets / Firebase

## 8. Success Metrics (KPIs)
- User registrations
- Active monthly users
- Opportunity posts
- Hire conversions
- Course sales
- Subscription conversion rate
