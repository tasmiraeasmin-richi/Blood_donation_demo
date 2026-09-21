**RaktoSetu --- Frontend Page & UI Requirements**

*React + Tailwind CSS + DaisyUI + React Router*

Based on the provided Backend Overview and Frontend Requirements

# 1. Document Purpose

This document defines the frontend pages, routes, UI sections, data
requirements, states, forms, actions, and responsive behavior required
for the RaktoSetu Blood Donation and Emergency Assistance Platform. The
page plan is derived from the supplied backend models/endpoints and the
supplied frontend marking requirements.

# 2. Technology & UX Requirements

-   React with React Router for routing and protected routes.

-   Tailwind CSS for responsive styling and DaisyUI where useful for UI
    primitives.

-   React Icons for interface icons.

-   React Hot Toast for success/error feedback.

-   JWT-based authentication state with 30-minute token expiry handling.

-   Separate Admin and Member route/UI access.

-   Reusable components for Navbar, Footer, Sidebar, Breadcrumb, Cards,
    Tables, Modals, Forms, Pagination and Empty/Loading/Error states.

-   Responsive layouts for mobile, tablet and desktop.

-   Search, filtering, sorting and pagination wherever list data can
    become large.

# 3. User Roles & Core Navigation

Member can act as donor/requester. Admin has moderation and management
privileges.

  -----------------------------------------------------------------------
  Role                    Main Navigation         Restricted Areas
  ----------------------- ----------------------- -----------------------
  Guest                   Home, Donors, Blood     Create request, offer
                          Requests, Camps, Login, donation, personal
                          Signup                  dashboard

  Member                  Home, Find Donors,      Admin management
                          Blood Requests, Camps,  
                          Dashboard, Profile      

  Admin                   Admin Dashboard,        Member-only actions
                          Requests, Users,        where not applicable
                          Donations, Camps,       
                          Profile                 
  -----------------------------------------------------------------------

# 4. Public Pages

## 4.1 Home / Landing Page

Route: /

UI / Data:

-   Hero section with emergency blood-donation message and primary CTAs:
    Find Blood / Become a Donor

-   Quick search/action cards for Blood Requests, Donor Directory and
    Blood Camps

-   How RaktoSetu works: Request → Donor Offer → Accept → Fulfill

-   Urgency-focused statistics/impact section if backend stats are
    available

-   Upcoming blood camps preview

-   Recent/active approved blood requests preview

-   Trust/safety section explaining verified requests and privacy
    behavior

-   Footer with navigation and contact/help links

Backend data:

-   GET /requests

-   GET /camps

-   Optional GET /stats/me only after login

## 4.2 Login

Route: /login

UI / Data:

-   Email/password form

-   Remember authentication state via JWT

-   Forgot password link

-   Signup link

-   Loading state on submit

-   Invalid credential/error feedback

-   Redirect after successful login based on role

Backend data:

-   POST /login

## 4.3 Signup

Route: /signup

UI / Data:

-   Full name, email, phone, password, confirm password

-   Blood group selector

-   District selector/input

-   Optional initial donor availability state

-   Client-side validation

-   Password visibility toggle

-   Success toast and redirect to login/dashboard

Backend data:

-   POST /createuser

## 4.4 Forgot Password

Route: /forgot-password

UI / Data:

-   Email field

-   Submit/reset-link request button

-   Success/error state

-   Back to login link

Backend data:

-   POST /forgot-password

## 4.5 Reset Password

Route: /reset-password/:token

UI / Data:

-   New password and confirm password

-   Password validation

-   Expired/invalid token state

-   Success state and redirect to login

Backend data:

-   POST /reset-password/{token}

## 4.6 Donor Directory

Route: /donors

UI / Data:

-   Search by name/district

-   Filter by blood group and availability

-   Donor cards/table with name, blood group, district and availability
    badge

-   Phone must remain hidden for guests

-   Eligibility indication based on last donation date where provided

-   Pagination, loading, empty and error states

Backend data:

-   GET /donors

## 4.7 Blood Request Directory

