
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DISCOVERY = 'DISCOVERY',
  COLLEGES = 'COLLEGES',
  APPLICATIONS = 'APPLICATIONS',
  PLANNING = 'PLANNING',
  INTERVIEW = 'INTERVIEW',
  TRAINING = 'TRAINING',
  SCHOLARSHIPS = 'SCHOLARSHIPS',
  ADMIN = 'ADMIN'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  photo: string;
}

export interface ReadinessAssessment {
  overallScore: number; // 0-100
  academicScore: number;
  extracurricularScore: number;
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  actionableSteps: string[];
}

export interface StudentProfile {
  name: string;
  gradeLevel: number;
  gpa: number;
  testScores: {
    sat?: number;
    act?: number;
    toefl?: number;
  };
  interests: string[];
  intendedMajors: string[]; // AI suggested or user selected
  extracurriculars: string[];
  awards: string[];
  volunteering: string[];
  dreamColleges: string[];
  aiAnalysis?: string; // Markdown analysis of the profile
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface College {
  id: string;
  name: string;
  location: string;
  ranking: number;
  acceptanceRate: string;
  tuition: string;
  matchScore?: number;
  matchReason?: string;
  isTarget: boolean; // Reach, Target, Safety
}

export interface Essay {
  id: string;
  collegeName: string;
  prompt: string;
  content: string;
  lastEdited: Date;
  aiFeedback?: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  date: string; // e.g., "Fall 2024"
  category: 'academic' | 'standardized_testing' | 'essay' | 'application';
}

export interface TrainingResource {
  id: string;
  title: string;
  provider: string; // Coursera, EdX, Khan Academy
  type: 'course' | 'book' | 'video';
  url: string;
  status: 'todo' | 'completed';
}

export interface SampleProfile {
  id: string;
  university: string;
  year: number;
  major: string;
  stats: string; // e.g. "GPA 4.0, SAT 1580"
  hook: string; // e.g. "International Math Olympiad Gold"
  essaySnippet: string;
  fullEssay: string;
}

export interface HumanCounselor {
  id: string;
  name: string;
  title: string;
  almaMater: string;
  specialty: string;
  rate: string;
  rating: number;
  imageUrl: string;
}

export interface ForumReply {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface ForumPost {
  id: string;
  author: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  aiReply?: string;
  timestamp: Date;
  replies: ForumReply[];
}

export interface Scholarship {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  requirements: string;
  matchScore: number;
  tags: string[];
}
