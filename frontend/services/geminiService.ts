import { StudentProfile, SampleProfile, ChatMessage, ReadinessAssessment, College, Scholarship, TrainingResource } from '../types';
import { MOCK_SAMPLE_PROFILES, MOCK_TRAINING, MOCK_COLLEGES, MOCK_SCHOLARSHIPS } from '../constants';

// This is a placeholder for your actual Gemini API call logic.
// You would replace the mock implementation with a real API call.
const callGeminiAPI = async (prompt: string): Promise<any> => {
    // This function is for simple, single-turn prompts.
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies for session authentication
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }

    return response.json();
};

// A new function for handling more complex, conversational calls with history.
const callGeminiChatAPI = async (payload: { prompt: string, history?: any[], systemInstruction?: string }): Promise<any> => {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies for session authentication
        body: JSON.stringify(payload) // Send the entire structured payload
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }

    return response.json();
};



/**
 * Finds success stories based on a search term and user profile.
 */
export const findSuccessStories = async (searchTerm: string, profile: StudentProfile): Promise<SampleProfile[]> => {
    const prompt = `
        Based on the user profile of a grade ${profile.gradeLevel} student with a ${profile.gpa} GPA,
        and the following search query: "${searchTerm}", find relevant success stories of past students.
        Return a JSON array of objects, where each object has the following keys: "id", "university", "major", "year", "stats", "hook", "essaySnippet", "fullEssay".
        Only return students that closely match the query. The 'id' should be a unique string.
    `;
    try {
        const response = await callGeminiAPI(prompt);
        return response.successStories || response || [];
    } catch (error) {
        console.error('Failed to find success stories:', error);
        return [];
    }
};

export const findTrainingResources = async (profile: StudentProfile, searchTerm: string): Promise<TrainingResource[]> => {
    const prompt = `
        For a student with profile ${JSON.stringify(profile)}, find training resources about "${searchTerm}".
        Return the response as a JSON array of objects. Each object should have the following keys: "id", "title", "provider", "type" ('course', 'video', or 'article'), and "url".
        The 'id' should be a unique string. If no resources are found, return an empty array [].
    `;
    try {
        const response = await callGeminiAPI(prompt);
        // Assuming the AI returns an array of resources, possibly under a key.
        return response.trainingResources || response || [];
    } catch (error) {
        console.error('Failed to find training resources:', error);
        return []; // Return an empty array on error
    }
};

export const critiqueEssay = async (prompt: string, content: string): Promise<string> => {
    const apiPrompt = `Critique this essay based on the prompt.\n\nPROMPT: ${prompt}\n\nESSAY:\n${content}`;
    try {
        return await callGeminiAPI(apiPrompt);
    } catch (error) {
        console.error('Failed to critique essay:', error);
        return "Could not get AI feedback at this time.";
    }
};

export const findEssayPrompts = async (college: string): Promise<string[]> => {
    const prompt = `
        Find the latest Common App and supplemental essay prompts for ${college}.
        Return the response as a JSON array of strings. If no prompts are found, return an empty array [].
    `;
    try {
        const response = await callGeminiAPI(prompt);
        return response.prompts || response || [];
    } catch (error) {
        console.error('Failed to find essay prompts:', error);
        return [];
    }
};

export const getGeminiChatResponse = async (history: ChatMessage[], text: string, profile: StudentProfile, persona?: string): Promise<string> => {
    const systemInstruction = `${persona || 'You are a helpful and expert college admissions counselor.'}
        Student Profile: ${JSON.stringify(profile)}
    `;

    // Convert our ChatMessage format to the format the Google AI SDK expects.
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user', // Ensure roles are 'user' or 'model'
        parts: [{ text: msg.text }]
    }));

    try {
        // Use the dedicated chat API function that sends a structured payload
        return await callGeminiChatAPI({
            prompt: text,
            history: formattedHistory,
            systemInstruction: systemInstruction
        });
    } catch (error) {
        console.error('Failed to get chat response:', error);
        return "I'm having trouble connecting right now. Please try again in a moment.";
    }
};

export const analyzeProfile = async (profile: StudentProfile): Promise<string> => {
    const prompt = `Analyze this student profile: ${JSON.stringify(profile)}. Provide a SWOT analysis.`;
    try {
        return await callGeminiAPI(prompt);
    } catch (error) {
        console.error('Failed to analyze profile:', error);
        return "Could not analyze profile at this time.";
    }
};

