import { Link } from "react-router"; // or react-router-dom depending on your setup

export default function ResumeCard({ resume }: { resume: any }) {
  return (
    <Link to={`/resume/${resume.id}`} className="border p-4 rounded shadow hover:shadow-lg transition">
      {/* Since imagePath is now a Base64 string, the browser renders it natively! */}
      <img 
        src={resume.imagePath} 
        alt={`${resume.jobTitle} preview`} 
        className="w-full h-48 object-cover mb-4 border"
      />
      <h3 className="font-bold text-lg">{resume.jobTitle}</h3>
      <p className="text-gray-600">{resume.companyName}</p>
      <div className="mt-2 text-sm">
        <span className="font-semibold text-blue-600">
          Score: {resume.feedback?.overallScore || "N/A"}/100
        </span>
      </div>
    </Link>
  );
}