# ResumeLab 📄✨

An AI-powered resume analysis tool that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). ResumeLab compares your resume against a specific job description to provide a detailed match score, actionable feedback, and a breakdown of missing keywords.

**🚀 Live Demo:** [https://resumelab.puter.site/](https://resumelab.puter.site/)

## 🌟 Features

* **Intelligent ATS Scoring:** Analyzes your resume against a target job description to calculate a percentage match.
* **Granular AI Feedback:** Provides detailed, actionable tips across four categories: Tone & Style, Content Impact, Formatting & Structure, and Skills Alignment.
* **Local PDF Processing:** Uses `pdfjs-dist` to extract text and generate UI previews entirely in the browser, ensuring faster processing, enhanced privacy, and significantly reduced AI token usage.
* **Bulletproof JSON Parsing:** Features a robust AI response sanitizer with safe fallback data to ensure the UI never crashes, even if the underlying LLM hallucinates or misformats the JSON.
* **Modern UI/UX:** Built with Tailwind CSS, featuring smooth accordions, dynamic score badges, and a clean, responsive layout.
* **Serverless Backend:** Completely powered by Puter.js for authentication, cloud file storage, key-value databases, and LLM access.

## 🛠️ Tech Stack

**Frontend:**
* React (via Vite)
* React Router v7
* Tailwind CSS
* Zustand (State Management)
* PDF.js (Mozilla - `pdfjs-dist`)

**Backend & AI (Puter.js SDK):**
* `puter.auth` - User Authentication
* `puter.fs` - Cloud PDF and Image Storage
* `puter.kv` - Key-Value Store for caching Analysis Results
* `puter.ai.chat` - LLM Integration (Configured for Anthropic's Claude 3 / Google Gemma)

## 🚀 Getting Started (Local Development)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need a free [Puter](https://puter.com/) account to utilize the cloud and AI features.

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/resumelab.git](https://github.com/yourusername/resumelab.git)
   cd resumelab
Install the dependencies:

```Bash
npm install
```
Start the development server:

```Bash
npm run dev
```
Open your browser and navigate to http://localhost:5173.

**Note:** Because this app uses Puter.js, you do not need to configure any complex .env files with API keys! Puter automatically handles authentication and API access securely through the browser.

## 🏗️ Architecture Highlights

**The "Smart Extract" Pipeline**

Instead of relying on expensive multimodal AI models to "read" an image of a resume, ResumeLab uses a highly optimized, cost-effective pipeline:

1. **Upload:** User uploads a PDF resume and pastes a Job Description.

2. **Local Render:** The app uses a Web Worker to locally render the PDF to a high-quality HTML5 canvas and converts it to a PNG for the visual UI preview.

3. **Local Extraction:** Simultaneously, the app extracts the raw text layer directly from the PDF.

4. **AI Analysis:** Only the raw text and job description are sent to the AI model with strict JSON formatting instructions, resulting in lightning-fast, highly accurate responses at a fraction of the token cost.

## 🌍 Deployment
This project is hosted on Puter's edge network. To deploy your own version:

1. Build the production application:

```Bash
npm run build
```
2. Navigate to your generated build/client folder.

3. Drag and drop the client folder into your Puter Dri ve.

4. Right-click the folder and select Host as Website.

5. Choose your subdomain (e.g., resumelab) and deploy!