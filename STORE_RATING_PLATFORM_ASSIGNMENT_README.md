# Store Rating Platform --- FullStack Intern Coding Challenge

## 1. Assignment Overview

Build a full-stack web application where users can view registered
stores and submit ratings from **1 to 5**.

The application must use a **single login system** for all users. After
login, the system must identify the user's role and provide only the
functionality available to that role.

This README is intended to be used as the implementation specification
for the assignment. Do not add major functionality that is not required
here unless it is necessary for the application to work.

------------------------------------------------------------------------

## 2. Required Technology Stack

Use the following stack:

### Frontend

-   ReactJS

### Backend

Use **one** of: - ExpressJS - LoopBack - NestJS

For this implementation, use:

**ExpressJS**

### Database

Use **one** of: - PostgreSQL - MySQL

For this implementation, use:

**PostgreSQL**

### Final Stack

``` text
Frontend  : ReactJS
Backend   : ExpressJS
Database  : PostgreSQL
```

------------------------------------------------------------------------

# 3. Core Requirements

The application must:

1.  Allow users to submit ratings for registered stores.
2.  Allow ratings only from **1 to 5**.
3.  Provide one login system for all users.
4.  Provide role-based access after login.
5.  Allow normal users to register themselves.
6.  Allow the System Administrator to manage stores and users.
7.  Allow Store Owners to see ratings submitted for their store.
8.  Support searching, filtering, and sorting where required.
9.  Follow good frontend, backend, API, authentication, validation, and
    database design practices.

The original assignment explicitly defines three roles:

1.  System Administrator
2.  Normal User
3.  Store Owner

------------------------------------------------------------------------

# 4. User Roles

## 4.1 System Administrator

The System Administrator manages the platform.

### Required capabilities

The administrator can:

-   Add new stores.
-   Add new normal users.
-   Add new admin users.
-   View dashboard statistics.
-   View store listings.
-   View normal/admin user listings.
-   Filter listings.
-   View user details.
-   Log out.

### Administrator Dashboard

Display:

-   Total number of users
-   Total number of stores
-   Total number of submitted ratings

Example:

``` text
+-------------------+
| Total Users: 120  |
+-------------------+

+-------------------+
| Total Stores: 35  |
+-------------------+

+-------------------+
| Total Ratings: 480|
+-------------------+
```

These values should come from the database and must not be hard-coded.

------------------------------------------------------------------------

## 4.2 Normal User

A Normal User is a user who can browse stores and submit ratings.

### Required capabilities

The Normal User can:

-   Sign up.
-   Log in.
-   Update their password.
-   View all registered stores.
-   Search stores by Name.
-   Search stores by Address.
-   See the overall rating of each store.
-   See their own submitted rating.
-   Submit a rating.
-   Modify their submitted rating.
-   Log out.

### Signup Fields

The registration form must contain:

-   Name
-   Email
-   Address
-   Password

------------------------------------------------------------------------

## 4.3 Store Owner

A Store Owner manages/view ratings for their store.

### Required capabilities

The Store Owner can:

-   Log in.
-   Update their password.
-   View a list of users who submitted ratings for their store.
-   See the average rating of their store.
-   Log out.

The Store Owner must not be able to access System Administrator
functionality.

------------------------------------------------------------------------

# 5. Authentication and Authorization

## 5.1 Single Login System

There must be one login page for all roles.

Example:

``` text
             LOGIN
        +----------------+
Email   |                |
        +----------------+

Password
        +----------------+
        | ************** |
        +----------------+

        [ Login ]
```

The backend determines the user's role after successful authentication.

The frontend then redirects the user to the appropriate dashboard.

Example:

``` text
                    LOGIN
                      |
                      v
                Authenticate
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       ADMIN       USER        STORE OWNER
          |           |           |
          v           v           v
     Admin UI     User UI     Owner UI
```

------------------------------------------------------------------------

# 6. Role-Based Access Control

Authorization must be enforced on the **backend**, not only in React.

Do not rely on hiding frontend buttons as the security mechanism.

Example:

``` text
GET /api/admin/stores

Allowed:
    ADMIN

Denied:
    NORMAL_USER
    STORE_OWNER
```

Likewise:

``` text
GET /api/owner/dashboard

Allowed:
    STORE_OWNER

Denied:
    ADMIN
    NORMAL_USER
```

The backend should return an appropriate HTTP status such as `401` or
`403` when authentication/authorization fails.

------------------------------------------------------------------------

# 7. Database Design

Use PostgreSQL.

The recommended core entities are:

``` text
users
stores
ratings
```

## 7.1 Users Table

Recommended fields:

``` text
users
--------------------------------
id              PRIMARY KEY
name            VARCHAR
email           VARCHAR UNIQUE
password_hash   VARCHAR
address         VARCHAR
role            VARCHAR
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Role values

Use the three roles defined by the assignment:

``` text
ADMIN
NORMAL_USER
STORE_OWNER
```

The assignment says the System Administrator can add "admin users", but
it does not define a separate Admin User role or a separate set of
permissions.

Therefore, for this implementation:

> "Admin users" are treated as users with the `ADMIN` role.

Document this assumption in the project.

------------------------------------------------------------------------

## 7.2 Stores Table

Recommended fields:

``` text
stores
--------------------------------
id              PRIMARY KEY
name            VARCHAR
email           VARCHAR
address         VARCHAR
owner_id        FOREIGN KEY -> users.id
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

The assignment explicitly requires the administrator to add stores and
identifies Store Owners as users who can see ratings for their store.

The assignment does not explicitly define the database relationship
between a store and its owner. For this implementation, use:

``` text
stores.owner_id -> users.id
```

Recommended relationship:

``` text
User
 |
 | 1
 |
 | owns
 |
 v
Store
 |
 | 1
 |
 | receives
 |
 v
Ratings
```

For the assignment implementation, assume:

``` text
One Store Owner -> One Store
```

This is an implementation assumption because the original document does
not specify whether one Store Owner can own multiple stores.

------------------------------------------------------------------------

## 7.3 Ratings Table

Recommended fields:

``` text
ratings
--------------------------------
id              PRIMARY KEY
user_id         FOREIGN KEY -> users.id
store_id        FOREIGN KEY -> stores.id
rating          INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

Rating must be:

``` text
1 <= rating <= 5
```

### Important constraint

A Normal User should have only one active rating for a particular store.

Therefore use a unique constraint:

``` text
UNIQUE(user_id, store_id)
```

If the same user submits another rating for the same store, update the
existing rating instead of creating another rating.

This matches the requirement that the user can "modify their submitted
rating."

------------------------------------------------------------------------

# 8. Database Relationship

The main relationship should look like this:

``` text
                    USERS
              +----------------+
              | id             |
              | name           |
              | email          |
              | password_hash  |
              | address        |
              | role           |
              +-------+--------+
                      |
          +-----------+-----------+
          |                       |
      owner_id                 user_id
          |                       |
          v                       v
      +-------+              +----------+
      | STORES|              | RATINGS  |
      +---+---+              +----+-----+
          |                       |
          | store_id              |
          +-----------------------+
```

More explicitly:

``` text
users.id
   |
   +---- stores.owner_id

users.id
   |
   +---- ratings.user_id

stores.id
   |
   +---- ratings.store_id