export const assessReadiness = async (profile: StudentProfile): Promise<ReadinessAssessment> => {
    const prompt = `
        Assess college readiness for this profile: ${JSON.stringify(profile)}.
        Return the response as a single JSON object with the following keys: "overallScore", "academicScore", "extracurricularScore", "fitScore" (all numbers from 0-100), and "strengths", "weaknesses", "actionableSteps" (all arrays of strings).
        If you cannot determine a value, use a default like 0 for scores or an empty array [] for lists.
    `;
    try {
        const response = await callGeminiAPI(prompt);
        return response.readiness || response;
    } catch (error) {
        console.error('Failed to assess readiness:', error);
        throw error; // Re-throw to be handled by the caller
    }
};

export const generateRoadmap = async (profile: StudentProfile): Promise<{ milestones: any[] }> => {
    const prompt = `
        Generate a college application roadmap for this student: ${JSON.stringify(profile)}.
        Return the response as a single JSON object with one key: "milestones". The value of "milestones" should be an array of objects, where each object has the keys: "title", "description", and "timeline".
        If you cannot generate a roadmap, return an object with an empty milestones array: { "milestones": [] }.
    `;
    try {
        const response = await callGeminiAPI(prompt);
        return response.roadmap || response || { milestones: [] };
    } catch (error) {
        console.error('Failed to generate roadmap:', error);
        return { milestones: [] };
    }
};

export const findScholarships = async (profile: StudentProfile, criteria: string): Promise<Scholarship[]> => {
    const prompt = `
        For a student with profile ${JSON.stringify(profile)}, find scholarships matching the criteria: "${criteria}".
        Return the response as a JSON array of objects. Each object should have the keys: "id", "name", "amount", "deadline", "requirements", "tags", and "matchScore".
        The 'id' should be a unique string. If no scholarships are found, return an empty array [].
    `;
    try {
        const response = await callGeminiAPI(prompt);
        return response.scholarships || response || [];
    } catch (error) {
        console.error('Failed to find scholarships:', error);
        return [];
    }
};

export const findColleges = async (profile: StudentProfile, criteria: string): Promise<College[]> => {
    const prompt = `
        For a student with profile ${JSON.stringify(profile)}, find colleges matching the criteria: "${criteria}".
        Return the response as a JSON array of objects. Each object should have the keys: "id", "name", "location", "ranking", "acceptanceRate", "tuition", "matchScore", and "matchReason".
        The 'id' should be a unique string. If no colleges are found, return an empty array [].
    `;
    try {
        const response = await callGeminiAPI(prompt);
        return response.colleges || response || [];
    } catch (error) {
        console.error('Failed to find colleges:', error);
        return [];
    }
};

export const generateSampleEssay = async (prompt: string, profile: StudentProfile): Promise<string> => {
    const apiPrompt = `Write a sample essay of 300-500 words for a student like this: ${JSON.stringify(profile)} for the prompt: "${prompt}"`;
    try {
        return await callGeminiAPI(apiPrompt);
    } catch (error) {
        console.error('Failed to generate sample essay:', error);
        return "Could not generate a sample essay at this time.";
    }
};

export const getInterviewQuestion = async (history: ChatMessage[], profile: StudentProfile): Promise<string> => {
    const prompt = `        You are a mock interviewer for ${profile.dreamColleges[0] || 'a top university'}.
        Ask the next logical interview question based on the chat history.
        History: ${JSON.stringify(history)}
    `;
    try {
        return await callGeminiAPI(prompt);
    } catch (error) {
        console.error('Failed to get interview question:', error);
        return "I'm having trouble thinking of the next question. Let's try that again.";
    }
};

export const replyToForumPost = async (title: string, content: string): Promise<string> => {
    const prompt = `        As an AI college counselor, provide a helpful, concise reply to this forum post.
        Title: ${title}
        Content: ${content}
    `;
    try {
        const response = await callGeminiAPI(prompt);
        return response || "I've read your post. It's important to consider all angles. Keep up the great work!";
    } catch (error) {
        console.error('Failed to generate AI reply for forum post:', error);
        return "Could not generate an AI reply at this time. A human will likely respond soon!";
    }
};
