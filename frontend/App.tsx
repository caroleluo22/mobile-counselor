
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import { AppView, UserRole, StudentProfile, ChatMessage, College, Essay, RoadmapItem, ForumPost, TrainingResource, Scholarship, ForumReply, ReadinessAssessment, SampleProfile, HumanCounselor, User } from './types';
import { INITIAL_PROFILE, MOCK_COLLEGES, MOCK_FORUM_POSTS, MOCK_ROADMAP, MOCK_TRAINING, MOCK_SCHOLARSHIPS, MOCK_SAMPLE_PROFILES, MOCK_COUNSELORS } from './constants';
import * as Gemini from './services/geminiService';
import * as AuthService from './services/authService';

// --- Helper Components ---

const DictationButton: React.FC<{
  onTranscript: (text: string) => void;
  className?: string;
}> = ({ onTranscript, className }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.onerror = (event: any) => {
        console.error("Dictation error", event.error);
        setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center justify-center transition-all duration-200 ${className} ${isListening ? 'animate-pulse text-red-600 bg-red-100 border-red-300' : 'text-gray-500 bg-white hover:bg-gray-100 border-gray-200'}`}
        title="Dictate"
    >
        {isListening ? (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
               <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
               <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
             </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
        )}
    </button>
  );
};

// --- Sub-Components ---

const LandingView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center text-white font-sans">
       {/* Decorative Background */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
         <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
         <div className="absolute bottom-0 right-20 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
       </div>

       <div className="z-10 flex flex-col items-center p-6 text-center max-w-md w-full">
         <div className="mb-8 bg-white/10 p-5 rounded-3xl backdrop-blur-md shadow-2xl ring-1 ring-white/20">
            <span className="text-6xl">🎓</span>
         </div>
         
         <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-transparent tracking-tight">
           AdmissionAI
         </h1>
         <p className="text-indigo-200 mb-10 text-lg font-light leading-relaxed max-w-xs">
           Your personal AI consultant for strategic college planning, essay coaching, and acceptance.
         </p>

         <button 
           onClick={onLogin}
           className="w-full bg-white text-indigo-900 font-bold py-4 rounded-2xl shadow-xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
         >
           Get Started
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
           </svg>
         </button>

         <div className="mt-12 flex justify-center gap-8 text-xs text-indigo-300 font-medium tracking-wide uppercase">
            <span className="flex flex-col items-center gap-1 opacity-80">
                <span className="text-2xl">🧠</span> 
                AI Powered
            </span>
            <span className="flex flex-col items-center gap-1 opacity-80">
                <span className="text-2xl">🏛️</span> 
                Ivy Strategy
            </span>
            <span className="flex flex-col items-center gap-1 opacity-80">
                <span className="text-2xl">✍️</span> 
                Essay Coach
            </span>
         </div>
       </div>

       <div className="absolute bottom-6 text-[10px] text-gray-500 z-10">
         © 2024 AdmissionAI Inc. • Privacy & Terms
       </div>
    </div>
  );
};

type DiscoveryTab = 'details' | 'analysis' | 'readiness';

const DiscoveryView: React.FC<{ 
    profile: StudentProfile; 
    setProfile: (p: StudentProfile) => void;
    onAnalyze: () => void;
    analysis: string | undefined;
    readiness: ReadinessAssessment | null;
    onAssessReadiness: () => void;
    isTyping: boolean;
    activeTab: DiscoveryTab;
    setActiveTab: (tab: DiscoveryTab) => void;
}> = ({ profile, setProfile, onAnalyze, analysis, readiness, onAssessReadiness, isTyping, activeTab, setActiveTab }) => {
    
    const handleExtracurricularDictation = (text: string) => {
        // Append new dictation as a new line item
        const current = profile.extracurriculars;
        setProfile({ ...profile, extracurriculars: [...current, text] });
    };

    const renderProgressBar = (score: number, label: string, colorClass: string) => (
        <div className="mb-4">
            <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-600">{label}</span>
                <span className={`${colorClass} brightness-75`}>{score}/100</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${colorClass}`} 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex bg-white border-b border-gray-200">
                <button onClick={() => setActiveTab('details')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>My Profile</button>
                <button onClick={() => setActiveTab('analysis')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'analysis' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Analysis</button>
                <button onClick={() => setActiveTab('readiness')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'readiness' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Readiness</button>
            </div>

            {activeTab === 'details' ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Academic</h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span>GPA</span> <input type="number" value={profile.gpa} onChange={e => setProfile({...profile, gpa: parseFloat(e.target.value)})} className="text-right w-20 bg-gray-50 rounded px-1"/>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>SAT</span> <input type="number" value={profile.testScores.sat} onChange={e => setProfile({...profile, testScores: {...profile.testScores, sat: parseInt(e.target.value)}})} className="text-right w-20 bg-gray-50 rounded px-1"/>
                            </div>
                             <div className="flex justify-between">
                                <span>Grade</span> <input type="number" value={profile.gradeLevel} onChange={e => setProfile({...profile, gradeLevel: parseInt(e.target.value)})} className="text-right w-20 bg-gray-50 rounded px-1"/>
                            </div>
                        </div>
                    </section>
                    <section>
                        <div className="flex justify-between items-end mb-2">
                             <h3 className="text-xs font-bold text-gray-500 uppercase">Interests & Extracurriculars</h3>
                        </div>
                       
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 shadow-sm relative">
                            {profile.interests.map((int, i) => (
                                <span key={i} className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs mr-2 mb-2">{int}</span>
                            ))}
                            <div className="relative">
                                <textarea 
                                    className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-10" 
                                    rows={5}
                                    placeholder="List your activities..."
                                    value={profile.extracurriculars.join('\n')}
                                    onChange={e => setProfile({...profile, extracurriculars: e.target.value.split('\n')})}
                                />
                                <div className="absolute bottom-2 right-2">
                                    <DictationButton 
                                        onTranscript={handleExtracurricularDictation} 
                                        className="p-2 rounded-full border shadow-sm"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 text-right">Tap mic to append activity</p>
                        </div>
                    </section>
                </div>
            ) : activeTab === 'analysis' ? (
                <div className="flex-1 overflow-y-auto p-4">
                    {!analysis ? (
                         <div className="text-center mt-10">
                             <p className="text-gray-500 mb-4">Let me analyze your profile to find your "spike" and best-fit majors.</p>
                             <button onClick={onAnalyze} disabled={isTyping} className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-200">
                                 {isTyping ? 'Analyzing...' : 'Run SWOT Analysis'}
                             </button>
                         </div>
                    ) : (
                        <div className="prose prose-sm prose-indigo max-w-none bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-indigo-900 mb-4">Profile Assessment</h3>
                            <div className="whitespace-pre-wrap text-gray-700">{analysis}</div>
                            <button onClick={onAnalyze} className="mt-6 text-indigo-600 text-xs font-bold uppercase tracking-wide">Re-Analyze</button>
                        </div>
                    )}
                </div>
            ) : (
                // Readiness Tab
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                    {!readiness ? (
                        <div className="text-center mt-10">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Are you ready for your dream schools?</h3>
                            <p className="text-gray-500 mb-6 text-sm px-4">Get a quantitative score based on your GPA, Test Scores, and Extracurriculars against your target colleges.</p>
                            <button onClick={onAssessReadiness} disabled={isTyping} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-xl active:scale-95 transition-transform">
                                {isTyping ? 'Calculating...' : 'Check My Readiness'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-20">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"></div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Overall Readiness</h3>
                                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-indigo-50 bg-white mb-2 relative">
                                    <span className={`text-4xl font-extrabold ${readiness.overallScore >= 80 ? 'text-green-600' : readiness.overallScore >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                                        {readiness.overallScore}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">Target: {profile.dreamColleges[0] || 'Top Tier'}</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                {renderProgressBar(readiness.academicScore, "Academics", "bg-blue-500")}
                                {renderProgressBar(readiness.extracurricularScore, "Extracurriculars", "bg-purple-500")}
                                {renderProgressBar(readiness.fitScore, "College Fit", "bg-teal-500")}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <h4 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-2">✅ Strengths</h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {readiness.strengths.map((s, i) => (
                                            <li key={i} className="text-xs text-green-900 leading-relaxed">{s}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                    <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">⚠️ Gaps to Fill</h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {readiness.weaknesses.map((w, i) => (
                                            <li key={i} className="text-xs text-red-900 leading-relaxed">{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-indigo-900 text-white p-5 rounded-xl shadow-lg">
                                <h4 className="font-bold text-sm mb-3">🚀 Recommended Next Steps</h4>
                                <div className="space-y-2">
                                    {readiness.actionableSteps.map((step, i) => (
                                        <div key={i} className="flex gap-3 items-start bg-indigo-800/50 p-2 rounded-lg">
                                            <span className="bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i+1}</span>
                                            <p className="text-xs text-indigo-100">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <button onClick={onAssessReadiness} className="w-full py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Recalculate Score</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CollegeFinderView: React.FC<{
    colleges: College[];
    onCompare: (c1: string, c2: string) => void;
    onChat: (msg: string) => void;
}> = ({ colleges, onCompare, onChat }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) setSelected(selected.filter(s => s !== id));
        else if (selected.length < 2) setSelected([...selected, id]);
    };

    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">University Finder</h2>
                {selected.length === 2 && (
                    <button 
                        onClick={() => { onCompare(colleges.find(c=>c.id===selected[0])!.name, colleges.find(c=>c.id===selected[1])!.name); setSelected([]); }}
                        className="bg-indigo-600 text-white px-3 py-1 text-xs rounded-lg font-bold animate-pulse"
                    >
                        Compare (2)
                    </button>
                )}
            </div>
            
            <div className="space-y-4 overflow-y-auto pb-20">
                {colleges.map(c => (
                    <div key={c.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${selected.includes(c.id) ? 'border-indigo-500 transform scale-[1.01]' : 'border-transparent'}`} onClick={() => toggleSelect(c.id)}>
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{c.name}</h3>
                                    <p className="text-sm text-gray-500">{c.location}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${c.matchScore && c.matchScore > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {c.matchScore}% Match
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <div className="text-center border-r border-gray-200">
                                    <span className="block font-bold">#{c.ranking}</span> Rank
                                </div>
                                <div className="text-center border-r border-gray-200">
                                    <span className="block font-bold">{c.acceptanceRate}</span> Rate
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold">{c.tuition}</span> /yr
                                </div>
                            </div>
                            {c.matchReason && (
                                <p className="mt-2 text-xs text-indigo-800 italic border-t pt-2 border-gray-100">
                                    AI: "{c.matchReason}"
                                </p>
                            )}
                            <div className="mt-3 flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onChat(`Tell me specific details about ${c.name}'s CS program.`); }} className="flex-1 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">Details</button>
                                <button onClick={(e) => { e.stopPropagation(); onChat(`What is the application deadline for ${c.name}?`); }} className="flex-1 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">Deadlines</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ScholarshipView: React.FC<{
    scholarships: Scholarship[];
    onFindMore: () => void;
    isTyping: boolean;
}> = ({ scholarships, onFindMore, isTyping }) => {
    return (
        <div className="flex flex-col h-full p-4 bg-slate-50">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Scholarship Matcher</h2>
                <button 
                    onClick={onFindMore} 
                    disabled={isTyping}
                    className="bg-green-600 text-white px-4 py-2 text-xs rounded-full font-bold flex items-center gap-1 shadow-md active:scale-95 transition"
                >
                    {isTyping ? 'Scanning...' : '🔎 Find More'}
                </button>
            </div>

            <div className="space-y-4 overflow-y-auto pb-20">
                {scholarships.length === 0 ? (
                     <div className="text-center mt-20 p-8">
                        <div className="text-5xl mb-4">💸</div>
                        <p className="text-gray-600 mb-2">College is expensive.</p>
                        <p className="text-sm text-gray-400">Let AI scan for grants based on your profile.</p>
                     </div>
                ) : (
                    scholarships.map((s) => (
                        <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 pr-2">{s.name}</h3>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">{s.amount}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {s.tags.map((tag, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{tag}</span>
                                    ))}
                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{s.matchScore}% Match</span>
                                </div>

                                <div className="bg-slate-50 p-2 rounded text-xs text-gray-600 mb-2">
                                    <span className="font-bold text-gray-800">Requirements:</span> {s.requirements}
                                </div>

                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xs text-red-500 font-semibold">Due: {s.deadline}</span>
                                    <button className="text-indigo-600 text-xs font-bold border border-indigo-200 px-4 py-1.5 rounded-full hover:bg-indigo-50">Apply</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ApplicationView: React.FC<{
    essays: Essay[];
    setEssays: (e: Essay[]) => void;
    onCritique: (prompt: string, content: string) => Promise<string>;
    onBrainstorm: (prompt: string) => void;
    onFindPrompts: (college: string) => Promise<string[]>;
}> = ({ essays, setEssays, onCritique, onBrainstorm, onFindPrompts }) => {
    const [activeEssayId, setActiveEssayId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Create New Essay State
    const [isCreating, setIsCreating] = useState(false);
    const [newCollege, setNewCollege] = useState('');
    const [newPrompt, setNewPrompt] = useState('');
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [loadingPrompts, setLoadingPrompts] = useState(false);

    const activeEssay = essays.find(e => e.id === activeEssayId);

    const handleCritique = async () => {
        if (!activeEssay) return;
        setLoading(true);
        const feedback = await onCritique(activeEssay.prompt, activeEssay.content);
        setEssays(essays.map(e => e.id === activeEssayId ? { ...e, aiFeedback: feedback } : e));
        setLoading(false);
    };

    const handleEssayDictation = (text: string) => {
        if(!activeEssay) return;
        const newContent = activeEssay.content + (activeEssay.content ? ' ' : '') + text;
        setEssays(essays.map(essay => essay.id === activeEssayId ? {...essay, content: newContent} : essay));
    };

    const handleFindPrompts = async () => {
        if (!newCollege) return;
        setLoadingPrompts(true);
        const prompts = await onFindPrompts(newCollege);
        setSuggestedPrompts(prompts);
        setLoadingPrompts(false);
    };

    const handleCreateEssay = () => {
        if (!newCollege || !newPrompt) return;
        const newEssay: Essay = {
            id: Date.now().toString(),
            collegeName: newCollege,
            prompt: newPrompt,
            content: '',
            lastEdited: new Date()
        };
        setEssays([...essays, newEssay]);
        setIsCreating(false);
        setNewCollege('');
        setNewPrompt('');
        setSuggestedPrompts([]);
    };

    // --- Create Essay Wizard ---
    if (isCreating) {
        return (
            <div className="flex flex-col h-full bg-white p-4">
                <button onClick={() => setIsCreating(false)} className="text-sm text-gray-500 mb-4">← Cancel</button>
                <h2 className="text-xl font-bold mb-6">New Essay Draft</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">College / University</label>
                        <input 
                            className="w-full text-base border-b border-gray-200 pb-2 focus:outline-none focus:border-indigo-500 font-semibold"
                            placeholder="e.g. Yale University"
                            value={newCollege}
                            onChange={(e) => setNewCollege(e.target.value)}
                        />
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-bold text-indigo-800 uppercase">Essay Prompt</label>
                             <button 
                                onClick={handleFindPrompts} 
                                disabled={!newCollege || loadingPrompts}
                                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-bold shadow-sm"
                             >
                                {loadingPrompts ? 'Searching...' : '🔍 Find Prompts'}
                             </button>
                        </div>
                        
                        {suggestedPrompts.length > 0 && (
                            <div className="mb-3 space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {suggestedPrompts.map((p, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setNewPrompt(p)}
                                        className={`w-full text-left text-xs p-2 rounded border transition-colors ${newPrompt === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}

                        <textarea 
                            className="w-full text-sm p-2 rounded border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Or type prompt here..."
                            rows={3}
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={handleCreateEssay}
                        disabled={!newCollege || !newPrompt}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Draft
                    </button>
                </div>
            </div>
        );
    }

    // --- Editor View ---
    if (activeEssay) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="p-4 border-b flex justify-between items-center">
                    <button onClick={() => setActiveEssayId(null)} className="text-sm text-gray-500">← Back</button>
                    <h3 className="font-bold text-sm truncate max-w-[200px]">{activeEssay.collegeName}</h3>
                    <button onClick={handleCritique} disabled={loading} className="text-indigo-600 text-sm font-bold">
                        {loading ? 'Thinking...' : 'Critique'}
                    </button>
                </div>
                <div className="p-4 bg-gray-50 border-b">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Prompt</p>
                    <p className="text-sm text-gray-800 italic">{activeEssay.prompt}</p>
                    <button onClick={() => onBrainstorm(activeEssay.prompt)} className="mt-2 text-xs text-indigo-600 font-bold flex items-center gap-1">
                        ✨ Brainstorm Ideas with AI
                    </button>
                </div>
                <div className="flex-1 relative">
                    <textarea 
                        className="w-full h-full p-4 resize-none focus:outline-none text-base leading-relaxed pb-16"
                        placeholder="Start writing..."
                        value={activeEssay.content}
                        onChange={(e) => setEssays(essays.map(essay => essay.id === activeEssayId ? {...essay, content: e.target.value} : essay))}
                    />
                    <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                        <span className="text-[10px] text-gray-400 bg-white/80 px-2 rounded">Voice Note</span>
                        <DictationButton 
                            onTranscript={handleEssayDictation}
                            className="p-4 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 border-none"
                        />
                    </div>
                </div>
                {activeEssay.aiFeedback && (
                    <div className="h-1/3 bg-yellow-50 p-4 overflow-y-auto border-t border-yellow-200">
                        <h4 className="text-xs font-bold text-yellow-800 uppercase mb-2">AI Feedback</h4>
                        <div className="text-sm text-yellow-900 whitespace-pre-wrap">{activeEssay.aiFeedback}</div>
                    </div>
                )}
            </div>
        );
    }

    // --- Dashboard View ---
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Application Hub</h2>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-indigo-800">4</div>
                    <div className="text-xs text-indigo-600">Pending Essays</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-800">2</div>
                    <div className="text-xs text-green-600">Completed</div>
                </div>
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase mt-4">Essay Drafts</h3>
            {essays.map(essay => (
                <div key={essay.id} onClick={() => setActiveEssayId(essay.id)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:bg-gray-50 transition">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-sm text-gray-900">{essay.collegeName}</span>
                        <span className="text-xs text-gray-400">{essay.lastEdited.toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{essay.prompt}</p>
                </div>
            ))}
            
            <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-bold hover:bg-gray-50 transition"
            >
                + Add New Essay
            </button>
        </div>
    );
};

const PlanningView: React.FC<{ 
    roadmap: RoadmapItem[]; 
    onGenerate: () => void; 
    isTyping: boolean; 
    setRoadmap: React.Dispatch<React.SetStateAction<RoadmapItem[]>>;
    onRequestConsultation: () => void;
}> = ({ roadmap, onGenerate, isTyping, setRoadmap, onRequestConsultation }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempItem, setTempItem] = useState<Partial<RoadmapItem>>({});
    
    // Add Item State
    const [newItem, setNewItem] = useState<Partial<RoadmapItem>>({ title: '', description: '', date: '', category: 'application' });

    const handleToggleStatus = (id: string) => {
        setRoadmap(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' } : item));
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm("Delete this task?")) {
            setRoadmap(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleStartEdit = (item: RoadmapItem) => {
        setEditingId(item.id);
        setTempItem({...item});
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        setRoadmap(prev => prev.map(item => item.id === editingId ? { ...item, ...tempItem } as RoadmapItem : item));
        setEditingId(null);
    };

    const handleAddItem = () => {
        if (!newItem.title) return;
        const item: RoadmapItem = {
            id: Date.now().toString(),
            title: newItem.title,
            description: newItem.description || '',
            date: newItem.date || 'TBD',
            category: (newItem.category as any) || 'application',
            status: 'pending'
        };
        setRoadmap(prev => [...prev, item]);
        setNewItem({ title: '', description: '', date: '', category: 'application' });
        setIsAdding(false);
    };

    return (
        <div className="p-4 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Strategy Roadmap</h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsAdding(!isAdding)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-bold shadow-sm">
                        {isAdding ? 'Cancel' : '+ Add Task'}
                    </button>
                    <button onClick={onGenerate} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
                        {isTyping ? 'Generating...' : 'AI Refresh'}
                    </button>
                </div>
            </div>

            {/* Add Item Form */}
            {isAdding && (
                <div className="bg-white p-4 rounded-xl shadow-md border border-indigo-200 mb-6 animate-pulse-once">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">New Task</h3>
                    <input 
                        className="w-full text-sm font-bold border-b border-gray-200 pb-2 mb-3 focus:outline-none focus:border-indigo-500"
                        placeholder="Task Title (e.g., Submit FAFSA)"
                        value={newItem.title}
                        onChange={e => setNewItem({...newItem, title: e.target.value})}
                    />
                    <textarea 
                        className="w-full text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 focus:outline-none"
                        placeholder="Description..."
                        rows={2}
                        value={newItem.description}
                        onChange={e => setNewItem({...newItem, description: e.target.value})}
                    />
                    <div className="flex justify-between gap-2">
                         <input 
                            className="flex-1 text-xs border rounded px-2 py-1"
                            placeholder="Due Date"
                            value={newItem.date}
                            onChange={e => setNewItem({...newItem, date: e.target.value})}
                         />
                         <button onClick={handleAddItem} className="bg-indigo-600 text-white text-xs px-4 py-1 rounded font-bold">Save</button>
                    </div>
                </div>
            )}

            {roadmap.length === 0 ? (
                <div className="text-center mt-20">
                    <p className="text-gray-500">No roadmap generated yet.</p>
                    <button onClick={onGenerate} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Create Strategy</button>
                </div>
            ) : (
                <div className="relative border-l-2 border-indigo-200 ml-4 space-y-8 pb-10">
                    {roadmap.map((item, idx) => (
                        <div key={item.id} className="ml-6 relative group">
                            <div 
                                onClick={() => handleToggleStatus(item.id)}
                                className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform ${item.status === 'completed' ? 'bg-green-500' : item.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                            ></div>
                            
                            {editingId === item.id ? (
                                <div className="bg-white p-4 rounded-xl shadow-lg border border-indigo-300 z-10 relative">
                                    <input 
                                        className="w-full text-sm font-bold border-b mb-2 focus:outline-none"
                                        value={tempItem.title}
                                        onChange={e => setTempItem({...tempItem, title: e.target.value})}
                                    />
                                    <textarea 
                                        className="w-full text-xs text-gray-600 border rounded p-1 mb-2"
                                        value={tempItem.description}
                                        onChange={e => setTempItem({...tempItem, description: e.target.value})}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-500">Cancel</button>
                                        <button onClick={handleSaveEdit} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded">Update</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
                                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                                        <button type="button" onClick={() => handleStartEdit(item)} className="p-1 hover:bg-gray-100 rounded text-gray-500">✎</button>
                                        <button type="button" onClick={(e) => handleDelete(item.id, e)} className="p-1 hover:bg-red-50 rounded text-red-400">✕</button>
                                    </div>
                                    <div className="flex justify-between items-start mb-2 pr-6">
                                        <h4 className={`font-bold text-gray-900 text-sm ${item.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{item.title}</h4>
                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono whitespace-nowrap">{item.date}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                                    <span className="inline-block mt-2 text-[10px] font-bold uppercase text-indigo-400 tracking-wider">{item.category}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-8 bg-gradient-to-br from-gray-900 to-indigo-900 p-6 rounded-2xl text-white shadow-xl">
                <h3 className="font-bold text-lg mb-2">Want a Human Expert?</h3>
                <p className="text-sm text-indigo-200 mb-4">Connect with our Ivy League alumni network for a comprehensive review.</p>
                <button onClick={onRequestConsultation} className="w-full bg-white text-indigo-900 py-3 rounded-lg font-bold text-sm">Request Consultation ($)</button>
            </div>
        </div>
    );
};

// Replaced simple TrainingView with comprehensive Resource Hub
const TrainingView: React.FC<{ resources: TrainingResource[]; initialTab?: 'learn' | 'inspire' | 'expert' }> = ({ resources, initialTab = 'learn' }) => {
    const [tab, setTab] = useState<'learn' | 'inspire' | 'expert'>(initialTab);
    const [selectedProfile, setSelectedProfile] = useState<SampleProfile | null>(null);
    const [bookingCounselor, setBookingCounselor] = useState<HumanCounselor | null>(null);
    const [bookingStep, setBookingStep] = useState<'select' | 'success'>('select');
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [selectedResource, setSelectedResource] = useState<TrainingResource | null>(null);

    // Reset flow when modal closes
    const closeBooking = () => {
        setBookingCounselor(null);
        setBookingStep('select');
        setSelectedSlot('');
    };

    if (bookingCounselor) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {bookingStep === 'select' ? (
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Book Session</h3>
                                    <p className="text-sm text-gray-500">with {bookingCounselor.name}</p>
                                </div>
                                <button onClick={closeBooking} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6 bg-indigo-50 p-4 rounded-xl">
                                <div className="text-3xl">{bookingCounselor.imageUrl}</div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">{bookingCounselor.title}</p>
                                    <p className="text-xs text-indigo-700">{bookingCounselor.rate} / 60 min</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Availability</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Tue, Oct 24 @ 4pm', 'Tue, Oct 24 @ 6pm', 'Wed, Oct 25 @ 5pm', 'Fri, Oct 27 @ 11am'].map(slot => (
                                        <button 
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${selectedSlot === slot ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'}`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Topic (Optional)</label>
                                <textarea className="w-full text-sm p-3 bg-gray-50 border rounded-lg focus:outline-none" rows={2} placeholder="Essay review, Mock interview..." />
                            </div>

                            <button 
                                onClick={() => setBookingStep('success')}
                                disabled={!selectedSlot}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-white">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">🎉</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                            <p className="text-sm text-gray-500 mb-6">You are scheduled with {bookingCounselor.name} on <span className="font-bold text-gray-800">{selectedSlot}</span>.</p>
                            <p className="text-xs text-gray-400 mb-6">A calendar invite and Zoom link have been sent to your email.</p>
                            <button onClick={closeBooking} className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200">Done</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (selectedProfile) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="p-4 border-b flex items-center gap-2 sticky top-0 bg-white z-10">
                    <button onClick={() => setSelectedProfile(null)} className="text-sm font-bold text-indigo-600">← Back</button>
                    <h2 className="font-bold text-gray-900 truncate">{selectedProfile.university} Admit</h2>
                </div>
                <div className="p-4 overflow-y-auto pb-20">
                     <div className="mb-6">
                        <h3 className="text-2xl font-bold text-indigo-900 mb-1">{selectedProfile.university}</h3>
                        <p className="text-gray-500 font-medium">{selectedProfile.major} • Class of {selectedProfile.year}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">Stats</span>
                            <span className="font-bold text-gray-800 text-sm">{selectedProfile.stats}</span>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                            <span className="block text-[10px] font-bold text-indigo-400 uppercase">Hook</span>
                            <span className="font-bold text-indigo-900 text-sm">{selectedProfile.hook}</span>
                        </div>
                     </div>

                     <div className="prose prose-sm prose-indigo max-w-none">
                        <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">Personal Statement</h4>
                        <div className="whitespace-pre-wrap font-serif text-gray-700 leading-relaxed text-base">
                            {selectedProfile.fullEssay}
                        </div>
                     </div>
                </div>
            </div>
        )
    }

    if (selectedResource) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedResource(null)}>
                <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="h-32 bg-indigo-600 flex items-center justify-center">
                        <span className="text-6xl">
                            {selectedResource.type === 'course' ? '🎓' : selectedResource.type === 'video' ? '📺' : '📖'}
                        </span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedResource.title}</h3>
                        <p className="text-sm text-indigo-600 font-medium mb-4">{selectedResource.provider}</p>
                        
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                            This resource is highly recommended to strengthen your academic profile. 
                            Complete this to demonstrate intellectual vitality to admission officers.
                        </p>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setSelectedResource(null)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 text-xs"
                            >
                                Close
                            </button>
                            <a 
                                href={selectedResource.url === '#' ? 'https://www.google.com/search?q=' + encodeURIComponent(selectedResource.title) : selectedResource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition"
                                onClick={() => setSelectedResource(null)}
                            >
                                Start Learning ↗
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
             <div className="bg-white border-b sticky top-0 z-10">
                <h2 className="text-xl font-bold p-4">Resources Hub</h2>
                <div className="flex">
                    <button onClick={() => setTab('learn')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${tab === 'learn' ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent'}`}>Learning</button>
                    <button onClick={() => setTab('inspire')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${tab === 'inspire' ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent'}`}>Success Stories</button>
                    <button onClick={() => setTab('expert')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${tab === 'expert' ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent'}`}>Experts</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-20">
                {tab === 'learn' && (
                     <div className="space-y-3">
                        <div className="mb-4 text-xs text-gray-500 uppercase font-bold tracking-wider">Recommended Courses</div>
                        {resources.map(res => (
                            <div key={res.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">
                                    {res.type === 'course' ? '🎓' : res.type === 'video' ? '📺' : '📖'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-gray-900">{res.title}</h4>
                                    <p className="text-xs text-gray-500">{res.provider}</p>
                                </div>
                                <button 
                                   onClick={() => setSelectedResource(res)} 
                                   className="text-indigo-600 text-xs font-bold border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-50"
                                >
                                   View
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'inspire' && (
                    <div className="space-y-4">
                        <div className="mb-2 text-xs text-gray-500 uppercase font-bold tracking-wider">Historical Admitted Profiles</div>
                        {MOCK_SAMPLE_PROFILES.map(profile => (
                            <div key={profile.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{profile.university}</h3>
                                            <p className="text-indigo-100 text-xs">{profile.year} • {profile.major}</p>
                                        </div>
                                        <div className="bg-white/20 px-2 py-1 rounded text-xs font-mono">
                                            {profile.stats}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="mb-3">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">The "Hook"</span>
                                        <p className="text-sm text-gray-800 font-medium">{profile.hook}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <span className="text-[10px] font-bold text-yellow-700 uppercase block mb-1">Essay Snippet</span>
                                        <p className="text-xs text-gray-600 italic leading-relaxed">"{profile.essaySnippet}..."</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedProfile(profile)}
                                        className="w-full mt-3 py-2 text-xs font-bold text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition"
                                    >
                                        View Full Application
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'expert' && (
                    <div className="space-y-4">
                         <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                            <h3 className="font-bold text-indigo-900 text-sm mb-1">Why hire a human?</h3>
                            <p className="text-xs text-indigo-700">AdmissionAI is powerful, but sometimes you need a final human review before hitting submit.</p>
                         </div>
                         <div className="mb-2 text-xs text-gray-500 uppercase font-bold tracking-wider">Available Counselors</div>
                         {MOCK_COUNSELORS.map(counselor => (
                             <div key={counselor.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                                 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                    {counselor.imageUrl}
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between items-start">
                                         <div>
                                            <h4 className="font-bold text-gray-900">{counselor.name}</h4>
                                            <p className="text-xs text-indigo-600 font-medium">{counselor.title}</p>
                                         </div>
                                         <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">⭐ {counselor.rating}</span>
                                     </div>
                                     <p className="text-xs text-gray-500 mt-1">{counselor.almaMater} • {counselor.specialty}</p>
                                     <div className="flex justify-between items-center mt-3">
                                         <span className="text-xs font-bold text-gray-700">{counselor.rate}</span>
                                         <button 
                                            onClick={() => setBookingCounselor(counselor)}
                                            className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-indigo-700 transition"
                                         >
                                            Book Session
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Data State
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);
  const [readiness, setReadiness] = useState<ReadinessAssessment | null>(null);
  const [colleges, setColleges] = useState<College[]>(MOCK_COLLEGES);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(MOCK_ROADMAP);
  const [scholarships, setScholarships] = useState<Scholarship[]>(MOCK_SCHOLARSHIPS);
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_FORUM_POSTS);
  const [essays, setEssays] = useState<Essay[]>([
      { id: '1', collegeName: 'MIT', prompt: 'Tell us about a challenge...', content: '', lastEdited: new Date() },
      { id: '2', collegeName: 'Stanford', prompt: 'What matters to you, and why?', content: '', lastEdited: new Date() }
  ]);

  // View States
  const [discoveryTab, setDiscoveryTab] = useState<DiscoveryTab>('details');
  const [trainingTab, setTrainingTab] = useState<'learn' | 'inspire' | 'expert'>('learn');

  // Forum Post State
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Academics' });
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Chat States
  const [generalChat, setGeneralChat] = useState<ChatMessage[]>([]);
  const [interviewChat, setInterviewChat] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!process.env.API_KEY) setApiKeyMissing(true);
    const checkUser = async () => {
      try {
        // The authService.loginSuccess() function returns the user object directly, or null.
        const currentUser = await AuthService.loginSuccess();
        
        // If a user object is returned, set it in the state.
        if (currentUser) {
          setUser(currentUser);
          // Synchronize the profile state with the authenticated user's name.
          setProfile(prev => ({ ...prev, name: currentUser.displayName }));
        }
      } catch (error) {
        console.error("Failed to check user session:", error);
      }
    };
    checkUser();
  }, []);

  // Reset training tab when navigating away
  useEffect(() => {
    if (view !== AppView.TRAINING) {
        setTrainingTab('learn');
    }
  }, [view]);

  const handleGeneralChat = async (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
      setGeneralChat(prev => [...prev, userMsg]);
      setIsTyping(true);
      const response = await Gemini.getGeminiChatResponse(generalChat, text, profile);
      setIsTyping(false);
      setGeneralChat(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response, timestamp: new Date() }]);
  };

  const handleAnalysis = async () => {
      setIsTyping(true);
      const result = await Gemini.analyzeProfile(profile);
      setProfile({ ...profile, aiAnalysis: result });
      setIsTyping(false);
  };

  const handleReadinessAssessment = async () => {
      setIsTyping(true);
      const result = await Gemini.assessReadiness(profile);
      setReadiness(result);
      setIsTyping(false);
  };

  const handleComparison = async (c1: string, c2: string) => {
      setView(AppView.DISCOVERY); // Switch to chat view
      handleGeneralChat(`Compare ${c1} and ${c2} for me.`);
  };

  const handleRoadmapGen = async () => {
      setIsTyping(true);
      const data = await Gemini.generateRoadmap(profile);
      if (data && data.milestones) {
          setRoadmap(data.milestones.map((m: any, i: number) => ({ ...m, id: i.toString(), status: 'pending', date: m.timeline })));
      }
      setIsTyping(false);
  };

  const handleConsultationRequest = () => {
      setTrainingTab('expert');
      setView(AppView.TRAINING);
  };

  const handleScholarshipSearch = async () => {
      setIsTyping(true);
      const newScholarships = await Gemini.findScholarships(profile);
      if (newScholarships.length > 0) {
          setScholarships(newScholarships);
      }
      setIsTyping(false);
  };

  const handleInterviewMsg = async (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
      setInterviewChat(prev => [...prev, userMsg]);
      setIsTyping(true);
      const response = await Gemini.getInterviewQuestion(interviewChat, profile);
      setIsTyping(false);
      setInterviewChat(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response, timestamp: new Date() }]);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPost.title.trim() || !newPost.content.trim() || !user) return;
      
      const post: ForumPost = {
          id: Date.now().toString(),
          author: user.displayName,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          likes: 0,
          timestamp: new Date(),
          replies: []
      };

      setPosts(prev => [post, ...prev]);
      setIsPosting(false);
      setNewPost({ title: '', content: '', category: 'Academics' });

      try {
        // AI Auto-Reply
        const reply = await Gemini.replyToForumPost(post.title, post.content);
        setPosts(current => current.map(p => p.id === post.id ? { ...p, aiReply: reply } : p));
      } catch (err) {
        console.error("AI reply failed", err);
      }
  };

  const handleSubmitReply = (postId: string) => {
    if (!replyContent.trim() || !user) return;
    const reply: ForumReply = {
        id: Date.now().toString(),
        author: user.displayName,
        content: replyContent,
        timestamp: new Date()
    };
    
    setPosts(posts.map(p => {
        if (p.id === postId) {
            return { ...p, replies: [...p.replies, reply] };
        }
        return p;
    }));
    
    setActiveReplyId(null);
    setReplyContent('');
  };

  if (apiKeyMissing) return <div className="p-10 text-center text-red-600 font-bold">API Key Missing</div>;

  if (!user) {
      return <LandingView onLogin={AuthService.googleLogin} />;
  }

  return (
    <Layout 
      currentView={view} 
      onChangeView={setView} 
      userRole={role} 
      onToggleRole={() => setRole(r => r === UserRole.STUDENT ? UserRole.ADMIN : UserRole.STUDENT)}
      onLogout={AuthService.logout}
    >
       {view === AppView.DASHBOARD && (
           <div className="h-full flex flex-col">
               <div className="p-4 bg-white border-b sticky top-0 z-10 flex justify-between items-center">
                   <div>
                        <h2 className="text-2xl font-bold text-indigo-900">Hello, {user?.displayName?.split(' ')[0] || 'Explorer'}</h2>
                        <p className="text-gray-500 text-sm">
                            Welcome! Your admissions journey starts here.
                        </p>
                   </div>
                   <button 
                        onClick={AuthService.logout}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-red-200 transition-colors"
                   >
                       Logout
                   </button>
               </div>
               <div className="flex-1 overflow-y-auto">
                   {/* Quick Actions */}
                   <div className="p-4 grid grid-cols-2 gap-3">
                       <button onClick={() => setView(AppView.PLANNING)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                           <span className="text-2xl">🗺️</span>
                           <h3 className="font-bold text-sm mt-2">Roadmap</h3>
                           <p className="text-xs text-gray-500">2 pending tasks</p>
                       </button>
                       <button onClick={() => setView(AppView.APPLICATIONS)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                           <span className="text-2xl">✍️</span>
                           <h3 className="font-bold text-sm mt-2">Essays</h3>
                           <p className="text-xs text-gray-500">Continue draft</p>
                       </button>
                       
                        {/* Readiness Card */}
                       <button 
                            onClick={() => { setView(AppView.DISCOVERY); setDiscoveryTab('readiness'); setGeneralChat([]); }}
                            className={`p-4 rounded-xl border shadow-sm text-left ${readiness ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-white border-gray-100'}`}
                       >
                           <span className="text-2xl">🎯</span>
                           <h3 className="font-bold text-sm mt-2">{readiness ? 'Readiness Score' : 'Check Readiness'}</h3>
                           {readiness ? (
                               <div className="flex items-end gap-1 mt-1">
                                    <span className={`text-2xl font-bold ${readiness.overallScore > 80 ? 'text-green-400' : 'text-white'}`}>{readiness.overallScore}</span>
                                    <span className="text-xs text-indigo-300 mb-1">/100</span>
                               </div>
                           ) : (
                               <p className="text-xs text-gray-500">AI Assessment</p>
                           )}
                       </button>

                       <button onClick={() => setView(AppView.SCHOLARSHIPS)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left flex flex-col justify-center">
                           <span className="text-2xl mb-2">💰</span>
                           <h3 className="font-bold text-sm">Scholarships</h3>
                           <p className="text-xs text-gray-500">Find money</p>
                       </button>
                   </div>
                   
                   {/* Community Feed */}
                   <div className="p-4">
                       <div className="flex justify-between items-center mb-3">
                           <h3 className="font-bold text-gray-800">Community Discussions</h3>
                           <button onClick={() => setIsPosting(!isPosting)} className="text-indigo-600 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-full">
                               {isPosting ? 'Cancel' : '+ New Post'}
                           </button>
                       </div>

                       {isPosting && (
                           <form onSubmit={handleCreatePost} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 mb-4 space-y-3">
                               <input 
                                    className="w-full text-sm font-bold border-b border-gray-200 pb-2 focus:outline-none focus:border-indigo-500"
                                    placeholder="Topic Title"
                                    value={newPost.title}
                                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    {['Academics', 'Essays', 'Campus Life'].map(cat => (
                                        <button 
                                            key={cat} type="button" 
                                            onClick={() => setNewPost({...newPost, category: cat})}
                                            className={`text-[10px] px-2 py-1 rounded-full border ${newPost.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-500 border-gray-200'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    className="w-full text-xs p-2 bg-gray-50 rounded-lg focus:outline-none"
                                    rows={3}
                                    placeholder="What's on your mind?"
                                    value={newPost.content}
                                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newPost.title.trim() || !newPost.content.trim()}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Post Question
                                </button>
                           </form>
                       )}

                       <div className="space-y-3">
                           {posts.map(post => (
                               <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                   <div className="flex justify-between mb-1">
                                       <span className="text-xs font-bold text-indigo-600">{post.category}</span>
                                       <span className="text-xs text-gray-400">{post.timestamp.toLocaleDateString()}</span>
                                   </div>
                                   <h4 className="font-bold text-sm text-gray-900">{post.title}</h4>
                                   <p className="text-xs text-gray-600 mt-1">{post.content}</p>
                                   
                                   {post.aiReply && (
                                       <div className="mt-3 bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <span className="text-4xl">🎓</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">AI</div>
                                                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Counselor Response</span>
                                            </div>
                                            <p className="text-xs text-indigo-900 italic leading-relaxed relative z-10">"{post.aiReply}"</p>
                                       </div>
                                   )}
                                   
                                   {/* User Replies */}
                                    {post.replies && post.replies.length > 0 && (
                                        <div className="mt-3 space-y-2 border-t border-gray-100 pt-2 pl-2">
                                            {post.replies.map(reply => (
                                                <div key={reply.id} className="text-xs bg-gray-50 p-2 rounded">
                                                    <span className="font-bold text-gray-700">{reply.author}: </span>
                                                    <span className="text-gray-600">{reply.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                   <div className="mt-2 flex gap-3 text-xs text-gray-400 items-center">
                                       <span>❤️ {post.likes}</span>
                                       <button onClick={() => setActiveReplyId(activeReplyId === post.id ? null : post.id)} className="hover:text-indigo-600 flex items-center gap-1">
                                           💬 Reply ({post.replies ? post.replies.length : 0})
                                       </button>
                                   </div>

                                   {/* Reply Input */}
                                   {activeReplyId === post.id && (
                                       <div className="mt-3 flex gap-2">
                                           <input 
                                               type="text" 
                                               value={replyContent}
                                               onChange={(e) => setReplyContent(e.target.value)}
                                               placeholder="Write a reply..."
                                               className="flex-1 text-xs border border-gray-200 rounded px-2 py-2 focus:outline-none focus:border-indigo-500"
                                               autoFocus
                                           />
                                           <button 
                                               onClick={() => handleSubmitReply(post.id)}
                                               className="bg-indigo-600 text-white text-xs px-3 py-1 rounded font-bold"
                                           >
                                               Send
                                           </button>
                                       </div>
                                   )}
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           </div>
       )}

       {view === AppView.DISCOVERY && (
            generalChat.length > 0 ? (
                <div className="flex flex-col h-full">
                    <div className="bg-white p-2 flex justify-between items-center border-b">
                         <button onClick={() => setGeneralChat([])} className="text-xs text-indigo-600 font-bold px-3">← Back to Profile</button>
                         <span className="text-xs font-bold text-gray-500">Counselor Chat</span>
                    </div>
                    <ChatInterface messages={generalChat} onSendMessage={handleGeneralChat} isTyping={isTyping} />
                </div>
            ) : (
                <DiscoveryView 
                    profile={profile} 
                    setProfile={setProfile} 
                    onAnalyze={handleAnalysis} 
                    analysis={profile.aiAnalysis} 
                    readiness={readiness}
                    onAssessReadiness={handleReadinessAssessment}
                    isTyping={isTyping}
                    activeTab={discoveryTab}
                    setActiveTab={setDiscoveryTab}
                />
            )
       )}

       {view === AppView.COLLEGES && (
           <CollegeFinderView 
               colleges={colleges} 
               onCompare={handleComparison}
               onChat={(msg) => { setView(AppView.DISCOVERY); handleGeneralChat(msg); }}
            />
       )}

       {view === AppView.SCHOLARSHIPS && (
           <ScholarshipView 
               scholarships={scholarships}
               onFindMore={handleScholarshipSearch}
               isTyping={isTyping}
           />
       )}

       {view === AppView.APPLICATIONS && (
           <ApplicationView 
               essays={essays} 
               setEssays={setEssays}
               onCritique={Gemini.critiqueEssay}
               onBrainstorm={(prompt) => { setView(AppView.DISCOVERY); handleGeneralChat(`Help me brainstorm for this essay prompt: "${prompt}"`); }}
               onFindPrompts={Gemini.findEssayPrompts}
           />
       )}

       {view === AppView.PLANNING && (
           <PlanningView 
               roadmap={roadmap} 
               setRoadmap={setRoadmap}
               onGenerate={handleRoadmapGen} 
               isTyping={isTyping} 
               onRequestConsultation={handleConsultationRequest}
           />
       )}

       {view === AppView.TRAINING && (
           <TrainingView resources={MOCK_TRAINING} initialTab={trainingTab} />
       )}

       {view === AppView.INTERVIEW && (
           <div className="flex flex-col h-full bg-slate-100">
               <div className="p-4 bg-indigo-900 text-white shadow-md">
                   <h2 className="font-bold">Mock Interview</h2>
                   <p className="text-xs text-indigo-200">Simulating admission officer for {profile.dreamColleges[0]}</p>
               </div>
               {interviewChat.length === 0 ? (
                   <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                       <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm mb-6">🎙️</div>
                       <h3 className="text-xl font-bold text-gray-800 mb-2">Practice Makes Perfect</h3>
                       <p className="text-sm text-gray-500 mb-8">I will ask you behavioral and resume-based questions. Treat this like the real thing.</p>
                       <button onClick={() => handleInterviewMsg("Hello, I'm ready.")} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">Start Session</button>
                   </div>
               ) : (
                   <ChatInterface messages={interviewChat} onSendMessage={handleInterviewMsg} isTyping={isTyping} placeholder="Type your answer..." />
               )}
           </div>
       )}

       {view === AppView.ADMIN && (
           <div className="p-4 text-center text-gray-500">
               <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Console</h2>
               <div className="bg-white p-6 rounded-xl border border-gray-200">
                   <p>System Configuration & User Management</p>
                   <p className="text-xs mt-2">(Restricted Access)</p>
               </div>
           </div>
       )}
    </Layout>
  );
};

export default App;