```

------------------------------------------------------------------------

# 9. Store and Store Owner Flow

Because the original assignment does not explicitly describe how Store
Owners are created or linked to stores, use the following implementation
assumption.

## Step 1 --- Administrator creates Store Owner

The System Administrator creates a user with:

``` text
Role = STORE_OWNER
```

## Step 2 --- Administrator creates Store

The System Administrator creates the store.

The store should be associated with the Store Owner using:

``` text
stores.owner_id
```

## Step 3 --- Store Owner logs in

The Store Owner uses the common login page.

After authentication:

``` text
role = STORE_OWNER
```

The frontend opens the Store Owner dashboard.

## Step 4 --- Backend finds the owner's store

The backend uses the authenticated user's ID:

``` sql
SELECT *
FROM stores
WHERE owner_id = authenticated_user_id;
```

Then it retrieves:

-   Users who submitted ratings
-   Their ratings
-   Average rating

------------------------------------------------------------------------

# 10. Rating Logic

Ratings must be integers from **1 to 5**.

Allowed:

``` text
1
2
3
4
5
```

Not allowed:

``` text
0
6
4.5
-1
abc
```

The backend must validate the rating even if the frontend already
validates it.

### Example

User submits:

``` text
Store: ABC Store
Rating: 4
```

Create:

``` text
ratings
--------------------------------
user_id   = current user
store_id  = ABC Store
rating    = 4
```

If the same user later submits:

``` text
Rating: 5
```

Update the existing record:

``` text
rating = 5
```

Do not create a duplicate rating for the same user/store combination.

------------------------------------------------------------------------

# 11. Overall Store Rating

The store listing must display the store's:

``` text
Overall Rating
```

This should be calculated from submitted ratings.

Example:

``` text
Ratings:
5
4
4
3

Average:
(5 + 4 + 4 + 3) / 4 = 4.0
```

A store with no ratings should not be given a fake numeric rating.

Recommended display:

``` text
No ratings yet
```

This is an implementation assumption because the assignment does not
specify how unrated stores should be displayed.

------------------------------------------------------------------------

# 12. Normal User Store Listing

The Normal User must be able to see all registered stores.

Each store row/card must show:

``` text
Store Name
Address
Overall Rating
User's Submitted Rating
Submit Rating
Modify Rating
```

Example:

``` text
----------------------------------------------------
ABC Store

Address:
Pune, Maharashtra

Overall Rating:
4.2

Your Rating:
4

[ Modify Rating ]
----------------------------------------------------
```

For a store the user has not rated:

``` text
Overall Rating:
4.2

Your Rating:
Not submitted

[ Submit Rating ]
```

------------------------------------------------------------------------

# 13. Store Search

Normal Users must be able to search stores using:

-   Store Name
-   Store Address

Example:

``` text
Search by name:
[ ABC                         ]

Search by address:
[ Pune                        ]
```

The search should query/filter the registered stores.

The exact search matching behavior is not specified in the assignment,
so use a reasonable implementation such as case-insensitive partial
matching.

------------------------------------------------------------------------

# 14. Administrator Store List

The administrator must be able to view stores with:

``` text
Name
Email
Address
Rating
```

Example:

  Name        Email             Address   Rating
  ----------- ----------------- --------- --------
  ABC Store   abc@example.com   Pune      4.2

The rating should be calculated from the ratings table.

------------------------------------------------------------------------

# 15. Administrator User List

The administrator must be able to view normal and admin users with:

``` text
Name
Email
Address
Role
```

Example:

  Name            Email               Address   Role
  --------------- ------------------- --------- -------------
  Example User    user@example.com    Pune      NORMAL_USER
  Example Admin   admin@example.com   Mumbai    ADMIN

The assignment specifically says the administrator can view a list of
**normal and admin users**.

It does not explicitly say whether Store Owners must appear in this
particular listing. Do not silently change the requirement; if Store
Owners are included, make the behavior clear in the implementation.

------------------------------------------------------------------------

# 16. Administrator User Details

The administrator can view:

``` text
Name
Email
Address
Role
```

If the selected user is a Store Owner, their store rating should also be
displayed.

The assignment wording says:

> If the user is a Store Owner, their Rating should also be displayed.

For this implementation, interpret this as the rating/average rating
associated with the Store Owner's store.

------------------------------------------------------------------------

# 17. Administrator Filters

The administrator must be able to filter listings using:

-   Name
-   Email
-   Address
-   Role

Filters should be implemented where the corresponding field exists.

Example:

``` text
Name:
[ Nilesh ]

Email:
[ @gmail.com ]

Address:
[ Pune ]

