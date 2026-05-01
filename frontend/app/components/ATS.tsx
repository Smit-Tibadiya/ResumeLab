import React from 'react';

interface ATSSuggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: ATSSuggestion[];
}

const ATS = ({ score, suggestions }: ATSProps) => {
  // Dynamically generate the theme based on the score
  const getTheme = () => {
    if (score >= 70) {
      return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '/icons/ats-good.svg' };
    }
    if (score >= 50) {
      return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '/icons/ats-warning.svg' };
    }
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '/icons/ats-bad.svg' };
  };

  const theme = getTheme();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 w-full flex flex-col gap-5 md:gap-6">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Title & Icon */}
        <div className="flex items-center gap-4">
          <div className={`p-1 sm:p-3 rounded-xl border ${theme.bg} ${theme.border}`}>
            <img
              src={theme.icon}
              alt="ATS Status"
              className="w-full h-fit sm:w-8 sm:h-8"
            />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold text-slate-800">ATS Scannability</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              How easily parsing software can read your data.
            </p>
          </div>
        </div>

        {/* Score Badge */}
        <div className={`px-4 py-2 rounded-xl border flex self-center items-baseline gap-1 ${theme.bg} ${theme.border} ${theme.text}`}>
          <span className="text-2xl font-extrabold tracking-tight">{score}</span>
          <span className="text-sm font-semibold opacity-70">/100</span>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="w-full h-px bg-slate-100"></div>

      {/* Actionable Suggestions */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {suggestions.map((suggestion, index) => (
          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors" key={index}>
            <div className="mt-0.5 shrink-0">
              <img
                src={
                  suggestion.type === "good"
                    ? "/icons/check.svg"
                    : "/icons/warning.svg"
                }
                alt={suggestion.type}
                className="w-5 h-5"
              />
            </div>
            <p className="text-sm sm:text-md text-slate-600 leading-relaxed">
              {suggestion.tip}
            </p>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ATS;