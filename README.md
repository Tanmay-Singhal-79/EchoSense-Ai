# EchoSense AI — Multi-Modal Speech and Facial Emotion Analytics Engine

> **Academic Project — GLA University Mathura (B.Tech CSE AIML)**  
> **Team T-144**: Tanmay Singhal, Srijan Rai, Dilansh Gupta • **Mentor**: Pawan Sharma

---

## 1. System Overview

**EchoSense AI** is a next-generation multi-modal emotion and sentiment intelligence engine that unifies:
1. **Speech Emotion Recognition (SER)**: Analyzing acoustic pitch, tone velocity, and energy via CNN-LSTM networks.
2. **Facial Expression Emotion Recognition (FER)**: Analyzing facial action units and micro-expressions via Vision Transformers (ViT).
3. **Biometric Face Authentication**: 128-dimensional Euclidean feature vector verification using deep convolutional facial embedding networks.
4. **Attention-Based Feature Fusion**: Real-time fusion producing continuous valence/arousal scores and high-frustration alerts.

This repository implements the production-grade **Authentication and Biometrics Subsystem** with:
- Dark Navy & Neon Cyan Glassmorphism UI (Manrope & DM Sans typography)
- 2-Column desktop login experience with live audio waveform simulation
- On-device biometric face enrollment and Euclidean face login
- Google Cloud OAuth 2.0 integration with fallback dev mode
- Secure HTTP-only cookies, JWT session management, bcrypt hashing, and rate limiting

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Lucide React, Recharts, Canvas-Confetti |
| **Biometrics** | `@vladmandic/face-api` (128-d FaceNet & TinyFaceDetector) |
| **Backend** | Node.js (v18+), Express.js, Helmet, Cookie-Parser, CORS |
| **Database** | MongoDB with Mongoose (with high-resilience in-memory dev fallback) |
| **Security** | bcryptjs, jsonwebtoken, express-rate-limit, Google OAuth 2.0 |

---

## 3. Directory Structure

```
echosense-ai/
├── client/
│   ├── public/
│   │   ├── favicon.svg              # Futuristic EchoSense AI brand favicon
│   │   └── models/                  # Optional local biometric model weights
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioWaveform.jsx    # Real-time acoustic spectrum visualizer
│   │   │   ├── FaceCameraModal.jsx  # HUD camera reticle & 128-d face verification
│   │   │   ├── GoogleAuthButton.jsx # Google OAuth button + setup walkthrough
│   │   │   ├── Navbar.jsx           # Brand header with session navigation
│   │   │   └── Notification.jsx     # Glassmorphic alert toast notifications
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx          # Session state & authentication context
│   │   │   └── useFaceApi.js        # Neural net loader & facial descriptor extractor
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # 2-column futuristic login page
│   │   │   ├── RegisterPage.jsx     # Registration with immediate face enrollment
│   │   │   ├── PostLoginWelcome.jsx # Biometric management & profile hub
│   │   │   └── DashboardPreview.jsx # Multimodal emotion dashboard preview
│   │   ├── services/
│   │   │   └── api.js               # Fetch client with cookie credentials
│   │   ├── App.jsx                  # Main routing & application state
│   │   ├── main.jsx                 # React root mount
│   │   └── styles.css               # Futuristic dark glassmorphism stylesheet
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
├── server/
│   ├── config/
│   │   └── database.js              # Resilient MongoDB connector & fallback
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Google OAuth, Me, Logout
│   │   └── faceAuthController.js    # Biometric Enroll, Face Login, Delete Face
│   ├── middleware/
│   │   ├── requireAuth.js           # JWT verification middleware
│   │   └── rateLimiter.js           # Rate limiting against brute-force attacks
│   ├── models/
│   │   └── User.js                  # User schema with encrypted 128-d descriptor
│   ├── routes/
│   │   ├── auth.js                  # /api/auth routes
│   │   └── faceAuth.js              # /api/auth/face routes
│   ├── utils/
│   │   ├── faceMatcher.js           # Euclidean distance matcher (threshold <= 0.52)
│   │   └── token.js                 # JWT cookie generator
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── .env
└── README.md
```

---

## 4. Prerequisites

