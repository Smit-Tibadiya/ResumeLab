import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router"; 
import Navbar from "~/components/Navbar";
const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardResumes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/resumes`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const dbResumes = await response.json();
          setResumes(dbResumes);
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } catch (error) {
        console.error("Failed to load dashboard resumes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardResumes();
  }, [navigate]);

  // --- THE DELETE FUNCTION ---
  const handleDelete = async (id: string) => {
    // 1. Ask for confirmation
    if (!window.confirm("Are you sure you want to delete this resume analysis? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // 2. Send the delete request to the backend
      const response = await fetch(`${API_URL}/api/resumes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 3. Instantly remove it from the UI without refreshing the page!
        setResumes(prevResumes => prevResumes.filter(resume => resume._id !== id));
      } else {
        alert("Failed to delete the resume.");
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert("An error occurred while communicating with the server.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-rose-100 text-rose-700 border-rose-200";
  };

  return (
    <main className="min-h-screen bg-slate-50 bg-[url(/images/bg-main.svg)] bg-cover bg-fixed font-sans pb-20">
      
      {/* Drop in our new Universal Navbar */}
      <div className="w-full sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-12">
        {/* --- HEADER & CALL TO ACTION --- */}
        <div className="flex flex-col bg-slate-50 px-6 py-4 rounded-3xl md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Your Dashboard</h2>
            <p className="text-slate-500 text-lg">Manage and analyze your recent applications.</p>
          </div>
          
          <Link 
            to="/upload" 
            className="flex items-center gap-2 bg-[#0f766e] hover:bg-teal-800 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-teal-700/20 hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Analyze New Resume
          </Link>
        </div>

        {/* --- RESUME GRID --- */}
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-teal-100 border-t-[#0f766e] rounded-full animate-spin"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="w-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 text-center shadow-xl flex flex-col items-center">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No resumes analyzed yet</h3>
            <p className="text-slate-500 mb-8 max-w-md">Upload your first resume and job description to get instant, AI-powered feedback.</p>
            <Link to="/upload" className="bg-[#334155] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {resumes.map((resume) => {
              const score = resume.feedback?.overallScore || 0;
              const date = new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                // Changed from <Link> to <div> to allow safe nested buttons
                <div 
                  key={resume._id}
                  className="group relative bg-white/70 backdrop-blur-lg border border-white/60 shadow-md hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                >
                  {/* Top Half: Image wrapped in Link */}
                  <Link to={`/resume/${resume._id}`} className="w-full h-48 bg-slate-100 border-b border-slate-100 overflow-hidden relative block">
                    {resume.imagePath ? (
                      <>
                        <img 
                          src={resume.imagePath} 
                          alt="Resume Preview" 
                          className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 font-bold text-sm ${getScoreColor(score)} backdrop-blur-md bg-opacity-90`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
                        {score} / 100
                      </div>
                    </div>
                  </Link>

                  {/* Bottom Half */}
                  <div className="p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-white/50">
                    <Link to={`/resume/${resume._id}`} className="block">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-[#0f766e] transition-colors">
                        {resume.jobTitle || "General Analysis"}
                      </h3>
                      <p className="text-slate-500 font-medium text-sm mb-4 line-clamp-1">
                        {resume.companyName || "No Company Specified"}
                      </p>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {date}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        {/* THE DELETE BUTTON */}
                        <button 
                          onClick={() => handleDelete(resume._id)}
                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-all"
                          title="Delete Resume"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>

                        <Link to={`/resume/${resume._id}`} className="text-[#0f766e] text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                          Report <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}