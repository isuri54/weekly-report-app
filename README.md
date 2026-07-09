# Weekly Report Generator & Team Dashboard

A full-stack web application built for **Sisenco Digital** internship assignment. Enables team members to submit structured weekly reports and managers to monitor team performance through a comprehensive dashboard.

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/0b4cfe9d-ca43-4637-a034-d307d749b961" />


## Features

### For Team Members
- Create, edit, and submit weekly reports
- Fixed report structure for consistency
- View personal report history
- Project/category selection

### For Managers
- Team-wide dashboard with real-time insights
- Filter reports by week, member, or project
- Submission status tracking (Submitted / Pending / Late)
- Visual analytics with charts
- Manage projects and assign team members
- AI Chat Assistant for quick team insights

### Bonus Features
- **AI Chat Assistant** - Conversational Q&A about team activity
- Responsive, modern UI with dark theme
- Role-based access control

## Tech Stack

**Frontend**: React + TypeScript + Tailwind CSS + Recharts  
**Backend**: Node.js + Express + TypeScript  
**Database**: MongoDB + Mongoose  
**Authentication**: JWT  
**AI**: Groq (Llama 3.1)  
**Other**: Axios, React Router, React Hot Toast

## Setup Instructions

### 1. Clone the Repository
git clone https://github.com/isuri54/weekly-report-app.git
cd weekly-report-app

### 2. Backend Setup
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
Update .env:
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/weekly-reports
JWT_SECRET=your_secret_key_here
GROQ_API_KEY=gsk_...

### 3. Frontend Setup
cd frontend

# Install dependencies
npm install

### 4. Database Setup
Option A (Recommended - MongoDB Atlas)

Create free account at MongoDB Atlas
Create a cluster and get connection string
Update MONGO_URI in backend .env

Option B (Local MongoDB)
# Start MongoDB (if installed)
mongod

### 5. Run the Application
Terminal 1 - Backend
cd backend
npm run dev
Terminal 2 - Frontend
cd frontend
npm run dev
Open http://localhost:5173

## Screenshots

<img width="1917" height="1078" alt="Screenshot 2026-07-09 000934" src="https://github.com/user-attachments/assets/0dffa824-4629-4ad0-bda1-516ab0a88c92" />

<img width="1917" height="1078" alt="Screenshot 2026-07-09 000949" src="https://github.com/user-attachments/assets/df408d3f-4e3d-4f99-bee6-81933bb49a40" />

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/1b054d48-76a1-4a4b-990b-88484e411b1a" />

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/e322d13f-ae9d-4522-bb94-8de8a9ac7951" />

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/7395c208-40ee-489f-bd1c-739e009ebf0f" />

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/5dae7384-6971-4640-935e-723b73541140" />

<img width="1917" height="1078" alt="Screenshot 2026-07-09 001259" src="https://github.com/user-attachments/assets/c5cc45bc-b894-4b4e-8759-dbf2cbc7d88b" />

<img width="1917" height="1078" alt="Screenshot 2026-07-08 234059" src="https://github.com/user-attachments/assets/0051c7d7-3b25-4863-aba1-d63f24e282cc" />

<img width="1917" height="1078" alt="Screenshot 2026-07-08 234529" src="https://github.com/user-attachments/assets/b537b8d7-a7e4-48c0-9e0e-071a1a7f6b02" />