Route: /requests

UI / Data:

-   Approved request list

-   Search by request code/patient/hospital/district

-   Filter by blood group, urgency and status

-   Sort by required date/urgency

-   Request cards/table

-   Urgency badges: normal/urgent/critical

-   Pagination and empty/error/loading states

Backend data:

-   GET /requests

## 4.8 Blood Request Details

Route: /requests/:id

UI / Data:

-   Request code, patient name, blood group, units, hospital, district,
    required date, urgency and status

-   Requester-facing actions where authorized

-   Donate/Offer button for eligible members

-   Owner actions: view offers and fulfill when applicable

-   Contact phone visibility according to offer acceptance rules

-   Rejection reason when rejected

Backend data:

-   GET /requests/{id}

-   POST /requests/{id}/offers

-   GET /requests/{id}/offers

-   PATCH /requests/{id}/fulfill

## 4.9 Blood Camps

Route: /camps

UI / Data:

-   Upcoming/completed camp tabs or filters

-   Search/filter by district/date

-   Camp cards with title, organizer, venue, date and status

-   Pagination if needed

Backend data:

-   GET /camps

## 4.10 Camp Details

Route: /camps/:id

UI / Data:

-   Title, organizer, district, venue, date, status

-   Clear upcoming/completed badge

-   Navigation back to camps

Backend data:

-   GET /camps/{id}

# 5. Member / User Pages

## 5.1 Member Dashboard

Route: /dashboard

UI / Data:

-   Welcome/header with user name

-   Summary cards: My Requests, My Offers, Donations, current donor
    availability

-   Recent requests/offers/donations

-   Quick actions: Create Request, Find Donors, View My Offers

-   Eligibility/availability status with clear explanation

-   Loading/error/empty states

Backend data:

-   GET /stats/me

-   GET /requests/my

-   GET /offers/my

-   GET /donations/my

## 5.2 Create Blood Request

Route: /dashboard/requests/create

UI / Data:

-   Patient name, blood group, units needed (1--10), hospital, district,
    contact phone, required date, urgency

-   Required-field validation

-   Units range validation

-   Date validation

-   Submit/cancel actions

-   Success toast and redirect to My Requests

Backend data:

-   POST /requests

## 5.3 My Blood Requests

Route: /dashboard/requests

UI / Data:

-   Own requests table/cards

-   Status badges: pending/approved/rejected/fulfilled

-   Search/filter/sort/pagination

-   View, edit and delete actions when permitted

-   Rejected requests show rejection reason

Backend data:

-   GET /requests/my

-   PUT /requests/{id}

-   DELETE /requests/{id}

## 5.4 Edit Blood Request

Route: /dashboard/requests/:id/edit

UI / Data:

-   Same editable fields as create form

-   Only pending own request can be edited

-   Confirmation before save if useful

-   Validation and API error handling

Backend data:

-   PUT /requests/{id}

## 5.5 My Offers

Route: /dashboard/offers

UI / Data:

-   Offers made by the member

-   Request code/patient, blood group, hospital, offer status

-   Statuses: offered/accepted/declined

-   Open request details

-   Clear accepted state and next action

Backend data:

-   GET /offers/my

## 5.6 Request Offers / Donor Responses

Route: /dashboard/requests/:id/offers

UI / Data:

-   Owner-only offer list

-   Donor name, blood group, district, availability/eligibility
    information where returned

-   Accept and decline actions

-   Confirmation modal

-   After acceptance, contact phone can be revealed according to backend
    rule

Backend data:

-   GET /requests/{id}/offers

-   PATCH /requests/{id}/offers/{offer_id}

## 5.7 Donation History

Route: /dashboard/donations

UI / Data:

-   Donation history table/cards

-   Hospital, donation date, units, linked request where available

-   Sort/filter by date

-   Empty state for no donations

Backend data:

-   GET /donations/my

## 5.8 Profile

Route: /profile

UI / Data:

-   Name, email, phone, blood group, district, donor availability, last
    donation date

-   Edit profile

