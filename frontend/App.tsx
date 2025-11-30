
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import { AppView, UserRole, StudentProfile, ChatMessage, College, Essay, RoadmapItem, ForumPost, TrainingResource, Scholarship, ForumReply, ReadinessAssessment, SampleProfile, HumanCounselor, User } from './types';
import { INITIAL_PROFILE, MOCK_COLLEGES, MOCK_FORUM_POSTS, MOCK_TRAINING, MOCK_SCHOLARSHIPS, MOCK_SAMPLE_PROFILES, MOCK_COUNSELORS } from './constants';
import * as Gemini from './services/geminiService';
import * as AuthService from './services/authService';
import * as RoadmapService from './services/roadmapService';
import * as ReadinessService from './services/readinessService';
import * as ProfileService from './services/profileService';
import * as EssayService from './services/essayService';
import * as PostService from './services/postService';

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

import { renderMarkdownToHtml } from './utils/markdown';

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
    onSaveProfile: () => void;
    onResetProfile: () => void;
    profileSaving: boolean;
    profileLoading: boolean;
    onAnalyze: () => void;
    analysis: string | undefined;
    readiness: ReadinessAssessment | null;
    onAssessReadiness: () => void;
    isTyping: boolean;
    readinessLoading: boolean;
    activeTab: DiscoveryTab;
    setActiveTab: (tab: DiscoveryTab) => void;
    targetUniversity: string;
    setTargetUniversity: (uni: string) => void;
}> = ({ profile, setProfile, onSaveProfile, onResetProfile, profileSaving, profileLoading, onAnalyze, analysis, readiness, onAssessReadiness, isTyping, readinessLoading, activeTab, setActiveTab, targetUniversity, setTargetUniversity }) => {
    
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
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={onResetProfile}
                            disabled={profileLoading}
                            className="text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50"
                        >
                            {profileLoading ? 'Resetting...' : 'Reset'}
                        </button>
                        <button 
                            onClick={onSaveProfile}
                            disabled={profileSaving}
                            className="text-xs font-bold px-3 py-2 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {profileSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
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
                            <div
                                className="text-gray-700"
                                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(analysis) }}
                            ></div>
                            <button onClick={onAnalyze} className="mt-6 text-indigo-600 text-xs font-bold uppercase tracking-wide">Re-Analyze</button>
                        </div>
                    )}
                </div>
            ) : (
                // Readiness Tab
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                    <div className="text-center mt-10">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Are you ready for your dream school?</h3>
                        <p className="text-gray-500 mb-4 text-sm px-4">Get a quantitative score based on your profile against a target university.</p>
                        <div className="max-w-xs mx-auto mb-6">
                            <input 
                                className="w-full text-center text-sm border border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:border-indigo-500"
                                placeholder="Enter Target University (e.g., MIT)"
                                value={targetUniversity}
                                onChange={(e) => setTargetUniversity(e.target.value)}
                            />
                        </div>
                        <button onClick={onAssessReadiness} disabled={readinessLoading || !targetUniversity} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-xl active:scale-95 transition-transform disabled:bg-indigo-300 disabled:cursor-not-allowed">
                            {readinessLoading ? 'Calculating...' : 'Check My Readiness'}
                        </button>
                    </div>
                    {readiness && (
                        <div className="space-y-6 pb-20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700">Readiness Assessment</h3>
                                    <p className="text-xs text-gray-500">Latest AI snapshot of your profile</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"></div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Overall Readiness</h3>
                                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-indigo-50 bg-white mb-2 relative">
                                    <span className={`text-4xl font-extrabold ${readiness.overallScore >= 80 ? 'text-green-600' : readiness.overallScore >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                                        {readiness.overallScore}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">Target: {readiness.targetUniversity || 'N/A'}</p>
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
    onSearch: (criteria: string) => void;
    loading: boolean;
}> = ({ colleges, onCompare, onChat, onSearch, loading }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [query, setQuery] = useState('');

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
            
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-4 flex gap-2">
                <input 
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500" 
                    placeholder="e.g., Top CS schools in California with good AI research" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                    onClick={() => onSearch(query)} 
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white ${loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} transition`}
                >
                    {loading ? 'Finding...' : 'Find'}
                </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pb-20">
                {colleges.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No universities yet. Try a search!</div>
                ) : colleges.map(c => (
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
    onFindMore: (criteria: string) => void;
    isTyping: boolean;
}> = ({ scholarships, onFindMore, isTyping }) => {
    const [query, setQuery] = useState('');

    return (
        <div className="flex flex-col h-full p-4 bg-slate-50">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Scholarship Matcher</h2>
                <div className="flex gap-2 items-center">
                    <input 
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                        placeholder="e.g., STEM scholarships, women in CS"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button 
                        onClick={() => onFindMore(query)} 
                        disabled={isTyping}
                        className="bg-green-600 text-white px-4 py-2 text-xs rounded-full font-bold flex items-center gap-1 shadow-md active:scale-95 transition disabled:bg-green-300"
                    >
                        {isTyping ? 'Scanning...' : '🔎 Find'}
                    </button>
                </div>
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
    onBrainstorm: (prompt: string, essayId?: string) => void;
    onSampleEssay: (prompt: string) => Promise<string>;
    onFindPrompts: (college: string) => Promise<string[]>;
    resumeEssayId: string | null;
    onResumeApplied: () => void;
    essaySampleLoading: boolean;
    onCreateEssay: (collegeName: string, prompt: string) => Promise<void>;
    onUpdateEssay: (id: string, updates: Partial<Essay>) => Promise<void>;
    onDeleteEssay: (id: string) => Promise<void>;
    loading: boolean;
}> = ({ essays, setEssays, onCritique, onBrainstorm, onFindPrompts, onSampleEssay, resumeEssayId, onResumeApplied, essaySampleLoading, onCreateEssay, onUpdateEssay, onDeleteEssay, loading }) => {
    const [activeEssayId, setActiveEssayId] = useState<string | null>(null);
    const [loadingCritique, setLoadingCritique] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [creating, setCreating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    // Create New Essay State
    const [isCreating, setIsCreating] = useState(false);
    const [newCollege, setNewCollege] = useState('');
    const [newPrompt, setNewPrompt] = useState('');
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [loadingPrompts, setLoadingPrompts] = useState(false);

    const activeEssay = essays.find(e => e.id === activeEssayId);
    
    useEffect(() => {
        if (resumeEssayId) {
            setActiveEssayId(resumeEssayId);
            setIsCreating(false);
            onResumeApplied();
        }
    }, [resumeEssayId]);

    const handleCritique = async () => {
        if (!activeEssay) return;
        setLoadingCritique(true);
        const feedback = await onCritique(activeEssay.prompt, activeEssay.content);
        setEssays(essays.map(e => e.id === activeEssayId ? { ...e, aiFeedback: feedback } : e));
        await onUpdateEssay(activeEssayId!, { aiFeedback: feedback, content: activeEssay.content });
        setLoadingCritique(false);
    };

    const handleManualSave = async () => {
        if (!activeEssay) return;
        try {
            setSaving(true);
            await onUpdateEssay(activeEssayId!, {
                content: activeEssay.content,
                prompt: activeEssay.prompt,
                collegeName: activeEssay.collegeName,
            });
            setLastSaved(new Date());
        } finally {
            setSaving(false);
        }
    };

    const handleEssayDictation = (text: string) => {
        if(!activeEssay) return;
        const newContent = activeEssay.content + (activeEssay.content ? ' ' : '') + text;
        setEssays(essays.map(essay => essay.id === activeEssayId ? {...essay, content: newContent} : essay));
        onUpdateEssay(activeEssayId!, { content: newContent });
    };

    const handleFindPrompts = async () => {
        if (!newCollege) return;
        setLoadingPrompts(true);
        const prompts = await onFindPrompts(newCollege);
        setSuggestedPrompts(prompts);
        setLoadingPrompts(false);
    };

    const handleCreateEssay = async () => {
        if (!newCollege || !newPrompt) return;
        try {
            setCreating(true);
            await onCreateEssay(newCollege, newPrompt);
            setIsCreating(false);
            setNewCollege('');
            setNewPrompt('');
            setSuggestedPrompts([]);
        } catch (e) {
            console.error('Failed to create essay', e);
        } finally {
            setCreating(false);
        }
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
                        disabled={!newCollege || !newPrompt || creating}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {creating ? 'Adding...' : 'Add to Prompt List'}
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
                    <div className="flex gap-2 items-center">
                        <button 
                            onClick={async () => {
                                if (window.confirm('Delete this draft?')) {
                                    await onDeleteEssay(activeEssayId!);
                                    setActiveEssayId(null);
                                }
                            }} 
                            className="text-xs text-red-500 font-bold px-3 py-1 rounded-full border border-red-200"
                        >
                            Delete
                        </button>
                        <button 
                            onClick={() => setShowPreview(p => !p)} 
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${showPreview ? 'bg-indigo-600 text-white border-indigo-600' : 'text-indigo-600 border-indigo-200'}`}
                        >
                            {showPreview ? 'Edit' : 'Preview'}
                        </button>
                        <button 
                            onClick={handleManualSave} 
                            disabled={saving} 
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${saving ? 'bg-gray-200 text-gray-500' : 'text-green-700 border-green-300'}`}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        {lastSaved && (
                            <span className="text-[10px] text-gray-400">Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <button onClick={handleCritique} disabled={loadingCritique} className="text-indigo-600 text-sm font-bold">
                            {loadingCritique ? 'Thinking...' : 'Critique'}
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-b">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Prompt</p>
                    <p className="text-sm text-gray-800 italic">{activeEssay.prompt}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <button onClick={() => onBrainstorm(activeEssay.prompt, activeEssay.id)} className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                            ✨ Brainstorm Ideas with AI
                        </button>
                            <button 
                                onClick={async () => {
                                    const sample = await onSampleEssay(activeEssay.prompt);
                                    setEssays(essays.map(e => e.id === activeEssayId ? { ...e, content: sample } : e));
                                    onUpdateEssay(activeEssayId!, { content: sample });
                                }} 
                                disabled={essaySampleLoading}
                                className={`text-xs font-bold flex items-center gap-1 ${essaySampleLoading ? 'text-green-300' : 'text-green-600'}`}
                            >
                                {essaySampleLoading ? '⌛ Generating...' : '📄 Sample Essay'}
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative">
                    {showPreview ? (
                        <div className="h-full overflow-y-auto p-4 prose prose-sm max-w-none bg-white">
                            <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(activeEssay.content) }} />
                        </div>
                    ) : (
                        <>
                            <textarea 
                                className="w-full h-full p-4 resize-none focus:outline-none text-base leading-relaxed pb-16"
                                placeholder="Start writing with markdown..."
                                value={activeEssay.content}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEssays(essays.map(essay => essay.id === activeEssayId ? {...essay, content: val} : essay));
                                    onUpdateEssay(activeEssayId!, { content: val });
                                }}
                            />
                            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                                <span className="text-[10px] text-gray-400 bg-white/80 px-2 rounded">Voice Note</span>
                                <DictationButton 
                                    onTranscript={handleEssayDictation}
                                    className="p-4 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 border-none"
                                />
                            </div>
                        </>
                    )}
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
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Application Hub</h2>
                {loading && <span className="text-xs text-gray-500">Loading...</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-indigo-800">{essays.length}</div>
                    <div className="text-xs text-indigo-600">Drafts</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-800">{essays.filter(e => e.content).length}</div>
                    <div className="text-xs text-green-600">Started</div>
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
    onAddTask: (task: { title: string; description?: string; date?: string; category?: RoadmapItem['category']; status?: RoadmapItem['status']; }) => Promise<void>;
    onUpdateTask: (id: string, updates: Partial<RoadmapItem>) => Promise<void>;
    onDeleteTask: (id: string) => Promise<void>;
    onToggleStatus: (id: string) => Promise<void>;
    onRequestConsultation: () => void;
    isLoading: boolean;
    roadmapQuery: string;
    setRoadmapQuery: (query: string) => void;
}> = ({ roadmap, onGenerate, isTyping, onAddTask, onUpdateTask, onDeleteTask, onToggleStatus, onRequestConsultation, isLoading, roadmapQuery, setRoadmapQuery }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempItem, setTempItem] = useState<Partial<RoadmapItem>>({});
    
    // Add Item State
    const [newItem, setNewItem] = useState<Partial<RoadmapItem>>({ title: '', description: '', date: '', category: 'application' });

    const handleToggleStatus = async (id: string) => {
        try {
            await onToggleStatus(id);
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm("Delete this task?")) {
            try {
                await onDeleteTask(id);
            } catch (err) {
                console.error('Failed to delete task', err);
            }
        }
    };

    const handleStartEdit = (item: RoadmapItem) => {
        setEditingId(item.id);
        setTempItem({...item});
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        const updates: Partial<RoadmapItem> = {};
        if (tempItem.title !== undefined) updates.title = tempItem.title;
        if (tempItem.description !== undefined) updates.description = tempItem.description;
        if (tempItem.date !== undefined) updates.date = tempItem.date;
        if (tempItem.category !== undefined) updates.category = tempItem.category as RoadmapItem['category'];

        try {
            await onUpdateTask(editingId, updates);
            setEditingId(null);
        } catch (err) {
            console.error('Failed to update task', err);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.title) return;
        try {
            await onAddTask({
                title: newItem.title,
                description: newItem.description || '',
                date: newItem.date || 'TBD',
                category: (newItem.category as any) || 'application',
                status: 'pending'
            });
            setNewItem({ title: '', description: '', date: '', category: 'application' });
            setIsAdding(false);
        } catch (err) {
            console.error('Failed to add task', err);
        }
    };

    return (
        <div className="p-4 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Strategy Roadmap</h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsAdding(!isAdding)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-bold shadow-sm">
                        {isAdding ? 'Cancel' : '+ Add Task'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-2">
                <input 
                    className="flex-1 text-sm border-gray-200 rounded-lg px-3 py-2 focus:outline-none" 
                    placeholder="e.g., Plan for early admission to UPenn" 
                    value={roadmapQuery}
                    onChange={(e) => setRoadmapQuery(e.target.value)}
                />
                <button onClick={onGenerate} disabled={isTyping || !roadmapQuery} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold disabled:bg-indigo-300">
                    {isTyping ? 'Generating...' : 'Generate Plan'}
                </button>
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

            {isLoading ? (
                <div className="text-center mt-20 text-gray-500">Loading your roadmap...</div>
            ) : roadmap.length === 0 ? (
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
const TrainingView: React.FC<{ resources: TrainingResource[]; sampleProfiles: SampleProfile[]; initialTab?: 'learn' | 'inspire' | 'expert'; profile: StudentProfile; user: User | null }> = ({ resources, sampleProfiles, initialTab = 'learn', profile, user }) => {
    const [tab, setTab] = useState<'learn' | 'inspire' | 'expert'>(initialTab);
    const [selectedProfile, setSelectedProfile] = useState<SampleProfile | null>(null);
    const [successStories, setSuccessStories] = useState<SampleProfile[]>(sampleProfiles);
    const [bookingCounselor, setBookingCounselor] = useState<HumanCounselor | null>(null);
    const [bookingStep, setBookingStep] = useState<'select' | 'success'>('select');
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [bookingTopic, setBookingTopic] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [selectedResource, setSelectedResource] = useState<TrainingResource | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [storySearchTerm, setStorySearchTerm] = useState('');
    const [storySearching, setStorySearching] = useState(false);
    const [filteredResources, setFilteredResources] = useState<TrainingResource[]>(resources);
    const [hasSearched, setHasSearched] = useState(false);
    const [searching, setSearching] = useState(false);

    const applyResourceFilter = (term: string, list: TrainingResource[] = resources) => {
        const q = term.toLowerCase().trim();
        if (!q) {
            setFilteredResources(list);
            return;
        }
        setFilteredResources(
            list.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.provider.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q)
            )
        );
    };

    useEffect(() => {
        if (!hasSearched) {
            setFilteredResources(resources || []);
        }
        // This effect runs when resources change, ensuring the initial list is populated.
    }, [resources]);

    useEffect(() => {
        setSuccessStories(sampleProfiles || []);
    }, [sampleProfiles]);

    // Reset flow when modal closes
    const closeBooking = () => {
        setBookingCounselor(null);
        setBookingStep('select');
        setSelectedSlot('');
        setBookingTopic('');
        setIsBooking(false);
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
                                <textarea 
                                    className="w-full text-sm p-3 bg-gray-50 border rounded-lg focus:outline-none" 
                                    rows={2} 
                                    placeholder="Essay review, Mock interview..." 
                                    value={bookingTopic}
                                    onChange={(e) => setBookingTopic(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={async () => {
                                    if (!selectedSlot || !user) return;
                                    setIsBooking(true);
                                    try {
                                        const response = await fetch('/api/bookings', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            credentials: 'include',
                                            body: JSON.stringify({ student: { name: user.displayName, email: user.email }, counselor: bookingCounselor, slot: selectedSlot, topic: bookingTopic }),
                                        });
                                        if (!response.ok) throw new Error('Booking request failed');
                                        setBookingStep('success');
                                    } catch (error) {
                                        console.error('Failed to send booking email:', error);
                                        alert('There was an error sending your booking request. Please try again.');
                                    } finally {
                                        setIsBooking(false);
                                    }
                                }}
                                disabled={!selectedSlot || isBooking}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isBooking ? 'Sending Request...' : 'Confirm Booking'}
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
                        <div className="flex gap-2 items-center mb-2">
                            <input 
                                value={searchTerm}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchTerm(val);
                                    if (!val.trim()) applyResourceFilter('');
                                }}
                                placeholder="Search courses (e.g., AI, essay writing, SAT)"
                                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                            />
                            <button 
                                onClick={async () => {
                                    setHasSearched(true);
                                    if (!searchTerm.trim()) {
                                        applyResourceFilter('');
                                        return;
                                    }
                                    setSearching(true);
                                    const aiResources = await Gemini.findTrainingResources(profile, searchTerm);
                                    if (aiResources.length > 0) {
                                        setFilteredResources(aiResources as TrainingResource[]);
                                    } else {
                                        // Fallback to local search if AI returns nothing
                                        applyResourceFilter(searchTerm);
                                    }
                                    setSearching(false);
                                }}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                                disabled={searching}
                            >
                                {searching ? 'Finding...' : 'Find'}
                            </button>
                        </div>
                        <div className="mb-4 text-xs text-gray-500 uppercase font-bold tracking-wider">Recommended Courses</div>
                        {filteredResources.length === 0 && hasSearched && !searching ? (
                            <div className="text-sm text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl p-4 text-center">
                                No matches yet. Try another keyword.
                            </div>
                        ) : filteredResources.map(res => (
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
                        <div className="flex gap-2 items-center">
                            <button 
                                onClick={async () => {
                                    setStorySearching(true);
                                    const stories = await Gemini.findSuccessStories('top universities', profile);
                                    setSuccessStories(stories as SampleProfile[]);
                                    setStorySearching(false);
                                }}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                                disabled={storySearching}
                            >
                                {storySearching ? 'Finding...' : 'Find'}
                            </button>
                        </div>
                        <div className="mb-2 text-xs text-gray-500 uppercase font-bold tracking-wider">Historical Admitted Profiles</div>
                        {storySearching ? (
                            <div className="text-sm text-gray-500 text-center p-4">Searching for stories...</div>
                        ) : successStories.length === 0 ? (
                            <div className="text-sm text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl p-4 text-center">
                                No success stories found. Try a different search.
                            </div>
                        ) : successStories.map(profile => (
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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessAssessment | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>(MOCK_COLLEGES);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapQuery, setRoadmapQuery] = useState('');
  const [scholarships, setScholarships] = useState<Scholarship[]>(MOCK_SCHOLARSHIPS);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [assistantChat, setAssistantChat] = useState<ChatMessage[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [essaySampleLoading, setEssaySampleLoading] = useState(false);
  const [essaysLoading, setEssaysLoading] = useState(false);

  // View States
  const [discoveryTab, setDiscoveryTab] = useState<DiscoveryTab>('details');
  const [readinessTargetUniversity, setReadinessTargetUniversity] = useState('');
  const [trainingTab, setTrainingTab] = useState<'learn' | 'inspire' | 'expert'>('learn');

  // Forum Post State
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Academics' });
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Chat States
  const [generalChat, setGeneralChat] = useState<ChatMessage[]>([]);
  const [interviewChat, setInterviewChat] = useState<ChatMessage[]>([]);
  const [chatReturnView, setChatReturnView] = useState<AppView | null>(null);
  const [chatReturnEssayId, setChatReturnEssayId] = useState<string | null>(null);
  const [resumeEssayId, setResumeEssayId] = useState<string | null>(null);

  useEffect(() => {
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

  useEffect(() => {
    const loadReadiness = async () => {
      if (!user) {
        setReadiness(null);
        return;
      }
      try {
          const data = await ReadinessService.fetchReadiness();
          setReadiness(data);
      } catch (error) {
          console.error('Failed to load readiness', error);
          setReadiness(null);
      }
    };
    loadReadiness();
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        setProfileLoading(true);
        const data = await ProfileService.fetchProfile();
        if (data) {
          setProfile(data);
        } else {
          setProfile({ ...INITIAL_PROFILE, name: user.displayName });
        }
      } catch (error) {
        console.error('Failed to load profile', error);
        setProfile(prev => ({ ...prev, name: user.displayName }));
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    const loadRoadmap = async () => {
      if (!user) return;
      try {
        setRoadmapLoading(true);
        const tasks = await RoadmapService.fetchRoadmap();
        setRoadmap(tasks);
      } catch (error) {
        console.error('Failed to load roadmap', error);
      } finally {
        setRoadmapLoading(false);
      }
    };

    loadRoadmap();
  }, [user]);

  useEffect(() => {
    const loadEssays = async () => {
      if (!user) return;
      try {
        setEssaysLoading(true);
        const data = await EssayService.fetchEssays();
        setEssays(data);
      } catch (error) {
        console.error('Failed to load essays', error);
      } finally {
        setEssaysLoading(false);
      }
    };
    loadEssays();
  }, [user]);

  const loadPosts = async (page: number) => {
    setPostsLoading(true);
    try {
      const { posts: newPosts, hasMore } = await PostService.fetchPosts(page);
      setPosts(prev => page === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMorePosts(hasMore);
    } catch (error) {
      console.error('Failed to load posts', error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load of posts
    loadPosts(1);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Reset training tab when navigating away
  useEffect(() => {
    if (view !== AppView.TRAINING) {
        setTrainingTab('learn');
    }
  }, [view]);

  const generalChatRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    generalChatRef.current = generalChat;
  }, [generalChat]);

  const handleGeneralChat = async (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
      const history = [...generalChatRef.current, userMsg];
      setGeneralChat(history);
      setIsTyping(true);
      const response = await Gemini.getGeminiChatResponse(history.slice(0, -1), text, profile);
      setIsTyping(false);
      const modelMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: response, timestamp: new Date() };
      setGeneralChat(prev => [...prev, modelMsg]);
  };

  const handleAnalysis = async () => {
      setIsTyping(true);
      const result = await Gemini.analyzeProfile(profile);
      setProfile(prev => ({ ...prev, aiAnalysis: result }));
      setIsTyping(false);
  };

  const handleReadinessAssessment = async () => {
      setIsTyping(true);
      setReadinessLoading(true);
      const result = await Gemini.assessReadiness(profile, readinessTargetUniversity);
      try {
          const saved = await ReadinessService.saveReadiness(result);
          setReadiness({ ...saved, targetUniversity: readinessTargetUniversity });
      } catch (error) {
          console.error('Failed to save readiness', error);
          setReadiness(result);
      }
      setIsTyping(false);
      setReadinessLoading(false);
  };

  const handleSaveProfile = async () => {
      if (!user) return;
      try {
          setProfileSaving(true);
          const saved = await ProfileService.saveProfile(profile);
          setProfile(saved);
      } catch (error) {
          console.error('Failed to save profile', error);
      } finally {
          setProfileSaving(false);
      }
  };

  const handleResetProfile = async () => {
      if (!user) return;
      try {
          setProfileLoading(true);
          await ProfileService.deleteProfile();
          setProfile({ ...INITIAL_PROFILE, name: user.displayName });
      } catch (error) {
          console.error('Failed to reset profile', error);
      } finally {
          setProfileLoading(false);
      }
  };

  const handleComparison = async (c1: string, c2: string) => {
      launchCounselorChat(`Compare ${c1} and ${c2} for me.`, AppView.COLLEGES);
  };

  const handleRoadmapGen = async () => {
      setIsTyping(true);
      const data = await Gemini.generateRoadmap(profile, roadmapQuery);
      if (data && data.milestones) {
          const generated: RoadmapItem[] = data.milestones.map((m: any, i: number) => ({
              id: `gen-${Date.now()}-${i}`,
              title: m.title || m.milestone || `Task ${i + 1}`,
              description: m.description || '',
              status: 'pending',
              date: m.timeline || 'TBD',
              category: 'application',
          }));

          try {
              const saved = await RoadmapService.replaceTasks(generated);
              setRoadmap(saved);
          } catch (err) {
              console.error('Failed to save generated roadmap', err);
              setRoadmap(generated);
          }
      }
      setIsTyping(false);
  };

  const handleCreateRoadmapTask = async (task: { title: string; description?: string; date?: string; category?: RoadmapItem['category']; status?: RoadmapItem['status']; }) => {
      const created = await RoadmapService.createTask(task);
      setRoadmap(prev => [...prev, created]);
  };

  const handleUpdateRoadmapTask = async (id: string, updates: Partial<RoadmapItem>) => {
      const updated = await RoadmapService.updateTask(id, updates);
      setRoadmap(prev => prev.map(item => item.id === id ? updated : item));
  };

  const handleDeleteRoadmapTask = async (id: string) => {
      await RoadmapService.deleteTask(id);
      setRoadmap(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleRoadmapStatus = async (id: string) => {
      const current = roadmap.find(item => item.id === id);
      if (!current) return;
      const nextStatus: RoadmapItem['status'] = current.status === 'completed' ? 'pending' : 'completed';
      const updated = await RoadmapService.updateTask(id, { status: nextStatus });
      setRoadmap(prev => prev.map(item => item.id === id ? updated : item));
  };

  const handleConsultationRequest = () => {
      setTrainingTab('expert');
      setView(AppView.TRAINING);
  };

  const handleScholarshipSearch = async (criteria: string) => {
      setIsTyping(true);
      const newScholarships = await Gemini.findScholarships(profile, criteria);
      if (newScholarships.length > 0) {
          setScholarships(newScholarships);
      }
      setIsTyping(false);
  };

  const handleCollegeSearch = async (criteria: string) => {
      setCollegeLoading(true);
      try {
          const results = await Gemini.findColleges(profile, criteria);
          if (results.length > 0) {
              setColleges(results);
          }
      } catch (error) {
          console.error('College search failed', error);
      } finally {
          setCollegeLoading(false);
      }
  };

  const launchCounselorChat = (message: string, returnView: AppView, essayId?: string) => {
      setChatReturnView(returnView);
      setChatReturnEssayId(essayId || null);
      setGeneralChat([]);
      setView(AppView.DISCOVERY);
      handleGeneralChat(message);
  };

  const handleSampleEssay = async (prompt: string): Promise<string> => {
      if (essaySampleLoading) return '';
      try {
          setEssaySampleLoading(true);
          const sample = await Gemini.generateSampleEssay(prompt, profile);
          return sample;
      } catch (error) {
          console.error('Sample essay generation failed', error);
          return 'Could not generate a sample essay at this time.';
      } finally {
          setEssaySampleLoading(false);
      }
  };

  const handleCreateEssayServer = async (collegeName: string, prompt: string) => {
      const created = await EssayService.createEssay({ collegeName, prompt, content: '' });
      setEssays(prev => [...prev, created]);
  };

  const handleUpdateEssayServer = async (id: string, updates: Partial<Essay>) => {
      const updated = await EssayService.updateEssay(id, updates);
      setEssays(prev => prev.map(e => e.id === id ? updated : e));
  };

  const handleDeleteEssayServer = async (id: string) => {
      await EssayService.deleteEssay(id);
      setEssays(prev => prev.filter(e => e.id !== id));
  };

  const handleExitCounselorChat = () => {
      setGeneralChat([]);
      if (chatReturnView) {
          if (chatReturnView === AppView.APPLICATIONS && chatReturnEssayId) {
              setResumeEssayId(chatReturnEssayId);
          }
          setView(chatReturnView);
      } else {
          setView(AppView.DISCOVERY);
      }
      setChatReturnView(null);
      setChatReturnEssayId(null);
  };

  const handleInterviewMsg = async (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
      setInterviewChat(prev => [...prev, userMsg]);
      setIsTyping(true);
      const response = await Gemini.getInterviewQuestion(interviewChat, profile);
      setIsTyping(false);
      setInterviewChat(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response, timestamp: new Date() }]);
  };

  const handleAssistantChat = async (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
      setAssistantChat(prev => [...prev, userMsg]);
      setAssistantTyping(true);
      const response = await Gemini.getGeminiChatResponse(assistantChat, text, profile, 'You are a real-time admissions assistant. Keep responses concise and actionable.');
      setAssistantTyping(false);
      setAssistantChat(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response, timestamp: new Date() }]);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPost.title.trim() || !newPost.content.trim()) return;
      try {
        const createdPost = await PostService.createPost({ title: newPost.title, content: newPost.content, category: newPost.category });
        setPosts(prev => [createdPost, ...prev]);
        setIsPosting(false);
        setNewPost({ title: '', content: '', category: 'Academics' });

        // AI Auto-Reply
        const aiReply = await Gemini.replyToForumPost(createdPost.title, createdPost.content);
        const updatedPost = await PostService.updateWithAIReply(createdPost.id, aiReply);
        setPosts(current => current.map(p => p.id === updatedPost.id ? updatedPost : p));
      } catch (err) {
        console.error("Failed to create post or get AI reply", err);
      }
  };

  const handleSubmitReply = async (postId: string) => {
    if (!replyContent.trim() || !user) return;
    try {
        const updatedPost = await PostService.addReply(postId, replyContent);
        setPosts(posts.map(p => p.id === postId ? updatedPost : p));
        setActiveReplyId(null);
        setReplyContent('');
    } catch (error) {
        console.error('Failed to submit reply', error);
    }
  };

  if (apiKeyMissing) return <div className="p-10 text-center text-red-600 font-bold">API Key Missing</div>;

  if (!user) {
      return <LandingView onLogin={AuthService.googleLogin} />;
  }

  // Determine if the current user is the true administrator.
  const isTrueAdmin = user?.role === UserRole.ADMIN;

  return (
    <Layout 
      currentView={view} 
      onChangeView={setView} 
      userRole={role} 
      isTrueAdmin={isTrueAdmin}
      // The S/A toggle function is only passed if the user is a true admin.
      onToggleRole={isTrueAdmin ? () => setRole(r => r === UserRole.STUDENT ? UserRole.ADMIN : UserRole.STUDENT) : undefined}
      onLogout={AuthService.logout}
    >
      {/* Floating AI assistant toggle */}
      <div className="fixed bottom-24 right-4 z-40 space-y-2">
        {assistantOpen && (
          <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-indigo-600 text-white flex justify-between items-center">
              <span className="text-xs font-bold">AI Assistant</span>
              <button onClick={() => setAssistantOpen(false)} className="text-white text-xs">✕</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface 
                messages={assistantChat} 
                onSendMessage={handleAssistantChat} 
                isTyping={assistantTyping} 
                placeholder="Ask anything in real-time..."
              />
            </div>
          </div>
        )}
        <button 
          onClick={() => setAssistantOpen(open => !open)} 
          className="w-14 h-14 rounded-full shadow-xl bg-indigo-600 text-white text-2xl flex items-center justify-center hover:bg-indigo-700 transition"
          title="Chat with AI"
        >
          {assistantOpen ? '−' : '💬'}
        </button>
      </div>

       {view === AppView.DASHBOARD && (
           <div className="h-full flex flex-col">
               <div className="p-4 bg-white border-b sticky top-0 z-10 flex justify-between items-center">
                   <div>
                        <h2 className="text-2xl font-bold text-indigo-900">Hello, {user?.displayName?.split(' ')[0] || 'Explorer'}</h2>
                        <p className="text-gray-500 text-sm">
                            Welcome! Your admissions journey starts here.
                        </p>
                   </div>
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

                           {hasMorePosts && (
                               <div className="mt-6 text-center">
                                   <button
                                       onClick={() => {
                                           const nextPage = postPage + 1;
                                           setPostPage(nextPage);
                                           loadPosts(nextPage);
                                       }}
                                       disabled={postsLoading}
                                       className="bg-white text-indigo-600 px-6 py-2 rounded-full text-xs font-bold border border-gray-200 shadow-sm hover:bg-indigo-50 disabled:opacity-50"
                                   >{postsLoading ? 'Loading...' : 'Load More'}</button>
                               </div>
                           )}
                       </div>
                   </div>
               </div>
           </div>
       )}

       {view === AppView.DISCOVERY && (
            generalChat.length > 0 ? (
                <div className="flex flex-col h-full">
                    <div className="bg-white p-2 flex justify-between items-center border-b">
                         <button onClick={handleExitCounselorChat} className="text-xs text-indigo-600 font-bold px-3">← Back</button>
                         <span className="text-xs font-bold text-gray-500">Counselor Chat</span>
                    </div>
                    <ChatInterface messages={generalChat} onSendMessage={handleGeneralChat} isTyping={isTyping} />
                </div>
            ) : (
                <DiscoveryView 
                    profile={profile} 
                    setProfile={setProfile} 
                    onSaveProfile={handleSaveProfile}
                    onResetProfile={handleResetProfile}
                    profileSaving={profileSaving}
                    profileLoading={profileLoading}
                    onAnalyze={handleAnalysis} 
                    analysis={profile.aiAnalysis} 
                    readiness={readiness}
                    onAssessReadiness={handleReadinessAssessment}
                    isTyping={isTyping}
                    readinessLoading={readinessLoading}
                    activeTab={discoveryTab}
                    setActiveTab={setDiscoveryTab}
                    targetUniversity={readinessTargetUniversity}
                    setTargetUniversity={setReadinessTargetUniversity}
                />
            )
       )}

       {view === AppView.COLLEGES && (
           <CollegeFinderView 
               colleges={colleges} 
               onCompare={handleComparison}
               onChat={(msg) => { launchCounselorChat(msg, AppView.COLLEGES); }}
               onSearch={handleCollegeSearch}
               loading={collegeLoading}
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
               onBrainstorm={(prompt, essayId) => { launchCounselorChat(`Help me brainstorm for this essay prompt: "${prompt}"`, AppView.APPLICATIONS, essayId); }}
               onFindPrompts={Gemini.findEssayPrompts}
               onSampleEssay={handleSampleEssay}
               resumeEssayId={resumeEssayId}
               onResumeApplied={() => setResumeEssayId(null)}
               essaySampleLoading={essaySampleLoading}
               onCreateEssay={handleCreateEssayServer}
               onUpdateEssay={handleUpdateEssayServer}
               onDeleteEssay={handleDeleteEssayServer}
               loading={essaysLoading}
            />
       )}

       {view === AppView.PLANNING && (
           <PlanningView 
               roadmap={roadmap} 
               onGenerate={handleRoadmapGen} 
               isTyping={isTyping} 
               onAddTask={handleCreateRoadmapTask}
               onUpdateTask={handleUpdateRoadmapTask}
               onDeleteTask={handleDeleteRoadmapTask}
               onToggleStatus={handleToggleRoadmapStatus}
               onRequestConsultation={handleConsultationRequest}
               isLoading={roadmapLoading}
               roadmapQuery={roadmapQuery}
               setRoadmapQuery={setRoadmapQuery}
           />
       )}

       {view === AppView.TRAINING && (
           <TrainingView resources={MOCK_TRAINING} sampleProfiles={MOCK_SAMPLE_PROFILES} initialTab={trainingTab} profile={profile} user={user} />
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
           role === UserRole.ADMIN ? (
               <div className="p-4 text-center text-gray-500">
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Console</h2>
                   <div className="bg-white p-6 rounded-xl border border-gray-200">
                       <p>System Configuration & User Management</p>
                       <p className="text-xs mt-2">(Restricted Access)</p>
                   </div>
               </div>
           ) : null
       )}
    </Layout>
  );
};

export default App;