Role:
[ NORMAL_USER ]
```

The filtering can be implemented through backend query parameters.

Example:

``` text
GET /api/admin/users?name=Nilesh&role=NORMAL_USER
```

------------------------------------------------------------------------

# 18. Sorting

All tables/listings should support ascending and descending sorting for
key fields such as:

-   Name
-   Email
-   Address
-   Role
-   Rating

Example:

``` text
Name ↑
Name ↓
```

The frontend should clearly indicate the current sort direction.

Prefer backend sorting for larger datasets rather than downloading the
entire dataset and sorting only in React.

------------------------------------------------------------------------

# 19. Form Validation

The assignment explicitly requires the following validation rules.

## Name

``` text
Minimum: 20 characters
Maximum: 60 characters
```

This requirement applies to the relevant Name fields.

Do not silently reduce the minimum to a more convenient value.

------------------------------------------------------------------------

## Address

``` text
Maximum: 400 characters
```

------------------------------------------------------------------------

## Password

Password must:

``` text
Minimum length = 8
Maximum length = 16
At least one uppercase letter
At least one special character
```

Example valid password:

``` text
Password@1
```

Example invalid passwords:

``` text
password
password123
PASSWORD123
abc@12
```

The backend must also validate the password.

------------------------------------------------------------------------

## Email

Email must follow standard email validation rules.

Email addresses should be unique for user accounts.

------------------------------------------------------------------------

# 20. Password Security

Never store plain-text passwords.

Store only a secure password hash.

Recommended:

``` text
bcrypt
```

Example flow:

``` text
User Password
      |
      v
bcrypt hash
      |
      v
Database
```

During login:

``` text
Entered Password
      |
      v
Compare with stored hash
      |
      v
Authenticated / Rejected
```

------------------------------------------------------------------------

# 21. Authentication Token

Use a standard authentication mechanism such as JWT for the API.

Example:

``` text
POST /api/auth/login
```

Response:

``` json
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "...",
    "role": "NORMAL_USER"
  }
}
```

Do not expose the password hash to the frontend.

------------------------------------------------------------------------

# 22. Recommended API Structure

The exact API naming is not specified by the assignment. The following
is a recommended REST API structure.

## Authentication

``` text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/change-password
```

------------------------------------------------------------------------

## Admin

``` text
GET    /api/admin/dashboard
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/:id

