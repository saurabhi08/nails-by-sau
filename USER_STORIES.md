# Nails By Sau - User Stories Documentation

## Overview
This document outlines all user stories implemented in the Nails By Sau booking system.

---

## User Roles

1. **Customer/Client** - Person booking nail services
2. **Business Owner (Admin)** - Sau, the nail artist managing the business
3. **Guest** - Visitor browsing the website

---

## User Stories Implemented

### Epic 1: Website Browsing & Information

**US-001: Browse Services**
- **As a** potential customer
- **I want to** view all available nail services with descriptions and pricing
- **So that** I can decide which service I want to book

**Acceptance Criteria:**
- Services page displays all nail services
- Each service shows name, description, price, and duration
- Services are categorized (Manicure, Nail Art, Extensions)
- Professional images are displayed
- Mobile responsive design

**US-002: View Business Information**
- **As a** potential customer
- **I want to** find the studio location, hours, and contact information
- **So that** I know where to go and how to reach the business

**Acceptance Criteria:**
- Homepage displays studio address: 50 Strathaven Drive, Unit 12, Mississauga
- Contact page shows phone, email, and hours
- Navigation accessible from all pages
- Studio information clearly displayed

**US-003: View Portfolio/Gallery**
- **As a** potential customer
- **I want to** see examples of previous nail art work
- **So that** I can assess the quality and style before booking

**Acceptance Criteria:**
- Gallery section on homepage
- Professional nail art photos displayed
- Clickable images for larger view
- Category labels for different styles

---

### Epic 2: Appointment Booking

**US-004: Book an Appointment**
- **As a** customer
- **I want to** book an appointment online
- **So that** I can schedule my nail service at my convenience

**Acceptance Criteria:**
- Multi-step booking form accessible
- Select service with pricing displayed
- Choose available date and time
- Enter personal information (name, email, phone)
- Add special requests/notes
- Receive booking confirmation

**US-005: Select Service**
- **As a** customer
- **I want to** choose from available nail services
- **So that** I can book the service I need

**Acceptance Criteria:**
- Service options displayed with visual cards
- Price and duration shown for each service
- Services include: Classic Manicure, Gel Manicure, French Manicure, Nail Art Design
- Selection is highlighted
- Can only select one service at a time

**US-006: Choose Date and Time**
- **As a** customer
- **I want to** select my preferred appointment date and time
- **So that** I can schedule at my convenience

**Acceptance Criteria:**
- Interactive calendar shows current month
- Past dates are disabled
- Available time slots displayed
- Selected date and time are highlighted
- Can navigate between months

**US-007: Enter Personal Details**
- **As a** customer
- **I want to** provide my contact information
- **So that** the business can reach me for confirmation and updates

**Acceptance Criteria:**
- Form fields for first name, last name, email, phone
- Address field for studio directions
- Optional notes field for special requests
- Form validation for required fields
- Email format validation

**US-008: Receive Booking Confirmation**
- **As a** customer
- **I want to** receive immediate confirmation after booking
- **So that** I know my appointment was successfully scheduled

**Acceptance Criteria:**
- Confirmation popup appears after successful booking
- Shows all appointment details (service, date, time, price)
- Displays customer name
- Mentions email confirmation will be sent
- Option to book another appointment

---

### Epic 3: Payment Processing

**US-009: Pay Online for Appointment**
- **As a** customer
- **I want to** pay for my appointment online
- **So that** I can secure my booking and avoid payment at the studio

**Acceptance Criteria:**
- Payment options modal appears after booking
- Stripe payment form for card entry
- Price calculation includes tax (13% HST)
- Secure payment processing
- Payment confirmation displayed

**US-010: Choose Payment Method**
- **As a** customer
- **I want to** choose how I want to pay
- **So that** I can use my preferred payment method

**Acceptance Criteria:**
- Three payment options: Online, Cash at Appointment, E-Transfer
- Clear description of each option
- Selection updates appointment record
- Payment status tracked in database

**US-011: View Total Cost**
- **As a** customer
- **I want to** see the total cost including taxes
- **So that** I know exactly how much I'll pay

**Acceptance Criteria:**
- Service price clearly displayed
- Tax (13% HST) calculated and shown
- Total amount displayed prominently
- No hidden fees

