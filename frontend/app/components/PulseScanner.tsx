const PulseScanner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <style>
        {`
          @keyframes scan-line {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .animate-scanner {
            animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          @keyframes float-doc {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-floating {
            animation: float-doc 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* The Floating Document */}
      <div className="relative w-28 h-36 bg-white rounded-xl shadow-[0_8px_30px_rgba(59,130,246,0.15)] border border-blue-50 flex flex-col items-center pt-6 px-4 overflow-hidden animate-floating">
        
        {/* Abstract Resume Lines */}
        <div className="w-full space-y-3">
          <div className="w-3/4 h-2.5 bg-blue-100 rounded-full"></div>
          <div className="w-full h-2 bg-gray-100 rounded-full"></div>
          <div className="w-5/6 h-2 bg-gray-100 rounded-full"></div>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-4"></div>
          <div className="w-4/5 h-2 bg-gray-100 rounded-full"></div>
        </div>

        {/* The Blue Scanner Line */}
        <div className="absolute left-0 w-full z-10 animate-scanner">
          {/* Solid blue laser */}
          <div className="w-full h-0.5 bg-[#0d9488] shadow-[0_0_12px_rgba(59,130,246,0.9)]"></div>
          {/* Soft blue gradient trail trailing above it */}
          <div className="w-full h-10 bg-linear-to-t from-blue-500/20 to-transparent -translate-y-full"></div>
        </div>
      </div>

      {/* Loading Text & Bouncing Dots */}
      <div className="mt-8 flex flex-col items-center">
        <div className="flex gap-1.5 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#0d9488] animate-bounce" style={{ animationDelay: '600ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PulseScanner;