GET    /api/admin/stores
POST   /api/admin/stores
```

------------------------------------------------------------------------

## Normal User

``` text
GET    /api/stores
GET    /api/stores/:id
POST   /api/stores/:id/rating
PUT    /api/stores/:id/rating
POST   /api/auth/change-password
```

------------------------------------------------------------------------

## Store Owner

``` text
GET /api/owner/dashboard
POST /api/auth/change-password
```

The exact endpoint structure can be changed if the implementation uses a
different clean REST design.

------------------------------------------------------------------------

# 23. Recommended Frontend Pages

## Public

``` text
/login
/register
```

## Admin

``` text
/admin/dashboard
/admin/users
/admin/users/:id
/admin/stores
```

## Normal User

``` text
/user/stores
/user/change-password
```

## Store Owner

``` text
/owner/dashboard
/owner/change-password
```

------------------------------------------------------------------------

# 24. Frontend Route Protection

Protected pages must not be accessible to unauthenticated users.

Example:

``` text
/admin/dashboard
```

requires:

``` text
authenticated + ADMIN
```

Example:

``` text
/user/stores
```

requires:

``` text
authenticated + NORMAL_USER
```

Example:

``` text
/owner/dashboard
```

requires:

``` text
authenticated + STORE_OWNER
```

If a user attempts to access a page belonging to another role, show an
appropriate unauthorized response or redirect.

------------------------------------------------------------------------

# 25. Suggested Project Structure

Use a clean separation between frontend and backend.

``` text
store-rating-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── models/
│   │   ├── validators/
│   │   ├── config/
│   │   └── app.js
│   ├── migrations/
│   ├── seeders/
│   ├── package.json
│   └── ...
│
├── README.md
├── .env.example
└── .gitignore
```

The exact structure may differ, but responsibilities should remain
separated.

------------------------------------------------------------------------

# 26. Backend Best Practices

The backend should:

-   Validate all incoming data.
-   Validate authorization on protected endpoints.
-   Hash passwords.
-   Never return passwords/password hashes.
-   Use parameterized queries or a trusted ORM/query builder.
-   Handle errors consistently.
-   Use appropriate HTTP status codes.
-   Keep database credentials in environment variables.
-   Avoid putting secrets in source code.
-   Keep business logic out of route definitions where practical.
-   Use database constraints in addition to application validation.

------------------------------------------------------------------------

# 27. Frontend Best Practices

The frontend should:

-   Use reusable components.
-   Keep API calls in a service/API layer.
-   Protect routes based on authentication and role.
-   Show useful validation messages.
-   Show loading states.
-   Show error states.
-   Avoid duplicated UI logic.
-   Keep forms manageable and reusable.
-   Clearly indicate successful operations.
-   Clearly indicate failed operations.

------------------------------------------------------------------------

# 28. Environment Variables

Do not hard-code secrets.

Create:

``` text
.env.example
```

Example:

``` env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/store_rating
JWT_SECRET=replace_with_secure_secret
```

The real `.env` file must not be committed to Git.

------------------------------------------------------------------------

# 29. Error Handling

Use consistent API responses.

Example success:

``` json
{
  "success": true,
  "data": {}
}
```

Example error:

``` json
{
  "success": false,
  "message": "Invalid rating. Rating must be between 1 and 5."
}
```

Do not expose internal database errors or secrets to users.

------------------------------------------------------------------------

# 30. Important Business Rules

The implementation must follow these rules:

### Rule 1

Ratings are only from 1 to 5.

### Rule 2

A Normal User can rate a store.

### Rule 3

A Normal User can modify their existing rating.

### Rule 4

Do not create duplicate ratings for the same user and store.

### Rule 5

Store overall rating is calculated from submitted ratings.

### Rule 6

Store Owners can see users who rated their store.

### Rule 7

Store Owners can see the average rating of their store.

### Rule 8

Users must authenticate before accessing protected functionality.

### Rule 9

Role permissions must be enforced by the backend.

### Rule 10

Passwords must be stored as hashes, never plain text.

------------------------------------------------------------------------

# 31. Seed Data

For development/testing, create a database seed mechanism.

Seed data should include at least:

``` text
1 ADMIN
2 NORMAL_USER
1 STORE_OWNER
1 STORE
Several RATINGS
```

Example conceptual data:

``` text
ADMIN
admin@example.com

NORMAL_USER
user1@example.com
user2@example.com

STORE_OWNER
owner@example.com

STORE
ABC Store
owner@example.com
```

The actual names, emails, and passwords can be development-only sample
values.

Do not expose real credentials in the repository.

------------------------------------------------------------------------

# 32. Dashboard Data

## Admin Dashboard

The dashboard must calculate:

``` text
totalUsers
totalStores
totalRatings
```

These should be obtained from database queries.

Example:

``` sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM ratings;
```

------------------------------------------------------------------------

## Store Owner Dashboard

The dashboard should show:

``` text
Store
Average Rating
Rating Users
```

Example:

``` text
My Store: ABC Store

Average Rating:
4.3