---

### Epic 4: Customer Account Management

**US-012: Create Customer Account**
- **As a** new customer
- **I want to** create an account
- **So that** I can track my appointments and bookings

**Acceptance Criteria:**
- Registration form with name, email, phone, password
- Password minimum 6 characters
- Email validation
- Account created in Firebase
- Automatic login after registration

**US-013: Login to Account**
- **As a** returning customer
- **I want to** login to my account
- **So that** I can access my appointment history

**Acceptance Criteria:**
- Login form with email and password
- Secure authentication via Firebase
- Error messages for invalid credentials
- Redirect to customer dashboard after login

**US-014: View My Appointments**
- **As a** logged-in customer
- **I want to** see all my booked appointments
- **So that** I can keep track of my upcoming visits

**Acceptance Criteria:**
- Customer dashboard displays all appointments
- Shows appointment details (service, date, time, price)
- Displays appointment status (pending, confirmed, cancelled)
- Sorted by date (newest first)
- Empty state shown if no appointments

**US-015: Logout from Account**
- **As a** logged-in customer
- **I want to** logout from my account
- **So that** my information is secure

**Acceptance Criteria:**
- Logout link visible when logged in
- Clicking logout clears session
- Redirects to home page
- Customer-only links hidden after logout

---

### Epic 5: Admin Business Management

**US-016: Admin Login**
- **As a** business owner
- **I want to** securely login to the admin dashboard
- **So that** I can manage my business

**Acceptance Criteria:**
- Admin login form with email and password
- Firebase authentication
- Only authorized users can access admin features
- Session persistence

**US-017: View All Appointments**
- **As a** business owner
- **I want to** see all customer appointments
- **So that** I can manage my schedule

**Acceptance Criteria:**
- Admin dashboard shows all appointments
- Displays customer name, service, date, time, price, status
- Can filter by status (pending, confirmed, completed, cancelled)
- Can filter by date range
- Sortable columns

**US-018: Manage Appointment Status**
- **As a** business owner
- **I want to** update appointment status
- **So that** I can track confirmed, completed, and cancelled appointments

**Acceptance Criteria:**
- Can mark appointments as confirmed, completed, or cancelled
- Status updates save to database
- Visual indicators for different statuses
- Confirmation dialog for cancellations

**US-019: View Business Statistics**
- **As a** business owner
- **I want to** see business analytics and metrics
- **So that** I can make data-driven decisions

**Acceptance Criteria:**
- Dashboard shows total appointments count
- Today's appointments count
- Monthly revenue calculation
- Active services count
- Visual display with stat cards

**US-020: Manage Services**
- **As a** business owner
- **I want to** add, edit, and delete nail services
- **So that** I can update my service offerings

**Acceptance Criteria:**
- Services tab in admin dashboard
- List of all services with details
- Add new service functionality
- Edit existing services
- Delete services with confirmation
- Services synced to Firebase

**US-021: View Customer Messages**
- **As a** business owner
- **I want to** see all customer inquiries from the contact form
- **So that** I can respond to customer questions

**Acceptance Criteria:**
- Messages tab in admin dashboard
- All messages displayed with customer name, email, subject, content
- Timestamp for each message
- Status indicators (unread/read)
- Reply tracking

**US-022: Manage Customer Messages**
- **As a** business owner
- **I want to** mark messages as read/replied and delete old messages
- **So that** I can organize my customer communications

**Acceptance Criteria:**
- Mark message as read button
- Mark as replied button
- Delete message button
- Confirmation before deletion
- Messages update in real-time

**US-023: Admin Logout**
- **As a** business owner
- **I want to** logout from admin dashboard
- **So that** my business data is secure

**Acceptance Criteria:**
- Logout button visible in dashboard
- Clicking logout ends session
- Redirects to login page
- Cannot access admin features after logout

---

### Epic 6: Contact & Communication

**US-024: Send Message to Business**
- **As a** potential customer
- **I want to** send a message through the contact form
- **So that** I can ask questions or make special requests

**Acceptance Criteria:**
- Contact form with name, email, phone, subject, message fields
- Subject dropdown with categories
- Form validation for required fields
- Success message after submission
- Message saved to Firebase

