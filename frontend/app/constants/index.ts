// 1. We keep your TypeScript interface for your React components to use
export interface Resume {
  id: string;
  companyName: string;
  jobTitle: string;
  imagePath: string;
  resumePath: string;
  feedback: any;
}

// 2. We use a literal JSON string for the AI template
export const AIResponseFormat = `{
  "overallScore": 0,
  "ATS": {
    "score": 0,
    "tips": [
      { "type": "good" | "improve", "tip": "Short title", "explanation": "Detailed explanation" }
    ]
  },
  "toneAndStyle": {
    "score": 0,
    "tips": [
      { "type": "good" | "improve", "tip": "Short title", "explanation": "Detailed explanation" }
    ]
  },
  "content": {
    "score": 0,
    "tips": [
      { "type": "good" | "improve", "tip": "Short title", "explanation": "Detailed explanation" }
    ]
  },
  "structure": {
    "score": 0,
    "tips": [
      { "type": "good" | "improve", "tip": "Short title", "explanation": "Detailed explanation" }
    ]
  },
  "skills": {
    "score": 0,
    "tips": [
      { "type": "good" | "improve", "tip": "Short title", "explanation": "Detailed explanation" }
    ]
  }
}`;

// 3. The Refined Prompt
export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  resumeText
}: {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
}) =>
  `You are an expert Applicant Tracking System (ATS) software and senior technical recruiter.
  Analyze the candidate's resume against the provided job title and description. 
  Be thorough, brutally honest, and detailed. Do not be afraid to give low scores for poor resumes.

  Job Title: ${jobTitle || "Not specified"}
  Job Description: ${jobDescription || "Provide a general review of the resume."}
  
  CRITICAL INSTRUCTIONS:
  1. You must respond ONLY with a valid, raw JSON object. 
  2. Do NOT wrap the JSON in markdown code blocks (e.g., no \`\`\`json).
  3. Provide 3-4 tips for every single category.
  4. Use the exact JSON structure below:

  ${AIResponseFormat}
  
  Candidate Resume Text:
  """
  ${resumeText}
  """`;