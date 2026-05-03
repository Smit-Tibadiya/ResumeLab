import {useState, type FormEvent} from "react";
import {useNavigate} from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import PulseScanner from "~/components/PulseScanner";
import { convertPdfToImage, extractTextFromPDF } from "~/lib/pdfHandle";
const API_URL = import.meta.env.VITE_API_URL;

const upload = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isRoastMode, setIsRoastMode] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Initializing Scanner...");

    try {
      setStatusText("Extracting UI Preview & Text...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file)
        throw new Error("Failed to convert resume to image.");
      const imageBase64 = await fileToBase64(imageFile.file);
      const resumeText = await extractTextFromPDF(file);

      setStatusText("Analyzing with AI Server...");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to analyze resumes.");

      const response = await fetch(
        `${API_URL}/api/resumes/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyName,
            jobTitle,
            jobDescription,
            resumeText,
            imageBase64,
            isRoastMode,
          }),
        }
      );

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const data = await response.json();

      setStatusText("Analysis Complete! Redirecting...");

      setTimeout(() => {
        navigate(`/resume/${data.id}`);
      }, 800);
    } catch (error) {
      console.error(error);
      setStatusText("An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({companyName, jobTitle, jobDescription, file});
  };

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  return (
    <main className="min-h-screen bg-slate-50 bg-[url(/images/bg-main.svg)] bg-cover bg-fixed font-sans pb-20 relative overflow-hidden">
      {/* --- IMPORTED NAVBAR --- */}
      <div className="px-6 md:px-12">
        <Navbar />
      </div>

      {/* --- DECORATIVE BACKGROUND BLOBS (Teal Theme) --- */}
      <div className="absolute top-40 -left-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <section className="max-w-2xl mx-auto px-6 pt-12 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] shadow-2xl p-8 md:p-12 w-full">
          {isProcessing ? (
            /* --- CINEMATIC PROCESSING STATE --- */
            <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-700">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#0f766e] blur-xl opacity-20 animate-pulse rounded-full"></div>
                <PulseScanner />
              </div>
              <h2 className="text-3xl font-extrabold text-[#334155] tracking-tight text-center mb-3">
                {statusText}
              </h2>
              <p className="text-slate-500 text-center max-w-sm font-medium">
                Our AI model is cross-referencing your experience against
                industry standards and the job description...
              </p>
            </div>
          ) : (
            /* --- FULL-WIDTH UPLOAD FORM --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
              <div className="mb-10 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#334155] tracking-tight mb-3">
                  Analyze Your Resume
                </h2>
                <p className="text-slate-500 text-lg font-medium">
                  Target a specific role to get highly tailored feedback.
                </p>
              </div>

              <form
                id="upload-form"
                onSubmit={handleSubmit}
                className="flex flex-col w-full gap-7"
              >
                {/* 100% Width Input */}
                <div className="w-full flex flex-col gap-2">
                  <label
                    htmlFor="company-name"
                    className="text-xs font-extrabold text-[#0f766e] uppercase tracking-wider ml-1"
                  >
                    Company Name{" "}
                    <span className="text-slate-400 font-medium normal-case tracking-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="company-name"
                    id="company-name"
                    placeholder="e.g. Google, Stripe"
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-[#0f766e] outline-none transition-all text-lg font-medium text-slate-800 placeholder:text-slate-300 shadow-sm"
                  />
                </div>

                {/* 100% Width Input */}
                <div className="w-full flex flex-col gap-2">
                  <label
                    htmlFor="job-title"
                    className="text-xs font-extrabold text-[#0f766e] uppercase tracking-wider ml-1"
                  >
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="job-title"
                    id="job-title"
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-[#0f766e] outline-none transition-all text-lg font-medium text-slate-800 placeholder:text-slate-300 shadow-sm"
                  />
                </div>

                {/* 100% Width Textarea */}
                <div className="w-full flex flex-col gap-2">
                  <label
                    htmlFor="job-description"
                    className="text-xs font-extrabold text-[#0f766e] uppercase tracking-wider ml-1"
                  >
                    Job Description{" "}
                    <span className="text-slate-400 font-medium normal-case tracking-normal">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    name="job-description"
                    id="job-description"
                    placeholder="Paste the requirements or description here for hyper-targeted ATS feedback..."
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-[#0f766e] outline-none transition-all text-lg font-medium text-slate-800 placeholder:text-slate-300 shadow-sm resize-y"
                  />
                </div>

                {/* 100% Width Uploader */}
                <div className="w-full flex flex-col gap-2 mt-2">
                  <label
                    htmlFor="uploader"
                    className="text-xs font-extrabold text-[#0f766e] uppercase tracking-wider ml-1"
                  >
                    Your Document
                  </label>
                  <div
                    className={`w-full transition-all duration-300 rounded-2xl border-2 border-dashed ${file ? "border-[#0f766e] bg-teal-50/50" : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-400"} p-2`}
                  >
                    <FileUploader onFileSelect={handleFileSelect} />
                  </div>
                </div>

                {/* --- THE ROAST MODE TOGGLE --- */}
                <div
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-colors duration-300 ${isRoastMode ? "border-orange-200 bg-orange-50/50" : "border-slate-100 bg-white"}`}
                >
                  <div className="flex flex-col pr-4">
                    <label
                      htmlFor="roast-toggle"
                      className={`text-sm font-extrabold uppercase tracking-wider cursor-pointer ${isRoastMode ? "text-orange-600" : "text-slate-700"}`}
                    >
                      🔥 Roast Mode
                    </label>
                    <span className="text-xs text-slate-500 font-medium mt-1">
                      Turn this on to let a ruthless Silicon Valley recruiter
                      brutally tear your resume apart.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      id="roast-toggle"
                      className="sr-only peer"
                      checked={isRoastMode}
                      onChange={(e) => setIsRoastMode(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!file}
                  className={`mt-4 w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2
                    ${
                      file
                        ? "bg-[#0f766e] hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20 hover:shadow-xl hover:-translate-y-1"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                >
                  {file ? (
                    <>
                      Run AI Analysis
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                    </>
                  ) : (
                    "Upload a PDF to Continue"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default upload;
