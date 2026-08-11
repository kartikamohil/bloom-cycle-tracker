# 🌸 Bloom — Menstrual Cycle Tracker

Bloom is a full-stack menstrual cycle tracking web application designed to help users record, understand, and manage their menstrual cycles in a simple, private, and aesthetically pleasing environment.

Users can create an account, track their cycle dates, record flow and symptoms, add personal notes, manage their profile, and connect with others through Bloom Circles.

---

## ✨ Features

### 🌷 Menstrual Cycle Tracking

- Record menstrual cycle entries by date
- Track menstrual flow
- Record multiple symptoms
- Add personal notes
- View previously recorded entries
- Update existing cycle entries
- Store cycle information securely in the database

### 👤 User Accounts

- User registration and login
- Secure password hashing
- JWT-based authentication
- Individual user profiles
- Average cycle length tracking
- Average period length tracking

### 💕 Bloom Circles

Bloom includes a circle-based feature that allows users to connect with other users.

- Create a private circle
- Generate a unique circle code
- Join/follow an existing circle
- Store circle ownership information
- Track circle followers

### 🔐 Security

Bloom is designed with privacy and security in mind.

- Passwords are securely hashed
- JWT is used for authentication
- Sensitive configuration is stored in environment variables
- Personal notes can be encrypted before being stored
- Database credentials are never stored directly in the source code
- `.env` is excluded from GitHub using `.gitignore`

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Supabase

### Security & Authentication

- JSON Web Token (JWT)
- bcrypt
- dotenv
- Encryption for sensitive notes

### Development & Version Control

- npm
- Git
- GitHub

---

## 🏗️ Application Architecture

```text
                    🌸 BLOOM
                       │
                       ▼
                Frontend Interface
                       │
                       ▼
                Express.js API
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
       Authentication       Application APIs
             │                   │
             └─────────┬─────────┘
                       │
                       ▼
              PostgreSQL Database
                  via Supabase
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
      users      cycle_entries     circles
                                      │
                                      ▼
                              circle_followers

🗄️ Database

Bloom uses a PostgreSQL database hosted on Supabase.

users

Stores account and profile information.

Column	Description
id	Unique user ID
name	User's name
email	User's email
password_hash	Securely hashed password
avg_cycle_length	Average cycle length
avg_period_length	Average period length
circle_code	User's circle code
created_at	Account creation time
cycle_entries

Stores individual menstrual cycle records.

Column	Description
id	Unique entry ID
user_id	User associated with the entry
entry_date	Date of the entry
flow	Menstrual flow information
symptoms	Recorded symptoms
note_enc	Encrypted personal note
created_at	Entry creation time
updated_at	Last update time
circles

Stores Bloom circle information.

Column	Description
id	Unique circle ID
owner_id	User who owns the circle
circle_code	Unique circle code
created_at	Circle creation time
circle_followers

Stores relationships between users and circles.

Column	Description
id	Unique follower record
user_id	User following the circle
circle_id	Circle being followed
created_at	Date the relationship was created
📁 Project Structure
bloom-cycle-tracker/
│
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── server/
│   ├── index.js
│   ├── db.js
│   ├── postgres.js
│   ├── auth.js
│   ├── crypto.js
│   ├── predict.js
│   │
│   └── routes/
│       ├── auth.js
│       ├── profile.js
│       ├── entries.js
│       └── circle.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
🚀 Getting Started
Prerequisites

Before running Bloom locally, make sure you have:

Node.js installed
npm installed
A Supabase project
PostgreSQL database credentials for your Supabase project
1. Clone the Repository
git clone https://github.com/kartikamohil/bloom-cycle-tracker.git

Move into the project:

cd bloom-cycle-tracker
2. Install Dependencies

Run:

npm install

This installs all required backend dependencies.

3. Configure Environment Variables

Create a .env file in the root directory.

You can start from the example file:

copy .env.example .env

Add your own configuration:

PORT=3000

JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

DB_HOST=your_supabase_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=your_supabase_user
DB_PASSWORD=your_supabase_password
⚠️ Important

Never upload your .env file to GitHub.

It contains sensitive information such as:

Database password
JWT secret
Encryption key

The project .gitignore already excludes .env.

4. Start the Application

Run:

npm start

The server should start at:

http://localhost:3000

Open the address in your browser to use Bloom.

🔗 API Structure

Bloom uses an Express.js API to communicate between the frontend and database.

Authentication
POST /api/auth/register
POST /api/auth/login

Handles user registration and login.

Profile
GET /api/profile
PUT /api/profile

Handles user profile information.

Cycle Entries
GET /api/entries
POST /api/entries

Handles menstrual cycle entries.

Circles
POST /api/circle
POST /api/circle/follow
GET /api/circle

Handles Bloom Circle functionality.

Health Check
GET /api/health

Returns:

{
  "ok": true
}

This endpoint can be used to check whether the server is running correctly.

🔒 Security

Bloom uses several security practices to protect user information.

Environment Variables

Sensitive credentials are stored in .env rather than directly inside the source code.

Password Protection

User passwords are hashed before being stored in the database.

Authentication

JWT tokens are used to authenticate users when accessing protected API routes.

Database Protection

The application communicates with PostgreSQL through a server-side database connection rather than exposing database credentials to the frontend.

🧪 Current Project Status
Completed
 Frontend interface
 Node.js backend
 Express.js API
 User registration
 User login
 JWT authentication
 Password hashing
 Supabase PostgreSQL integration
 User database
 Cycle entries database
 Circles database
 Circle followers database
 Environment variable configuration
 Local development setup
In Progress
 Complete end-to-end testing
 Test all cycle tracking operations
 Test Bloom Circle functionality
 Production deployment
 Final UI/UX improvements
 Production environment configuration
🎯 Project Objectives

Bloom aims to:

Make menstrual cycle tracking simple and organized.
Allow users to securely store personal cycle information.
Provide an easy-to-use and aesthetically pleasing interface.
Demonstrate the use of a full-stack web architecture.
Implement secure authentication and database management.
Provide a private circle-based feature for connecting users.
Create a foundation that can be expanded with additional health and wellness features.
🌱 Future Improvements

Future versions of Bloom may include:

Cycle prediction improvements
Period reminders
Calendar-based cycle visualization
More detailed symptom analytics
Personalized insights
Mobile-friendly improvements
Push notifications
Expanded circle controls
Additional privacy controls
Production deployment and monitoring
🌸 Design Philosophy

Bloom is designed around the idea that menstrual health tracking should feel comfortable, approachable, and personal.

The interface focuses on:

Soft and calming visuals
Simple navigation
Clear information
Privacy
User-friendly interactions
A gentle and welcoming experience
👩‍💻 Author

Kartika Mohil

Computer Science & Engineering Student

🌷 Bloom

Track your cycle. Understand your patterns. Bloom with confidence.


### One important change from your old README

Your README should **no longer say that Bloom uses `server/data/bloom.json` as its database**. Your actual setup is now:

**Frontend → Node.js/Express → PostgreSQL → Supabase** ✅

And because you're still testing the application locally, I've marked deployment as **in progress** rather than claiming the website is already production-ready.

After you paste this into `README.md`, save it. Then run:

```powershell
git status
