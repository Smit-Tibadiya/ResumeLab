import React from 'react'
import ScoreGauge from './ScoreGauge'
import ScoreBadge from './ScoreBadge' // Import the new component

const Summary = ({feedback}: {feedback:Feedback}) => {
  return (
      <div className='bg-white rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden'>
          
          <div className="flex flex-col-reverse md:flex-row items-center p-6 gap-8 bg-slate-50 border-b border-slate-200">
              <ScoreGauge score={ feedback.overallScore } />

              <div className="flex flex-col gap-2">
                  <h2 className="text-xl! font-bold text-slate-800">Your Resume Score</h2>
                  <p className='text-sm text-slate-500 max-w-sm'>
                        This score reflects the overall quality of your resume based on our AI analysis against industry standards.
                  </p>
              </div>
          </div>

          {/* Render the new interactive badges */}
          <div className="flex flex-col">
            <ScoreBadge title="Tone & Style" score={ feedback.toneAndStyle.score } />
            <ScoreBadge title="Content" score={ feedback.content.score } />
            <ScoreBadge title="Structure" score={ feedback.structure.score } />
            <ScoreBadge title="Skills" score={ feedback.skills.score } />
          </div>
    </div>
  )
}

export default Summary;