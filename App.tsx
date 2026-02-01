
import React, { useState } from 'react';
import Layout from './components/Layout';
import CalculatorTab from './components/CalculatorTab';
import ToolboxTab from './components/ToolboxTab';
import { TabType } from './types';
import { ShieldCheck, HeartPulse, Globe, Terminal, FileCode } from 'lucide-react';

const InfoTab: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="bg-white p-10 rounded-[48px] shadow-sm text-center flex flex-col items-center border border-slate-50">
      <div className="w-24 h-24 bg-sky-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-sky-100 mb-8 animate-pulse">
        <HeartPulse size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">医学助手 v2.5</h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Professional Medical Companion</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 space-y-4">
        <div className="flex items-center gap-3 text-red-500">
           <ShieldCheck size={24} />
           <h4 className="font-black text-slate-800">临床免责声明</h4>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          本软件为计算辅助工具，计算公式基于公开医疗指南。临床使用时应结合患者实际情况、化验室结果、官方药品说明书进行综合判断。开发者不对因使用本软件导致的医疗差错承担责任。
        </p>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl text-white space-y-6">
        <div className="flex items-center gap-3 text-sky-400">
           <Globe size={24} />
           <h4 className="font-black">应用部署教程</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-4">
             <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0 font-black text-xs">1</div>
             <div>
                <p className="text-xs font-black mb-1">部署到 Vercel (推荐)</p>
                <p className="text-[10px] text-slate-400">将代码上传至 GitHub，在 Vercel 官网点击 "Import Project"，几秒钟即可获得全球加速的 HTTPS 链接。</p>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 font-black text-xs">2</div>
             <div>
                <p className="text-xs font-black mb-1">GitHub Pages</p>
                <p className="text-[10px] text-slate-400">在仓库设置中启用 Pages，使用 "Github Actions" 模式，会自动将构建后的代码发布到专属域名。</p>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-black text-xs">3</div>
             <div>
                <p className="text-xs font-black mb-1">单文件 HTML</p>
                <p className="text-[10px] text-slate-400">使用构建工具运行 `npm run build`。由于本应用是前端驱动，生成的 `index.html` 及相关 `assets` 可以直接离线在任何浏览器打开。</p>
             </div>
          </div>
        </div>
        
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
           <Terminal size={18} className="text-sky-300" />
           <code className="text-[10px] font-mono text-sky-100">npm run build && vercel deploy</code>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'calculator' && <CalculatorTab />}
      {activeTab === 'toolbox' && <ToolboxTab />}
      {activeTab === 'info' && <InfoTab />}
    </Layout>
  );
};

export default App;
