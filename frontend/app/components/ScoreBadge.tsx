import React from 'react';

interface ScoreBadgeProps {
  title: string;
  score: number;
}

const ScoreBadge = ({ title, score }: ScoreBadgeProps) => {
  // Determine the styling and text based on the score thresholds
  let statusText = '';
  let badgeColors = '';

  if (score >= 80) {
    statusText = 'Excellent';
    badgeColors = 'bg-green-100 text-green-700 border-green-200';
  } else if (score >= 60) {
    statusText = 'Good';
    badgeColors = 'bg-amber-100 text-amber-700 border-amber-200';
  } else {
    statusText = 'Needs Work';
    badgeColors = 'bg-red-100 text-red-700 border-red-200';
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors"> 
      <div className="flex items-center gap-2">
        <p className="text-md font-semibold text-slate-700">{title}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* The Dynamic Status Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeColors}`}>
          {statusText}
        </span>
        
        {/* The Numerical Score */}
        <p className={`text-md md:text-md font-bold min-w-12 text-right ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
          {score}<span className="text-slate-400 font-normal">/100</span>
        </p>
      </div>
    </div>
  );
};

export default ScoreBadge;