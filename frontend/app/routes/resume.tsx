import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router"; 
import Navbar from "~/components/Navbar";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
const API_URL = import.meta.env.VITE_API_URL;

export const meta = () => [
  { title: "ResumeLab | Analysis Report" },
  { name: "description", content: "Detailed analysis of your resume" },
];

const resume = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<any | null>(null);

  useEffect(() => {
    const fetchSingleResume = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.warn("No resume data found in database.");
          return;
        }

        const resumeData = await response.json();

        if (resumeData.imagePath) {
          setImageUrl(resumeData.imagePath);
          setResumeUrl(resumeData.imagePath); 
        }

        if (resumeData.feedback) {
          setFeedback(resumeData.feedback);
        }

      } catch (error) {
        console.error("Failed to fetch resume data from server:", error);
      }
    };

    if (id) fetchSingleResume();
  }, [id, navigate]);

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">
      
      {/* --- SOLID NAVBAR --- */}
      <div className="w-full border-b border-slate-200 bg-white sticky top-0 z-50">
        <Navbar />
      </div>

      {/* --- HIGH-CONTRAST SPLIT SCREEN LAYOUT --- */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row w-full max-w-[1600px] mx-auto">
        
        {/* LEFT COLUMN: Document Viewer (No Scrollbars, Centers Perfectly) */}
        <section className="w-full lg:w-5/12 xl:w-1/3 lg:sticky lg:top-[76px] lg:h-[calc(100vh-76px)] bg-slate-50 border-r border-slate-200 p-6 md:p-8 flex flex-col overflow-hidden">
          
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Original Document</h3>
          </div>

          <div className="flex-1 flex items-center justify-center w-full h-full pb-4">
            {imageUrl && resumeUrl ? (
              <div className="relative w-full max-w-[400px] aspect-[8.5/11] bg-white rounded-lg shadow-md border border-slate-300 group transition-all hover:shadow-xl hover:-translate-y-1 duration-300 overflow-hidden">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full h-full cursor-zoom-in"
                >
                  <img
                    src={imageUrl}
                    alt="resume"
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Restored Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                    <span className="bg-white text-slate-800 px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <svg className="w-5 h-5 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      Open PDF
                    </span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 bg-white w-full max-w-[400px] aspect-[8.5/11] rounded-lg border-2 border-dashed border-slate-300">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0f766e] rounded-full animate-spin"></div>
                <p className="text-slate-600 font-semibold tracking-wide">
                  Loading preview...
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: AI Feedback Area (Pure White Background, Hidden Scrollbar trick) */}
        <section className="w-full lg:w-7/12 xl:w-2/3 p-6 md:p-10 lg:p-16 bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Analysis Report
            </h2>
            <p className="text-slate-600 font-medium text-lg max-w-2xl">
              Review your scores and implement the targeted feedback below to improve your ATS compatibility.
            </p>
          </div>

          {feedback ? (
            <div className="flex flex-col gap-10">
              
              {/* Solid White Cards with crisp borders */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
                <Summary feedback={feedback} />
              </div>

              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
                <ATS
                  score={feedback.ATS?.score || 0}
                  suggestions={feedback.ATS?.tips || []}
                />
              </div>

              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
                <Details feedback={feedback} />
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
               <div className="w-16 h-16 border-4 border-slate-100 border-t-[#0f766e] rounded-full animate-spin mb-6"></div>
               <h3 className="text-2xl font-bold text-slate-800">Compiling Report...</h3>
               <p className="text-slate-500 mt-2">Structuring your AI insights.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default resume;