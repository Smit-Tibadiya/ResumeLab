import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserName(user.name.split(" ")[0]);
      } catch (error) {
        console.error("Error parsing user data");
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserName(null);
    navigate("/login");
  };

  return (
    // Responsive outer container: smaller margins and rounded corners on mobile
    <nav className="mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-sm sticky top-2 sm:top-4 z-50">
      
      {/* Responsive inner padding: tighter on mobile, spacious on desktop */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0">
          {/* Text scales down to text-xl on mobile to save space */}
          <p className="text-xl md:text-2xl font-extrabold text-[#334155] tracking-tight">
            Resume<span className="text-[#0f766e]">Lab</span>
          </p>
        </Link>

        {/* --- NAV ACTIONS --- */}
        {/* Gap shrinks on mobile to keep buttons together */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {userName ? (
            <>
              {/* Greeting: Hidden on phones and tablets, only shows on laptops (lg) */}
              <span className="hidden lg:inline-block text-sm font-medium text-slate-500 whitespace-nowrap">
                Hello, <span className="text-slate-800 font-bold">{userName}</span>
              </span>
              
              {/* Dashboard Link: Hidden on phones (sm), because the logo already goes home */}
              {location.pathname !== "/" && (
                <Link 
                  to="/" 
                  className="hidden sm:block text-sm font-bold text-slate-600 hover:text-[#0f766e] transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
              )}

              {/* Upload Button: Always visible, but text changes based on screen size */}
              {(location.pathname !== "/upload" && location.pathname !== "/" ) && (
                <Link 
                  to="/upload" 
                  // Scales paddings and text sizes
                  className="text-xs sm:text-sm font-bold bg-[#0f766e] hover:bg-teal-800 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  Upload <span className="hidden sm:inline">Resume</span>
                </Link>
              )}

              {/* Logout Button: Always visible, scales down beautifully */}
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-200 hover:border-rose-200 whitespace-nowrap shrink-0"
              >
                Logout
              </button>
            </>
          ) : (
            /* Logged Out State: Scales down */
            <Link 
              to="/login" 
              className="text-xs sm:text-sm font-bold text-white bg-[#334155] hover:bg-slate-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;