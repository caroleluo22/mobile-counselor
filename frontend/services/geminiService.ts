import { GoogleGenAI, Type } from "@google/genai";
import { StudentProfile, ChatMessage, College, Scholarship, ReadinessAssessment } from "../types";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// --- General Chat ---
export const getGeminiChatResponse = async (
  history: ChatMessage[],
  currentMessage: string,
  profile: StudentProfile,
  context: string = ''
): Promise<string> => {
  try {
    const profileContext = `
      STUDENT PROFILE:
      Name: ${profile.name} (Grade ${profile.gradeLevel})
      GPA: ${profile.gpa}, SAT: ${profile.testScores.sat || 'N/A'}
      Interests: ${profile.interests.join(', ')}
      Target Major: ${profile.intendedMajors.join(', ')}
      Extracurriculars: ${profile.extracurriculars.join('; ')}
      Awards: ${profile.awards.join('; ')}
    `;

    const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n${profileContext}\nAdditional Context: ${context}`;

    const contents = [
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: currentMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }] // Enable grounding for latest admission stats/dates
      }
    });

    return response.text || "I apologize, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the consultant brain. Please try again.";
  }
};

// --- Specialized: Profile Analysis ---
export const analyzeProfile = async (profile: StudentProfile): Promise<string> => {
    const prompt = `Perform a deep SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) of this student's profile for admission to top 20 US universities. Suggest 3 potential "Spikes" or themes for their application.`;
    
    const profileStr = JSON.stringify(profile);
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `${prompt}\n\nProfile Data: ${profileStr}`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_BASE
            }
        });
        return response.text || "Analysis failed.";
    } catch (e) { return "Error analyzing profile."; }
};

// --- Specialized: Readiness Assessment ---
export const assessReadiness = async (profile: StudentProfile): Promise<ReadinessAssessment | null> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Assess this student's readiness for their Dream Colleges: ${profile.dreamColleges.join(', ')}. Profile: ${JSON.stringify(profile)}. Provide quantitative scores (0-100) and actionable lists.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.INTEGER },
                        academicScore: { type: Type.INTEGER },
                        extracurricularScore: { type: Type.INTEGER },
                        fitScore: { type: Type.INTEGER },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
                systemInstruction: SYSTEM_INSTRUCTION_BASE
            }
        });
        return JSON.parse(response.text || "null");
    } catch (e) {
        console.error("Readiness Assessment Error", e);
        return null;
    }
};

// --- Specialized: College Comparison ---
export const compareColleges = async (collegeA: string, collegeB: string, profile: StudentProfile): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Compare ${collegeA} and ${collegeB} specifically for a student interested in ${profile.intendedMajors[0]}. Cover: 1) Academic Reputation, 2) Campus Culture, 3) Career Outcomes, 4) Admission Difficulty relative to this student.`,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: SYSTEM_INSTRUCTION_BASE
            }
        });
        return response.text || "Comparison failed.";
    } catch (e) { return "Error comparing colleges."; }
};

// --- Specialized: Roadmap Generation (JSON) ---
export const generateRoadmap = async (profile: StudentProfile): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Generate a 5-step strategic admission roadmap for a Grade ${profile.gradeLevel} student.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        milestones: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    timeline: { type: Type.STRING },
                                    category: { type: Type.STRING, enum: ['academic', 'essay', 'testing', 'application'] }
                                }
                            }
                        }
                    }
                },
                systemInstruction: `You are a strategic planner. Create a roadmap for: ${JSON.stringify(profile)}`
            }
        });
        return JSON.parse(response.text || "{ \"milestones\": [] }");
    } catch (e) {
        console.error(e);
        return { milestones: [] };
    }
};

// --- Specialized: Scholarship Matcher (JSON) ---
export const findScholarships = async (profile: StudentProfile): Promise<Scholarship[]> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Find 5 specific scholarships that would fit this student's profile. Consider their major (${profile.intendedMajors}), extracurriculars (${profile.extracurriculars}), and demographics if implied.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            amount: { type: Type.STRING },
                            deadline: { type: Type.STRING },
                            requirements: { type: Type.STRING },
                            matchScore: { type: Type.INTEGER },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                },
                systemInstruction: `You are a financial aid expert. Analyze the profile: ${JSON.stringify(profile)}. Generate HIGHLY RELEVANT scholarships.`
            }
        });
        const scholarships = JSON.parse(response.text || "[]");
        // Ensure IDs are unique-ish if model repeats simple numbers
        return scholarships.map((s: any, i: number) => ({ ...s, id: `ai-${Date.now()}-${i}` }));
    } catch (e) {
        console.error(e);
        return [];
    }
};

// --- Specialized: Essay Feedback ---
export const critiqueEssay = async (prompt: string, content: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Prompt: ${prompt}\n\nEssay: ${content}\n\nProvide a critique. 1) What works? 2) What is weak? 3) Specific actionable changes.`,
            config: {
                systemInstruction: "You are an Ivy League essay editor. Be critical but constructive. Focus on 'Show Don't Tell'."
            }
        });
        return response.text || "Critique failed.";
    } catch (e) { return "Error critiquing essay."; }
};

// --- Specialized: Find Essay Prompts ---
export const findEssayPrompts = async (college: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `List the current essay prompts for ${college} undergraduate admission (Common App or Supplemental). Return a simple list of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                systemInstruction: "You are an admissions expert. Provide exact essay prompts for the requested college."
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return ["Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time.", "The lessons we take from obstacles we encounter can be fundamental to later success.", "Share an essay on any topic of your choice."];
    }
};


// --- Specialized: Interview Prep ---
export const getInterviewQuestion = async (history: ChatMessage[], profile: StudentProfile): Promise<string> => {
    try {
         const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
            config: {
                systemInstruction: `You are a tough but fair alumni interviewer for ${profile.dreamColleges[0] || 'Top University'}. 
                The user has just answered your previous question (or the interview is starting).
                1. Briefly acknowledge their answer (if any).
                2. Ask the NEXT question.
                Keep it professional and conversational.`
            }
        });
        return response.text || "Tell me about yourself.";
    } catch (e) { return "Let's move to the next question."; }
}

// --- Specialized: Forum Reply ---
export const replyToForumPost = async (title: string, content: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `User Post Title: ${title}\nUser Post Content: ${content}\n\nProvide a helpful, encouraging, and expert response as an AI College Counselor to this forum post. Keep it brief (under 50 words).`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_BASE
            }
        });
        return response.text || "That is a great question! I'd recommend checking the college website for specific requirements.";
    } catch (e) { return "Interesting topic!"; }
};