# ResumeLab 📄✨

An AI-powered resume analysis tool that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). ResumeLab compares your resume against a specific job description to provide a detailed match score, actionable feedback, and a breakdown of missing keywords.

**🚀 Live Demo:** [https://resume-lab-theta.vercel.app](https://resume-lab-theta.vercel.app)

## 🌟 Features

- **Intelligent ATS Scoring:** Analyzes your resume against a target job description to calculate a percentage match.
- **Granular AI Feedback:** Provides detailed, actionable tips across four categories: Tone & Style, Content Impact, Formatting & Structure, and Skills Alignment.
- **🔥 Roast Mode:** Toggle on this feature to change the AI's persona into a ruthless, sarcastic FAANG recruiter for brutally honest (and hilarious) feedback.
- **Secure Dashboard:** JWT-based authentication allows users to save, manage, and delete their past resume analyses in a secure MongoDB database.
- **Secure Dashboard:** Uses `pdfjs-dist` to extract text and generate UI previews entirely in the browser, ensuring faster processing, enhanced privacy, and significantly reduced AI token usage.
- **Modern UI/UX:** Built with Tailwind CSS, featuring smooth accordions, dynamic score badges, and a clean, responsive layout.

## 🛠️ Tech Stack

**Frontend:**

- React (via Vite)
- React Router v7
- Tailwind CSS
- PDF.js (Mozilla - `pdfjs-dist`)

**Backend & Database:**

- `Node.js & Express.js`
- `MongoDB (via Mongoose)`
- `JSON Web Tokens (JWT) for Authentication`
- `CORS & Dotenv`

**AI & Processing:**

- Groq Cloud API
- Llama-3 70B (For lightning-fast, highly accurate JSON generation)

## 🚀 Getting Started (Local Development)

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine, A [MongoDB](https://www.mongodb.com/) URI, and a free [Groq API Key](https://console.groq.com/)

### Installation

### 1. Clone the repository:

```bash
git clone [https://github.com/Smit-Tibadiya/ResumeLab.git](https://github.com/Smit-Tibadiya/ResumeLab.git)
cd resumelab
```

### 2. Setup the Backend:

Open terminal and navigate to the backend directory:

```Bash
cd backend
npm install
```

Create a .env file inside the backend folder:

```Bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:

```Bash
npm start
```

### 3. Setup the Frontend

Open a new terminal and navigate to the frontend directory:

```Bash
cd frontend
npm install
```

Create a .env file inside the frontend folder:

```Bash
VITE_API_URL=http://127.0.0.1:5000
```

Start the React development server:

```Bash
npm run dev
```

Open your browser and navigate to http://localhost:5173.

## 🏗️ Architecture Highlights

**The "Smart Extract" Pipeline**

Instead of relying on expensive multimodal AI models to "read" an image of a resume, ResumeLab uses a highly optimized, cost-effective pipeline:

1. **Upload:** User uploads a PDF resume and pastes a Job Description.

2. **Local Render:** The app uses a Web Worker to locally render the PDF to a high-quality HTML5 canvas and converts it to a PNG for the visual UI preview.

3. **Local Extraction:** Simultaneously, the app extracts the raw text layer directly from the PDF.

4. **AI Analysis:** Only the raw text and job description are sent to the Node.js backend. The server injects this into a strict system prompt and queries the Groq Llama 70B model, resulting in lightning-fast, highly accurate responses returned as a clean JSON object.

## 🌍 Deployment

This project is configured to be deployed across two distinct platforms:

### 1. Backend (Render):

Deploy the backend folder as a Web Service on Render.com. Ensure you add your .env variables to the Render dashboard.

### 2. Frontend (Vercel):

Deploy the frontend folder to Vercel. Add VITE_API_URL to your Vercel Environment Variables, pointing it to your live Render URL.