1. **Node.js**: Version 18.x, 20.x, or 25.x (tested on Node v25.9.0 and npm 11.12.1).
2. **MongoDB** (Optional for local dev):
   - You can connect to a local MongoDB instance (`mongodb://127.0.0.1:27017/echosense-ai`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
   - *Note*: If MongoDB is not running on your machine, EchoSense AI will automatically switch to its **Resilient In-Memory Dev Store**, allowing you to test registration, login, and face authentication immediately without errors!

---

## 5. Quick Start (Windows & VS Code)

### Step 1: Open the Project in VS Code
Open VS Code in the project root:
```powershell
cd "c:\Users\asus\Desktop\project first sem\echosense-ai"
code .
```

### Step 2: Install Backend Dependencies
Open a PowerShell terminal in VS Code:
```powershell
cd server
npm install
```

### Step 3: Install Frontend Dependencies
Open a second PowerShell terminal in VS Code:
```powershell
cd client
npm install
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env` in both directories:
```powershell
# In server directory:
cp .env.example .env

# In client directory:
cp .env.example .env
```

Default configuration values:
- **Server `.env`**:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/echosense-ai
  JWT_SECRET=echosense_ai_jwt_super_secret_key_2026_dev_mode_token
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:5173
  NODE_ENV=development
  GOOGLE_CLIENT_ID=
  ```
- **Client `.env`**:
  ```env
  VITE_API_URL=/api
  VITE_GOOGLE_CLIENT_ID=
  ```

---

## 6. Running the Application

### Option A: Running with Two Terminals

**Terminal 1 (Backend Server):**
```powershell
cd "c:\Users\asus\Desktop\project first sem\echosense-ai\server"
npm run dev
# or: npm start
```
*Backend runs at `http://localhost:5000`.*

**Terminal 2 (Frontend Client):**
```powershell
cd "c:\Users\asus\Desktop\project first sem\echosense-ai\client"
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

Open your browser and navigate to: **`http://localhost:5173`**

---

## 7. Biometric Face Authentication Flow

### Face Enrollment (First-Time User)
1. Navigate to **Create Account** (`RegisterPage`).
2. Enter your Name, Email, and Password. Keep "Enroll Face Biometrics" checked.
3. Upon clicking **Create Account**, the biometric consent dialog appears.
4. Allow browser camera access.
5. Align your face inside the futuristic cyan HUD reticle.
6. When alignment and liveness indicators turn green, click **Capture & Enroll Face**.
7. The browser extracts a 128-dimensional floating point vector and posts it to `/api/auth/face/enroll`. The backend stores the protected biometric template in MongoDB.

### Face Login (Returning User)
1. On the **Sign In** screen (`LoginPage`), click **Login with Face**.
2. Enter your account email.
3. Look into the camera. The system extracts the candidate 128-dimensional vector and submits it to `/api/auth/face/login`.
4. The backend computes the Euclidean distance:
   $$\text{Distance} = \sqrt{\sum_{i=1}^{128} (A_i - B_i)^2}$$
5. If $\text{Distance} \le 0.52$, identity is verified, an HTTP-only JWT cookie is issued, celebration confetti triggers, and you are redirected to the Welcome/Dashboard screen!

*(Hardware camera blocked or unavailable? Simply toggle the **"Use Biometric Test Simulator"** button in the modal to test the end-to-end vector matching pipeline!)*

---

## 8. Google OAuth 2.0 Setup Guide

To enable live Google Sign-In:
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `EchoSense AI`.
3. Configure the **OAuth Consent Screen** (User Type: External, App Name: EchoSense AI).
4. Navigate to **Credentials** -> **Create Credentials** -> **OAuth Client ID**.
5. Application Type: **Web application**.
6. Set **Authorized JavaScript origins** to `http://localhost:5173`.
7. Copy the generated Client ID and paste it into:
   - `server/.env` -> `GOOGLE_CLIENT_ID`
   - `client/.env` -> `VITE_GOOGLE_CLIENT_ID`

*If no Client ID is provided, clicking "Continue with Google" opens an interactive modal featuring full instructions and an instant 1-click test login.*

---

## 9. Troubleshooting & FAQ

| Issue | Resolution |
|---|---|
| **Port 5000 or 5173 already in use** | In PowerShell, run `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess \| Stop-Process` or adjust `PORT` in `server/.env`. |
| **Camera permission blocked in Chrome/Edge** | Click the lock or camera icon on the left of the browser URL bar, set Camera to "Allow", and refresh. |
| **Vite dependency warnings** | Run `npm run build` in `client/` to verify bundling. All packages (`recharts`, `@vladmandic/face-api`, `lucide-react`) are pinned to stable, compatible versions. |
| **MongoDB not running locally** | EchoSense AI automatically activates an in-memory dev repository. You don't need MongoDB installed locally to test the complete application. |
