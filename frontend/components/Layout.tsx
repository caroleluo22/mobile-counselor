import React from 'react';
import { AppView, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, userRole, onToggleRole, onLogout }) => {
  const studentNav = [
    { id: AppView.DASHBOARD, label: 'Home', icon: '🏠' },
    { id: AppView.DISCOVERY, label: 'Me', icon: '👤' },
    { id: AppView.COLLEGES, label: 'Find', icon: '🏛️' },
    { id: AppView.SCHOLARSHIPS, label: 'Money', icon: '💰' },
    { id: AppView.APPLICATIONS, label: 'Essays', icon: '✍️' },
    { id: AppView.PLANNING, label: 'Plan', icon: '🗺️' },
    { id: AppView.TRAINING, label: 'Resources', icon: '📚' },
  ];

  const adminNav = [
    { id: AppView.ADMIN, label: 'Admin', icon: '⚡' },
    { id: AppView.DASHBOARD, label: 'Feed', icon: '💬' },
  ];

  const navItems = userRole === UserRole.ADMIN ? adminNav : studentNav;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="flex-none bg-indigo-900 text-white p-4 pt-safe-top shadow-md flex justify-between items-center z-20">
        <div>
           <h1 className="text-lg font-bold tracking-wide flex items-center gap-2">
             <span className="text-2xl">🎓</span> AdmissionAI
           </h1>
        </div>
        <div className="flex items-center gap-3">
          {userRole === UserRole.STUDENT && (
             <button 
               onClick={() => onChangeView(AppView.INTERVIEW)}
               className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded-full text-xs font-semibold transition"
             >
               🎙️ Mock Interview
             </button>
          )}
          <button 
            onClick={onToggleRole}
            className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center text-xs border border-indigo-600"
            aria-label="Toggle Role"
          >
            {userRole === UserRole.STUDENT ? 'S' : 'A'}
          </button>
          <button 
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center text-xs border border-red-600"
            aria-label="Logout"
          >
            Off
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50 pb-20">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="flex-none bg-white border-t border-slate-200 fixed bottom-0 w-full pb-safe-bottom z-30 shadow-lg overflow-x-auto no-scrollbar">
        <div className="flex justify-between px-2 items-center h-16 min-w-[350px]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center min-w-[14%] h-full space-y-1 active:scale-95 transition-transform ${
                currentView === item.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;