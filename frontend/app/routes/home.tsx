import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router"; // or react-router-dom
import Navbar from "~/components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // 1. Check Authentication & Get User Details
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }

    if (userString) {
      const user = JSON.parse(userString);
      setUserName(user.name.split(" ")[0]); // Get first name
    }

    // 2. Fetch Dashboard Data from MongoDB
    const fetchDashboardResumes = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/resumes", {
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
          // Token expired or invalid
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to load dashboard resumes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardResumes();
  }, [navigate]);

  // 3. The Secure Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Helper function to color code the score pill
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-rose-100 text-rose-700 border-rose-200";
  };

  return (
    <main className="min-h-screen bg-slate-50 bg-[url(/images/bg-main.svg)] bg-cover bg-fixed font-sans pb-20">
      
      {/* --- TOP NAVIGATION --- */}
      <Navbar/>

      <div className="max-w-7xl mx-auto px-8 pt-12">
        {/* --- HEADER & CALL TO ACTION --- */}
        <div className="flex flex-col bg-slate-100 p-4 rounded-2xl md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Your Dashboard</h2>
            <p className="text-slate-500 text-lg">Manage and analyze your recent applications.</p>
          </div>
          
          <Link 
            to="/upload" 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-800 text-white px-6 py-3.5 not-md:text-sm rounded-2xl font-semibold shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Analyze New Resume
          </Link>
        </div>

        {/* --- RESUME GRID --- */}
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="w-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 text-center shadow-xl flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No resumes analyzed yet</h3>
            <p className="text-slate-500 mb-8 max-w-md">Upload your first resume and job description to get instant, AI-powered feedback.</p>
            <Link to="/upload" className="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-800 transition-colors">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resumes.map((resume) => {
              const score = resume.feedback?.overallScore || 0;
              const date = new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <Link 
                  to={`/resume/${resume._id}`} 
                  key={resume._id}
                  className="group relative bg-white/70 backdrop-blur-lg border border-white/60 shadow-lg hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                >
                  {/* Card Image Preview (Top Half) */}
                  <div className="w-full h-48 bg-slate-100 border-b border-slate-100 overflow-hidden relative">
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
                    
                    {/* Score Badge Overlay */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 font-bold text-sm ${getScoreColor(score)} backdrop-blur-md bg-opacity-90`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
                        {score} / 100
                      </div>
                    </div>
                  </div>

                  {/* Card Content (Bottom Half) */}
                  <div className="p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-white/50">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {resume.jobTitle || "General Analysis"}
                      </h3>
                      <p className="text-slate-500 font-medium text-sm mb-4 line-clamp-1">
                        {resume.companyName || "No Company Specified"}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {date}
                      </span>
                      <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        View Report <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}