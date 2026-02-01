
import React from 'react';
import { Calculator, Briefcase, Info, HeartPulse } from 'lucide-react';
import { TabType } from '../types';
import { MEDICAL_BLUE } from '../constants';

interface LayoutProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="flex flex-col min-h-screen max-w-5xl mx-auto bg-slate-50 relative">
      {/* Header - Desktop Wide, Mobile Sticky */}
      <header className="bg-white px-6 pt-10 pb-6 shadow-sm z-10 sticky top-0 md:static">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-100">
              <HeartPulse size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">医学助手</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:block">Clinical Support System</p>
            </div>
          </div>
          
          {/* Desktop Nav Tabs */}
          <div className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl gap-2">
            {[
              { id: 'calculator', label: '计算器', icon: Calculator },
              { id: 'toolbox', label: '工具箱', icon: Briefcase },
              { id: 'info', label: '关于', icon: Info },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === tab.id ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 px-4 py-6 md:px-8 print:p-0">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
        
        <div className="mt-12 mb-20 px-6 py-4 bg-red-50/50 rounded-3xl border border-red-100 flex items-start gap-3 print:hidden">
          <div className="p-1 bg-red-100 rounded text-red-500 mt-0.5"><Info size={14} /></div>
          <p className="text-[11px] text-red-600/70 leading-relaxed font-bold">
            ⚠️ 法律声明：本应用仅供医疗卫生专业人士作为临床辅助参考。计算结果受多种临床变量影响，严禁作为单一诊疗依据，实际操作必须严格遵循线下临床指南与药品说明书。
          </p>
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-100 flex justify-around py-4 px-6 z-20 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] backdrop-blur-md bg-white/90">
        <button 
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'calculator' ? 'text-sky-500 scale-110' : 'text-slate-300'}`}
        >
          <Calculator size={22} strokeWidth={activeTab === 'calculator' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase">计算器</span>
        </button>
        <button 
          onClick={() => setActiveTab('toolbox')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'toolbox' ? 'text-sky-500 scale-110' : 'text-slate-300'}`}
        >
          <Briefcase size={22} strokeWidth={activeTab === 'toolbox' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase">工具箱</span>
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'info' ? 'text-sky-500 scale-110' : 'text-slate-300'}`}
        >
          <Info size={22} strokeWidth={activeTab === 'info' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase">指南</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