Users:
--------------------------------
User A     5
User B     4
User C     4
```

The owner should only receive data for their own store.

------------------------------------------------------------------------

# 33. Security Requirements

At minimum:

-   Password hashing.
-   JWT/session authentication.
-   Backend role authorization.
-   Input validation.
-   SQL injection protection.
-   CORS configuration appropriate for development/production.
-   No passwords in API responses.
-   No secrets in Git.
-   Environment variables for credentials/secrets.

------------------------------------------------------------------------

# 34. What NOT to Add

Do not unnecessarily expand the assignment with features that are not
required.

Unless specifically needed, do not add:

-   Payments
-   Orders
-   Product management
-   Reviews/comments
-   Images
-   Social login
-   Email verification
-   OTP
-   Forgot-password email system
-   Notifications
-   Chat
-   Favorites
-   Maps
-   Advanced analytics
-   Subscription systems

The goal is to correctly implement the specified Store Rating Platform,
not to build an unrelated large product.

------------------------------------------------------------------------

# 35. Known Ambiguities and Implementation Assumptions

The original assignment leaves some details unspecified. These must be
handled consistently.

## Ambiguity 1 --- Admin User Role

The assignment says the System Administrator can add "admin users", but
only three roles are explicitly defined:

``` text
System Administrator
Normal User
Store Owner
```

There is no separate Admin User functionality section.

### Implementation assumption

Use:

``` text
ADMIN
```

for System Administrators/admin accounts.

Do not create a fourth role unless the evaluator provides additional
requirements.

------------------------------------------------------------------------

## Ambiguity 2 --- Who Creates Store Owners?

The assignment says Store Owners can log in, but does not explicitly
explain how their accounts are created.

### Implementation assumption

The System Administrator creates Store Owner accounts.

------------------------------------------------------------------------

## Ambiguity 3 --- How Is a Store Connected to a Store Owner?

The assignment does not explicitly define the database relationship.

### Implementation assumption

Use:

``` text
stores.owner_id -> users.id
```

When an administrator creates a store, the administrator assigns the
Store Owner.

------------------------------------------------------------------------

## Ambiguity 4 --- Multiple Stores Per Owner

The assignment uses the wording "their store", but does not specify
whether one owner can have multiple stores.

### Implementation assumption

Implement:

``` text
One Store Owner -> One Store
```

If the evaluator clarifies otherwise, the schema can be changed to
support one-to-many ownership.

------------------------------------------------------------------------

## Ambiguity 5 --- Unrated Stores

The assignment does not specify what to show if no user has rated a
store.

### Implementation assumption

Display:

``` text
No ratings yet
```

instead of inventing a numeric rating.

------------------------------------------------------------------------

## Ambiguity 6 --- Rating Precision

The assignment does not specify decimal precision for average ratings.

### Implementation assumption

Display the average rating to a reasonable precision, such as:

``` text
4.2
```

Keep the underlying calculation accurate.

------------------------------------------------------------------------

## Ambiguity 7 --- Search Behavior

The assignment requires searching by Name and Address but does not
specify exact matching rules.

### Implementation assumption

Use case-insensitive partial matching.

------------------------------------------------------------------------

# 36. Out of Scope

The following are not required by the assignment:

-   Store deletion
-   User deletion
-   Store editing
-   User editing
-   Account suspension
-   Pagination
-   Email verification
-   Password reset
-   Audit logs
-   Notifications
-   Image uploads
-   Store categories
-   Comments/reviews
-   Favorites
-   Payments

These can be added only if explicitly requested later.

------------------------------------------------------------------------

# 37. Recommended Development Order

Build the application in this order:

## Phase 1 --- Project Setup

-   Create React frontend.
-   Create Express backend.
-   Configure PostgreSQL.
-   Configure environment variables.
-   Configure Git.
-   Create base project structure.

## Phase 2 --- Database

Create:

``` text
users
stores
ratings
```

Add:

-   Primary keys.
-   Foreign keys.
-   Unique email constraint.
-   Unique `(user_id, store_id)` rating constraint.
-   Rating range constraint where supported.

## Phase 3 --- Authentication

Implement:

-   Registration.
-   Login.
-   Password hashing.
-   JWT/session handling.
-   Authentication middleware.
-   Role middleware.

## Phase 4 --- Admin

Implement:

-   Admin dashboard.
-   User creation.
-   Store creation.
-   Store-owner assignment.
-   User listing.
-   User details.
-   Store listing.
-   Filters.
-   Sorting.

## Phase 5 --- Normal User

Implement:

-   Registration.
-   Login.
-   Store listing.
-   Search.
-   Overall rating.
-   Own rating.
-   Submit rating.
-   Modify rating.
-   Change password.

## Phase 6 --- Store Owner

Implement:

-   Login.
-   Change password.
-   Owner dashboard.
-   Rating users.
-   Average store rating.

## Phase 7 --- Validation and Error Handling

Verify:

-   Name validation.
-   Address validation.
-   Password validation.
-   Email validation.
-   Rating validation.
-   Duplicate rating prevention.
-   Authorization.

## Phase 8 --- Testing

Test every role and every protected endpoint.

## Phase 9 --- UI Polish

Only after the functionality works:

-   Improve layout.
-   Improve responsiveness.
-   Improve loading states.
-   Improve error messages.
-   Improve empty states.
-   Improve tables/forms.

------------------------------------------------------------------------

# 38. Testing Checklist

## Authentication

-   [ ] Normal User can register.
-   [ ] Normal User can log in.
-   [ ] Admin can log in.
-   [ ] Store Owner can log in.
-   [ ] Invalid credentials are rejected.
-   [ ] Password is never returned by API.
-   [ ] Protected routes require authentication.

## Authorization

-   [ ] Admin can access admin routes.
-   [ ] Normal User cannot access admin routes.
-   [ ] Store Owner cannot access admin routes.
-   [ ] Normal User cannot access owner routes.
-   [ ] Admin cannot access owner-only functionality unless explicitly
    allowed.

## Admin

-   [ ] Dashboard shows total users.
-   [ ] Dashboard shows total stores.
-   [ ] Dashboard shows total ratings.
-   [ ] Admin can create users.
-   [ ] Admin can create stores.
-   [ ] Admin can assign Store Owner.
-   [ ] Admin can view stores.
-   [ ] Admin can view users.
-   [ ] Admin can filter.
-   [ ] Admin can sort.
-   [ ] Admin can view user details.
-   [ ] Store Owner details show store rating.

## Normal User

-   [ ] Can view all stores.
-   [ ] Can search by name.
-   [ ] Can search by address.
-   [ ] Can submit a rating.
-   [ ] Rating accepts 1--5 only.
-   [ ] User's own rating is displayed.
-   [ ] User can modify rating.
-   [ ] Duplicate rating rows are not created.
-   [ ] User can change password.

## Store Owner

-   [ ] Can log in.
-   [ ] Can change password.
-   [ ] Can see average rating.
-   [ ] Can see users who rated their store.
-   [ ] Cannot see another owner's store data.

## Validation

-   [ ] Name minimum 20 characters.
-   [ ] Name maximum 60 characters.
-   [ ] Address maximum 400 characters.
-   [ ] Password minimum 8 characters.
-   [ ] Password maximum 16 characters.
-   [ ] Password contains uppercase letter.
-   [ ] Password contains special character.
-   [ ] Email validation works.
-   [ ] Duplicate user email is rejected.

## Sorting

-   [ ] Ascending sorting works.
-   [ ] Descending sorting works.
-   [ ] Name sorting works.
-   [ ] Email sorting works.
-   [ ] Other relevant table fields can be sorted.

------------------------------------------------------------------------

# 39. Definition of Done

The assignment is complete when:

1.  React frontend is working.
2.  Express backend is working.
3.  PostgreSQL database is connected.
4.  One login system works for all roles.
5.  Role-based authorization works.
6.  Normal User registration works.
7.  Admin dashboard works.
8.  Admin can create users.
9.  Admin can create stores.
10. Stores can be associated with Store Owners.
11. Normal Users can view/search stores.
12. Normal Users can submit ratings from 1--5.
13. Normal Users can modify ratings.
14. Store overall ratings are calculated.
15. Store Owners can see their store's average rating.
16. Store Owners can see users who submitted ratings.
17. Required validation is implemented.
18. Required filtering is implemented.
19. Required sorting is implemented.
20. Passwords are securely hashed.
21. Backend authorization is enforced.
22. Database relationships and constraints are correctly implemented.
23. No required feature is hard-coded.
24. The project can be installed and run using the README instructions.

------------------------------------------------------------------------

# 40. Final Implementation Principle

Prioritize **correctness, security, clean architecture, and requirement
coverage** over unnecessary features.

When a requirement is explicitly defined above, implement it.

When the original assignment does not define a behavior, use the
assumptions in this README rather than inventing a large new feature.

Keep the implementation simple enough to understand and maintain, while
following professional frontend, backend, API, authentication,
validation, and database practices.
