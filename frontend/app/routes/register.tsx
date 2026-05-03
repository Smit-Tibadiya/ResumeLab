import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
const API_URL = import.meta.env.VITE_API_URL;

const register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      // Success! Send them to the login page
      navigate("/login");

    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 bg-[url(/images/bg-main.svg)] bg-cover bg-bottom p-4 font-sans">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Join ResumeLab</h1>
            <p className="text-slate-500 mt-2 text-sm">Create an account to start analyzing resumes</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-600 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default register;