-   Availability toggle

-   Change password

-   JWT/session-aware loading/error states

Backend data:

-   GET /user

-   PUT /edituser

-   PUT /passwordchange

# 6. Admin Pages

## 6.1 Admin Dashboard

Route: /admin

UI / Data:

-   KPI cards for total users, pending requests, approved/active
    requests, donations and camps as supported by /admin/stats

-   Recent pending requests

-   Recent users/donations/camps where available

-   Quick actions for moderation and management

-   Charts only if the backend returns suitable aggregate data;
    otherwise use summary cards/tables

Backend data:

-   GET /admin/stats

## 6.2 Request Management

Route: /admin/requests

UI / Data:

-   All requests including pending, approved, rejected and fulfilled

-   Search, filter by status/blood group/urgency/district, sorting and
    pagination

-   View details

-   Approve pending request

-   Reject request with rejection-reason modal/form

-   Fulfilled status visibility

Backend data:

-   GET /admin/requests

-   PATCH /admin/requests/{id}/approve

-   PATCH /admin/requests/{id}/reject

## 6.3 User Management

Route: /admin/users

UI / Data:

-   User list with name, email, phone, role, blood group, district,
    availability and status

-   Search/filter/sort/pagination

-   Block/unblock user

-   Change role

-   Delete user with confirmation modal

-   Protect UI from deleting/blocking the current admin where backend
    enforces self-protection

Backend data:

-   GET /admin/users

-   PATCH /admin/users/{id}/status

-   PATCH /admin/users/{id}/role

-   DELETE /admin/users/{id}

## 6.4 Donation Management

Route: /admin/donations

UI / Data:

-   Donation records table

-   Add manual donation

-   Edit donation

-   Delete donation

-   Fields: donor, request if applicable, hospital, donation date, units

-   Validation and confirmation modals

Backend data:

-   POST /admin/donations

-   PUT /admin/donations/{id}

-   DELETE /admin/donations/{id}

## 6.5 Blood Camp Management

Route: /admin/camps

UI / Data:

-   Camp list with upcoming/completed status

-   Add camp

-   Edit camp

-   Delete camp

-   Fields: title, organizer, district, venue, date

-   Search/filter/sort/pagination where useful

Backend data:

-   POST /admin/camps

-   PUT /admin/camps/{id}

-   DELETE /admin/camps/{id}

# 7. Shared Components

-   Public Navbar --- logo, Home, Donors, Requests, Camps, Login/Signup
    or user menu.

-   Member Navbar/Sidebar --- Dashboard, My Requests, My Offers,
    Donations, Profile.

-   Admin Sidebar --- Dashboard, Requests, Users, Donations, Camps.

-   Footer --- product summary, navigation, emergency/help information
    and copyright.

-   Breadcrumb component for dashboard/admin detail pages.

-   StatusBadge / UrgencyBadge / AvailabilityBadge.

-   SearchBar, FilterPanel, SortSelect and Pagination.

-   DataTable for admin and history screens; responsive card alternative
    on mobile.

-   RequestCard, DonorCard, CampCard.

-   Reusable Modal for approve/reject/delete/accept/decline
    confirmations.

-   FormInput, Select, DateInput, PasswordInput and validation message
    components.

-   LoadingSpinner/Skeleton, ErrorState, EmptyState.

-   ProtectedRoute and RoleBasedRoute.

-   Toast helper using react-hot-toast.

# 8. Important Business/UI Rules

-   JWT access token expires after 30 minutes; the frontend should
    detect expiry, clear auth state and redirect to login.

-   Admin and Member must have separate protected navigation and route
    access.

-   Only eligible donors can offer to donate. Eligibility is based on
    last_donation_date + 90 days; it is computed rather than stored.

-   A donor who is within the 90-day window should not be presented with
    an enabled donation-offer action.

-   A donor can offer only once for the same request.

-   A request follows pending → approved/rejected → fulfilled.

-   Only approved requests are shown in the public request directory.

-   Requester can accept/decline offers on their request.