**US-025: View Contact Information**
- **As a** visitor
- **I want to** find contact details easily
- **So that** I can reach the business through multiple channels

**Acceptance Criteria:**
- Contact page displays studio address
- Phone number clickable for mobile users
- Email address displayed
- Business hours shown
- FAQ section for common questions

---

### Epic 7: User Experience & Navigation

**US-026: Navigate Website**
- **As a** website visitor
- **I want to** easily navigate between pages
- **So that** I can find information quickly

**Acceptance Criteria:**
- Navigation bar on all pages
- Links to Home, Services, Book Appointment, Contact
- Active page highlighted
- Mobile responsive hamburger menu
- Logo links back to home

**US-027: Mobile Access**
- **As a** mobile user
- **I want to** access the website on my phone or tablet
- **So that** I can book appointments on the go

**Acceptance Criteria:**
- Responsive design for all screen sizes
- Mobile-friendly forms
- Touch-friendly buttons and links
- Hamburger menu on mobile
- Optimized for small screens

**US-028: View Studio Location**
- **As a** customer
- **I want to** know where the studio is located
- **So that** I can plan my visit

**Acceptance Criteria:**
- Studio address displayed: 50 Strathaven Drive, Unit 12, Mississauga, ON
- Address shown during booking process
- Contact page has location details
- Instructions for directions provided

---

### Epic 8: Security & Privacy

**US-029: Secure Data Storage**
- **As a** customer
- **I want to** know my personal information is stored securely
- **So that** I can trust the booking system with my data

**Acceptance Criteria:**
- Firebase secure authentication
- Encrypted data transmission
- Role-based access control
- Customer data isolated from other users

**US-030: Role-Based Access**
- **As a** system user
- **I want to** only see features relevant to my role
- **So that** sensitive business information is protected

**Acceptance Criteria:**
- Customers see only their own appointments
- Admin sees all business data
- Customers cannot access admin dashboard
- Admin features hidden from customers
- Proper authentication required for protected pages

---

## User Story Mapping

### Priority Levels

**Must Have (MVP):**
- US-004: Book an Appointment
- US-005: Select Service
- US-006: Choose Date and Time
- US-007: Enter Personal Details
- US-016: Admin Login
- US-017: View All Appointments

**Should Have:**
- US-008: Receive Booking Confirmation
- US-009: Pay Online for Appointment
- US-012: Create Customer Account
- US-019: View Business Statistics
- US-020: Manage Services
- US-021: View Customer Messages

**Could Have:**
- US-013: Login to Account
- US-014: View My Appointments
- US-024: Send Message to Business
- US-022: Manage Customer Messages

**Nice to Have:**
- US-025: View Contact Information
- US-027: Mobile Access
- US-028: View Studio Location

---

## Implementation Status

Total User Stories: 30
- Completed: 30
- In Progress: 0
- Not Started: 0

Completion Rate: 100%

---

## User Journey Examples

### Journey 1: First-Time Customer Booking
1. Visits homepage (US-001)
2. Views services (US-002)
3. Clicks "Book Appointment" (US-004)
4. Selects service (US-005)
5. Chooses date/time (US-006)
6. Enters details (US-007)
7. Reviews and confirms (US-008)
8. Chooses payment method (US-010)
9. Completes payment (US-009)
10. Receives confirmation (US-008)

### Journey 2: Returning Customer
1. Visits website (US-026)
2. Clicks "Customer Login" (US-013)
3. Logs in with credentials
4. Views appointment dashboard (US-014)
5. Books new appointment (US-004)
6. Logs out (US-015)

### Journey 3: Business Owner Daily Operations
1. Logs into admin dashboard (US-016)
2. Reviews today's appointments (US-017)
3. Checks business statistics (US-019)
4. Views new customer messages (US-021)
5. Marks messages as read (US-022)
6. Updates appointment statuses (US-018)
7. Manages services if needed (US-020)
8. Logs out (US-023)

---

## Notes for Professor

All 30 user stories have been successfully implemented and tested. The application provides a complete booking system with customer management, payment processing, and business analytics.

The system addresses real-world business needs for a home-based nail artistry studio, providing both customer-facing features and comprehensive admin tools for business management.


