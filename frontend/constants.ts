
import { StudentProfile, College, ForumPost, RoadmapItem, TrainingResource, Scholarship, SampleProfile, HumanCounselor } from './types';

export const INITIAL_PROFILE: StudentProfile = {
  name: "Alex Johnson",
  gradeLevel: 11,
  gpa: 3.85,
  testScores: { sat: 1480 },
  interests: ["Artificial Intelligence", "Cognitive Science", "Ethical Hacking"],
  intendedMajors: ["Computer Science", "Data Science"],
  extracurriculars: [
    "President of Robotics Club (3 years)",
    "Varsity Cross Country Captain",
    "Developed an iOS app with 5k+ downloads"
  ],
  awards: [
    "National Merit Scholar Semifinalist",
    "Regional Coding Hackathon Winner"
  ],
  volunteering: [
    "Teaching code to middle schoolers (50 hours)"
  ],
  dreamColleges: ["MIT", "Stanford", "CMU"],
  aiAnalysis: "" 
};

export const MOCK_COLLEGES: College[] = [
  { 
    id: '1', name: 'Massachusetts Institute of Technology (MIT)', location: 'Cambridge, MA', 
    ranking: 1, acceptanceRate: '4%', tuition: '$57,986', matchScore: 82, isTarget: false,
    matchReason: "High academic fit, but admission is extremely competitive."
  },
  { 
    id: '2', name: 'Carnegie Mellon University', location: 'Pittsburgh, PA', 
    ranking: 22, acceptanceRate: '11%', tuition: '$61,344', matchScore: 94, isTarget: true,
    matchReason: "Excellent fit for your CS interests and stats."
  },
  { 
    id: '3', name: 'University of Washington', location: 'Seattle, WA', 
    ranking: 40, acceptanceRate: '53%', tuition: '$39,906', matchScore: 98, isTarget: true,
    matchReason: "Safety school with a top-tier CS program."
  },
];

export const MOCK_ROADMAP: RoadmapItem[] = [
  { id: '1', title: 'Take SAT Subject Tests', description: 'Math Level 2 and Physics recommended for engineering.', status: 'completed', date: 'Aug 2024', category: 'standardized_testing' },
  { id: '2', title: 'Finalize College List', description: 'Categorize into Reach, Target, and Safety schools.', status: 'in-progress', date: 'Sep 2024', category: 'application' },
  { id: '3', title: 'Draft Personal Statement', description: 'Brainstorm and write first draft of Common App essay.', status: 'pending', date: 'Oct 2024', category: 'essay' },
  { id: '4', title: 'Request Letters of Rec', description: 'Ask AP Physics and English teachers.', status: 'pending', date: 'Oct 2024', category: 'application' },
];

export const MOCK_TRAINING: TrainingResource[] = [
  { id: '1', title: 'CS50: Introduction to Computer Science', provider: 'Harvard (edX)', type: 'course', url: '#', status: 'completed' },
  { id: '2', title: 'Machine Learning Specialization', provider: 'Coursera', type: 'course', url: '#', status: 'todo' },
  { id: '3', title: 'How to Write a Winning College Essay', provider: 'CollegeBoard', type: 'video', url: '#', status: 'todo' },
];

export const MOCK_SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: '1',
    university: 'Stanford University',
    year: 2023,
    major: 'Computer Science',
    stats: 'GPA 4.0 UW, SAT 1580',
    hook: 'Started a non-profit for e-waste recycling in 3 countries.',
    essaySnippet: 'I never thought a broken toaster would change my life, but...',
    fullEssay: 'I never thought a broken toaster would change my life, but looking at the tangled wires of my grandmother’s appliance sparked a curiosity that led me to dismantle everything in our garage. This mechanical deconstruction soon turned into digital reconstruction...'
  },
  {
    id: '2',
    university: 'University of Pennsylvania (Wharton)',
    year: 2024,
    major: 'Economics',
    stats: 'GPA 3.9 UW, ACT 35',
    hook: 'Published research on micro-finance in local communities.',
    essaySnippet: 'The ledger was off by three cents. To anyone else, a rounding error. To me...',
    fullEssay: 'The ledger was off by three cents. To anyone else, a rounding error. To me, it represented a breakdown in the trust mechanism of our high school credit union. I spent three nights tracing the discrepancy...'
  }
];

export const MOCK_COUNSELORS: HumanCounselor[] = [
  {
    id: '1',
    name: 'Dr. Emily Chen',
    title: 'Former Admissions Officer',
    almaMater: 'Yale University',
    specialty: 'STEM & Ivy League',
    rate: '$250/hr',
    rating: 4.9,
    imageUrl: '👩‍🏫'
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    title: 'Senior Essay Coach',
    almaMater: 'Columbia University',
    specialty: 'Humanities & Storytelling',
    rate: '$180/hr',
    rating: 4.8,
    imageUrl: '👨‍💼'
  }
];

export const MOCK_SCHOLARSHIPS: Scholarship[] = [
  { 
    id: '1', 
    name: 'FIRST Robotics Alumni Grant', 
    amount: '$5,000', 
    deadline: 'Dec 15, 2024', 
    requirements: 'Active participation in FIRST Robotics Competition.', 
    matchScore: 98, 
    tags: ['STEM', 'Extracurricular'] 
  },
  { 
    id: '2', 
    name: 'National Merit Scholarship', 
    amount: '$2,500', 
    deadline: 'Oct 08, 2024', 
    requirements: 'Top 1% PSAT scores.', 
    matchScore: 90, 
    tags: ['Academic', 'Merit'] 
  },
  { 
    id: '3', 
    name: 'Coca-Cola Scholars Program', 
    amount: '$20,000', 
    deadline: 'Oct 31, 2024', 
    requirements: 'Leadership, service, and commitment to community.', 
    matchScore: 75, 
    tags: ['Leadership', 'Service'] 
  }
];

export const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'Sarah K.',
    title: 'AP Physics C vs Physics 1?',
    content: 'Does anyone know if taking AP Physics C is crucial for Engineering majors if I already took Physics 1?',
    category: 'Academics',
    likes: 12,
    timestamp: new Date(Date.now() - 86400000),
    replies: []
  },
  {
    id: '2',
    author: 'Mike R.',
    title: 'Essay Topic help',
    content: 'Struggling with the Common App essay prompt regarding "a challenge you faced". Is it okay to write about a sports injury?',
    category: 'Essays',
    likes: 8,
    timestamp: new Date(Date.now() - 172800000),
    replies: [
        {
            id: 'r1',
            author: 'Jessica T.',
            content: 'I heard sports injuries are cliche unless you have a really unique angle!',
            timestamp: new Date(Date.now() - 100000000)
        }
    ]
  }
];

export const SYSTEM_INSTRUCTION_BASE = `
You are "AdmissionAI", an elite, world-class College Admission Consultant. 
Your goal is to maximize the student's chances of acceptance into top-tier universities.

Traits:
- Strategic: You don't just give facts; you give competitive advantages.
- Honest: If a student's GPA is low for Harvard, tell them kindly but firmly, and suggest alternatives.
- Holistic: You consider personality, leadership, and "spike" (a standout talent) not just grades.
- Supportive: You are a mentor.

Capabilities:
- Profile Analysis: Identifying "hooks" in a student's background.
- College Matching: Suggesting schools based on culture + academics + financial aid.
- Essay Coaching: Helping with "Show, don't tell".
- Interview Prep: STAR method training.
`;