-   Phone visibility follows the backend offer-acceptance rule; do not
    expose protected phone data in public cards.

-   Never display hash_password or reset_token.

-   Deleting, blocking, rejecting, declining or other destructive
    actions should use a confirmation modal where appropriate.

-   Every API-driven page must have loading, error and empty states.

# 9. Responsive Design Specification

-   Mobile: single-column cards/forms, collapsible drawer/sidebar,
    stacked filters, horizontally scrollable tables only when necessary.

-   Tablet: two-column card layouts where appropriate, compact
    sidebar/navigation.

-   Desktop: persistent admin/member sidebar, multi-column dashboard
    cards, full data tables.

-   Forms should never require horizontal scrolling.

-   Touch targets should be sufficiently large for mobile use.

-   Urgency/status colors should be supported by text labels/icons as
    well, not color alone.

# 10. Visual Design Direction

-   Primary visual language should communicate trust, urgency and
    healthcare without making the interface visually alarming.

-   Use a clean white/light surface with a strong blood-red primary
    accent, supported by neutral backgrounds.

-   Use consistent semantic states: success for accepted/fulfilled,
    warning for pending, danger for critical/rejected/destructive
    actions, neutral for completed/history.

-   Blood group should be visually prominent on donor/request cards.

-   Critical requests should be visually distinguishable but remain
    accessible with text/icon labels.

-   Use rounded cards, subtle borders/shadows, consistent spacing and
    clear hierarchy.

-   Use DaisyUI components only where they improve consistency; avoid
    mixing too many visual patterns.

# 11. Suggested Route Map

  ---------------------------------------------------------------------------------
  Area                    Route                             Access
  ----------------------- --------------------------------- -----------------------
  Public                  /                                 Public

  Auth                    /login, /signup,                  Public
                          /forgot-password,                 
                          /reset-password/:token            

  Public data             /donors, /requests,               Public; details may
                          /requests/:id, /camps, /camps/:id vary

  Member                  /dashboard, /dashboard/requests,  Member
                          /dashboard/requests/create,       
                          /dashboard/requests/:id/edit,     
                          /dashboard/offers,                
                          /dashboard/requests/:id/offers,   
                          /dashboard/donations, /profile    

  Admin                   /admin, /admin/requests,          Admin
                          /admin/users, /admin/donations,   
                          /admin/camps                      
  ---------------------------------------------------------------------------------

# 12. Frontend API Integration Checklist

-   Create a centralized API client with base URL from environment
    configuration.

-   Attach JWT Bearer token to protected requests.

-   Handle 401/expired-token globally.

-   Normalize API errors into user-friendly toast/form messages.

-   Keep API calls separate from presentation components.

-   Use reusable hooks/services for auth, requests, donors, offers,
    donations, camps and admin operations.

-   After mutations, refresh or update the relevant UI state so the user
    sees the new status immediately.

# 13. Frontend Completion Checklist Against the 50-Mark Requirements

-   Authentication: Login, Signup, Forgot/Reset Password, Protected
    Routes, JWT state, role-based access, Logout, token expiry, toast
    feedback.

-   Dashboard/Data: Member and Admin dashboards, API data display,
    search/filter/sort/pagination, loading/error/empty states, Admin
    CRUD.

-   Forms/Responsive: Create/Edit forms, validation, reusable
    components, mobile/tablet/desktop layouts.

-   Routing/UX: Navbar/Footer/Sidebar/Breadcrumb, role-based rendering,
    confirmation modals, meaningful feedback, clean component structure.

-   Required stack: React, React Router, Tailwind CSS, DaisyUI, React
    Icons, React Hot Toast.

# 14. Source Scope & Notes

The backend source defines the available entities, fields, endpoints,
role restrictions and business rules. The supplied frontend requirements
define the grading/implementation expectations such as React Router, JWT
state, role-based UI, CRUD, responsive design, reusable components,
loading/error/empty states and the required libraries. Where the backend
does not provide a specific aggregate or UI field, this document does
not assume that a new backend capability exists.
