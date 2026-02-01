
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Zap, BookOpen, ClipboardList, Info, ChevronRight, X, RefreshCw, Globe, Database, Loader2, ExternalLink, Filter, Table as TableIcon, LayoutGrid } from 'lucide-react';
import { SEARCH_ENGINES, EMERGENCY_DRUGS, CLINICAL_SCALES, FULL_DRUG_DATABASE } from '../constants';
import { EmergencyDrug, ClinicalScale } from '../types';
import { GoogleGenAI } from "@google/genai";

const ToolboxTab: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'search' | 'pump' | 'reference' | 'scales'>('search');
  
  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [browserMode, setBrowserMode] = useState<'dxy' | 'baike'>('dxy');
  const [loadProgress, setLoadProgress] = useState(0);

  // 内嵌浏览器状态
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  
  // 微泵模块 (Excel 风格)
  const [selectedDrug, setSelectedDrug] = useState<EmergencyDrug>(EMERGENCY_DRUGS[0]);
  const [doseAmount, setDoseAmount] = useState(String(EMERGENCY_DRUGS[0].defaultAmount));
  const [fluidMl, setFluidMl] = useState(String(EMERGENCY_DRUGS[0].defaultVolume));
  const [speedMlh, setSpeedMlh] = useState(String(EMERGENCY_DRUGS[0].defaultSpeed));
  const [weightKg, setWeightKg] = useState('60');

  // 量表状态
  const [selectedScale, setSelectedScale] = useState<ClinicalScale | null>(null);
  const [scaleAnswers, setScaleAnswers] = useState<Record<number, number>>({});

  // 药品搜索逻辑 - 权威直通车
  const handleDrugSearch = (mode: 'dxy' | 'baike') => {
    if (!searchQuery.trim()) {
      window.alert('请输入药品名称');
      return;
    }

    setBrowserMode(mode);
    setLoadProgress(10);
    
    const encoded = encodeURIComponent(searchQuery);
    const url = mode === 'dxy' 
      ? `https://drugs.dxy.cn/pc/search?keyword=${encoded}`
      : `https://baike.baidu.com/item/${encoded}`;
    
    setBrowserUrl(url);
    setShowBrowser(true);
    
    // 模拟进度条
    const timer = setInterval(() => {
      setLoadProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 400);
    setTimeout(() => {
      clearInterval(timer);
      setLoadProgress(100);
      setTimeout(() => setLoadProgress(0), 1000);
    }, 1500);
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      handleDrugSearch('dxy');
      return;
    }
    setIsSearching(true);
    setAiResult("");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `医学专家助手。请详细检索关于"${searchQuery}"的医学信息。如果是药品，请列出用法用量、配伍禁忌、注意事项；如果是疾病，请列出最新诊疗要点。`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      setAiResult(response.text);
    } catch (error) {
      setAiResult("检索异常，请尝试点击下方‘搜药品’进行权威查询。");
    } finally {
      setIsSearching(false);
    }
  };

  const pumpResults = useMemo(() => {
    const rawAmount = parseFloat(doseAmount) || 0;
    const mlTotal = parseFloat(fluidMl) || 1;
    const speed = parseFloat(speedMlh) || 0;
    const weight = parseFloat(weightKg) || 1;

    const mgPerHour = speed * (rawAmount / mlTotal);
    const mgPerMin = mgPerHour / 60;
    const ugPerHour = mgPerHour * 1000;
    const ugPerMin = ugPerHour / 60;
    const ugPerMinKg = ugPerMin / weight;

    return {
      mgPerHour: mgPerHour.toFixed(2),
      mgPerMin: mgPerMin.toFixed(2),
      ugPerHour: Math.round(ugPerHour),
      ugPerMin: Math.round(ugPerMin),
      ugPerMinKg: ugPerMinKg.toFixed(2)
    };
  }, [doseAmount, fluidMl, speedMlh, weightKg, selectedDrug]);

  return (
    <div className="space-y-6 relative min-h-[700px]">
      {/* 底部风格导航 */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: 'search', label: '权威直通车', icon: Search, color: 'bg-blue-500' },
          { id: 'pump', label: '微量泵', icon: Zap, color: 'bg-amber-500' },
          { id: 'scales', label: '临床量表', icon: ClipboardList, color: 'bg-indigo-500' },
          { id: 'reference', label: '药品全库', icon: BookOpen, color: 'bg-emerald-500' },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveTool(item.id as any); setShowBrowser(false); }} className={`flex flex-col items-center gap-1.5 p-3 rounded-3xl transition-all ${activeTool === item.id ? 'bg-white shadow-sm border border-slate-100' : 'opacity-40'}`}>
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg`}><item.icon size={18} /></div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[48px] shadow-sm border border-slate-100 min-h-[500px]">
        {activeTool === 'search' && !showBrowser && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">权威医药数据直通车</h3>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => { window.location.href = 'dxyer://drugs'; }}
                  className="text-[9px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
                >
                  <ExternalLink size={10}/> 用药助手 App
                </button>
              </div>
            </div>

            {/* 搜索框与权威搜索按钮 */}
            <div className="space-y-3">
              <div className="relative">
                <input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="请输入药品名称（如：布洛芬）..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-slate-800 pr-14 outline-none focus:ring-2 focus:ring-sky-500 transition-all font-bold" 
                  onKeyDown={(e) => e.key === 'Enter' && handleDrugSearch('dxy')} 
                />
                <button 
                  onClick={handleAISearch}
                  className="absolute right-5 top-3.5 text-sky-500 p-1.5 hover:bg-sky-50 rounded-xl transition-all"
                >
                  {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleDrugSearch('dxy')}
                  className="bg-sky-500 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-sky-100 flex items-center justify-center gap-2 hover:bg-sky-600 transition-all"
                >
                  <Search size={18} /> 搜丁香园
                </button>
                <button 
                  onClick={() => handleDrugSearch('baike')}
                  className="bg-white border-2 border-slate-100 text-slate-700 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <BookOpen size={18} /> 搜百度医典
                </button>
              </div>
            </div>

            {/* 提示与聚合链接 */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex items-start gap-3">
               <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
               <p className="text-[10px] text-amber-600 font-bold leading-relaxed">
                 搜索提示：如果您输入的是商品名（如：芬必得），建议尝试搜索通用名（如：布洛芬）以获得更准的结果。
               </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
               {SEARCH_ENGINES.slice(2).map(engine => (
                 <button 
                   key={engine.name} 
                   onClick={() => { setBrowserUrl(`${engine.url}${encodeURIComponent(searchQuery)}`); setShowBrowser(true); }} 
                   className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 hover:text-sky-600 hover:bg-white transition-all shadow-sm"
                 >
                   {engine.name}
                 </button>
               ))}
            </div>

            <div className="space-y-4 pt-4">
              {aiResult ? (
                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 animate-in fade-in duration-500 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-sky-500"><Database size={16}/><span className="text-xs font-black uppercase">AI 智能分析</span></div>
                  <div className="prose prose-sm max-w-none text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{aiResult}</div>
                </div>
              ) : (
                <div className="p-10 text-center opacity-10"><Zap size={48} className="mx-auto mb-2"/><p className="text-xs font-black uppercase tracking-widest">输入药品即刻获得权威诊疗建议</p></div>
              )}
            </div>
          </div>
        )}

        {showBrowser && (
          <div className="fixed inset-0 z-50 bg-slate-900 md:relative md:inset-auto md:h-[650px] animate-in slide-in-from-bottom duration-300 flex flex-col overflow-hidden rounded-[48px] shadow-2xl">
            {/* 浏览器顶部 Tab 切换 */}
            <div className="bg-white px-6 pt-4 pb-2 border-b border-slate-100">
               <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setShowBrowser(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={20} className="text-slate-400" /></button>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button 
                      onClick={() => handleDrugSearch('dxy')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${browserMode === 'dxy' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      丁香园
                    </button>
                    <button 
                      onClick={() => handleDrugSearch('baike')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${browserMode === 'baike' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      百度医典
                    </button>
                  </div>
                  <button onClick={() => setBrowserUrl(browserUrl)} className="p-2 hover:bg-slate-50 rounded-full"><RefreshCw size={18} className="text-slate-400" /></button>
               </div>
               {/* 进度条 */}
               {loadProgress > 0 && (
                 <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-500 transition-all duration-300 ease-out"
                      style={{ width: `${loadProgress}%` }}
                    />
                 </div>
               )}
            </div>
            
            <div className="relative flex-1 bg-white">
               {/* 提示：由于同源策略，无法通过 iframe JS 直接清理第三方网站 UI，建议通过用户自行滚动查看 */}
               <iframe 
                src={browserUrl} 
                className="w-full h-full border-none" 
                title="Drug Viewer"
              />
            </div>
          </div>
        )}

        {/* 其余 Tool 内容保持完全不变 */}
        {activeTool === 'pump' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">微量泵 Excel 级工作站</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase">
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div> 黄色区域填写数据
              </div>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-3xl shadow-md bg-white">
              <table className="w-full text-[12px] border-collapse">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-5 py-3.5 bg-slate-50 font-black text-slate-500 w-1/2">选择药物</td>
                    <td className="px-5 py-3.5">
                      <select 
                        className="w-full bg-transparent outline-none font-black text-slate-800"
                        value={selectedDrug.name}
                        onChange={e => {
                          const d = EMERGENCY_DRUGS.find(x => x.name === e.target.value);
                          if(d) {
                            setSelectedDrug(d);
                            setDoseAmount(String(d.defaultAmount));
                            setFluidMl(String(d.defaultVolume));
                            setSpeedMlh(String(d.defaultSpeed));
                          }
                        }}
                      >
                        {EMERGENCY_DRUGS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-5 py-3.5 bg-slate-50 font-black text-slate-500">药物规格</td>
                    <td className="px-5 py-3.5 font-bold text-slate-400">{selectedDrug.spec}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-5 py-3.5 bg-slate-50 font-black text-slate-500">溶剂类型</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        {['NS', 'GS'].map(s => (
                          <button 
                            key={s} 
                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${selectedDrug.solvent.includes(s) ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 opacity-50'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                  {/* 输入项（黄色背景） */}
                  <tr className="border-b border-slate-100">
                    <td className="px-5 py-3.5 bg-slate-50 font-black text-slate-500">剂量 ({selectedDrug.amountUnit})</td>
                    <td className="px-0 py-0"><input type="number" value={doseAmount} onChange={e => setDoseAmount(e.target.value)} className="w-full h-full px-5 py-3.5 bg-yellow-400/90 font-black text-slate-900 outline-none" /></td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-5 py-3.5 bg-slate-50 font-black text-slate-500">液体量 ml</td>
                    <td className="px-0 py-0"><input type="number" value={fluidMl} onChange={e => setFluidMl(e.target.value)} className="w-full h-full px-5 py-3.5 bg-yellow-400/90 font-black text-slate-900 outline-none" /></td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-5 py-3.5 bg-slate-50 font-black text-slate-500">走速 (ml/h)</td>
                    <td className="px-0 py-0"><input type="number" value={speedMlh} onChange={e => setSpeedMlh(e.target.value)} className="w-full h-full px-5 py-3.5 bg-yellow-400/90 font-black text-slate-900 outline-none" /></td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-5 py-3.5 bg-slate-50 font-black text-slate-500">体重 (kg)</td>
                    <td className="px-0 py-0"><input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} className="w-full h-full px-5 py-3.5 bg-yellow-400/90 font-black text-slate-900 outline-none" /></td>
                  </tr>
                  {/* 计算结果项 */}
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="px-5 py-3.5 font-black text-slate-500">药物速度 ({selectedDrug.amountUnit === 'U' ? 'U/h' : 'mg/h'})</td>
                    <td className="px-5 py-3.5 font-black text-slate-800 text-right">{pumpResults.mgPerHour}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="px-5 py-3.5 font-black text-slate-500">药物速度 ({selectedDrug.amountUnit === 'U' ? 'U/min' : 'mg/min'})</td>
                    <td className="px-5 py-3.5 font-black text-slate-800 text-right">{pumpResults.mgPerMin}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="px-5 py-3.5 font-black text-slate-500">药物速度 (ug/h)</td>
                    <td className="px-5 py-3.5 font-black text-slate-800 text-right">{pumpResults.ugPerHour}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <td className="px-5 py-3.5 font-black text-slate-500">药物速度 (ug/min)</td>
                    <td className="px-5 py-3.5 font-black text-slate-800 text-right">{pumpResults.ugPerMin}</td>
                  </tr>
                  <tr className="bg-sky-50/40">
                    <td className="px-5 py-4 font-black text-sky-600">每公斤体重 (ug/min*kg)</td>
                    <td className="px-5 py-4 font-black text-sky-700 text-right text-lg">{pumpResults.ugPerMinKg}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 药品指引卡片 - 增强版 */}
            <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-4 shadow-lg">
               <div className="flex items-center gap-2 text-amber-400">
                 <Info size={14}/>
                 <span className="text-[10px] font-black uppercase tracking-widest">临床参考指南</span>
               </div>
               
               <div className="grid gap-4">
                 <div className="space-y-1.5">
                   <div className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-1.5">
                     <span className="w-1 h-3 bg-amber-500 rounded-full"></span> 适应证
                   </div>
                   <p className="text-[11px] font-medium leading-relaxed text-slate-200">{selectedDrug.indications}</p>
                 </div>
                 
                 <div className="space-y-1.5 pt-3 border-t border-white/5">
                   <div className="text-[9px] font-black text-sky-400 uppercase flex items-center gap-1.5">
                     <span className="w-1 h-3 bg-sky-400 rounded-full"></span> 推荐用法用量 (参考范围)
                   </div>
                   <p className="text-[11px] font-bold text-slate-100 leading-relaxed">{selectedDrug.range}</p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTool === 'reference' && (
          <div className="space-y-5 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center"><h3 className="text-xl font-black text-slate-800">51种急救药全表 (Excel 版)</h3><Filter size={18} className="text-slate-300"/></div>
             <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white">
                <div className="overflow-x-auto max-h-[70vh] select-text">
                   <table className="w-full text-[9px] border-collapse min-w-[1200px]">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-slate-100 text-slate-600 font-black uppercase border-b border-slate-200">
                          <th className="px-2 py-3 text-center border-r border-slate-200 w-12">编号</th>
                          <th className="px-4 py-3 text-left border-r border-slate-200 w-48">药物名称及某商品名</th>
                          <th className="px-3 py-3 text-left border-r border-slate-200 w-24">规格（仅展示1种）</th>
                          <th className="px-3 py-3 text-left border-r border-slate-200 w-24">药物用量 m_药</th>
                          <th className="px-3 py-3 text-left border-r border-slate-200 w-24">溶剂及用量</th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 w-24">溶液走速 v_液</th>
                          <th className="px-4 py-3 text-left border-r border-slate-200 w-48">药物速度 R_药 及推荐 R_药 范围</th>
                          <th className="px-4 py-3 text-left">常见适应证</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {FULL_DRUG_DATABASE.map((d, i) => (
                          <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-sky-50 transition-colors whitespace-pre-wrap`}>
                            <td className="px-2 py-3 text-center text-slate-500 border-r border-slate-100 font-bold">{d.id}</td>
                            {d.isFullText ? (
                              <td colSpan={6} className="px-4 py-3 font-bold text-slate-900 border-r border-slate-100 bg-amber-50/20 italic leading-relaxed">
                                {d.name}
                              </td>
                            ) : (
                              <>
                                <td className="px-4 py-3 font-black text-slate-900 border-r border-slate-100">{d.name}</td>
                                <td className="px-3 py-3 text-slate-600 border-r border-slate-100">{d.spec}</td>
                                <td className="px-3 py-3 text-slate-600 border-r border-slate-100">{d.dose}</td>
                                <td className="px-3 py-3 text-slate-600 border-r border-slate-100 font-bold">{d.solvent}</td>
                                <td className="px-3 py-3 text-center text-sky-600 border-r border-slate-100 font-black">{d.speed}</td>
                                <td className="px-4 py-3 text-indigo-600 border-r border-slate-100 font-bold">{d.range}</td>
                              </>
                            )}
                            <td className="px-4 py-3 text-slate-500 text-[8px] leading-tight">{d.indications}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTool === 'scales' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             {!selectedScale ? (
               <div className="grid gap-4">
                 {CLINICAL_SCALES.map(s => (
                   <button key={s.id} onClick={() => setSelectedScale(s)} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 text-left hover:border-indigo-500 transition-all flex justify-between items-center group">
                      <div><h4 className="font-black text-slate-800">{s.name}</h4><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{s.dept}</p></div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                   </button>
                 ))}
               </div>
             ) : (
               <div className="space-y-8 animate-in slide-in-from-bottom duration-300">
                 <button onClick={() => {setSelectedScale(null); setScaleAnswers({});}} className="text-slate-400 font-black text-[10px] uppercase flex items-center gap-2">← 返回列表</button>
                 <h3 className="text-2xl font-black text-slate-800">{selectedScale.name}</h3>
                 <div className="space-y-6">
                    {selectedScale.items.map((item, idx) => (
                      <div key={idx} className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</label>
                        <div className="grid gap-2">
                          {item.options.map(opt => (
                            <button key={opt.label} onClick={() => setScaleAnswers(p => ({...p, [idx]: opt.score}))} className={`w-full p-4 rounded-2xl border-2 font-bold text-sm text-left transition-all ${scaleAnswers[idx] === opt.score ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                               {opt.label} <span className="float-right">({opt.score}分)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="p-8 bg-indigo-600 rounded-[40px] text-white text-center shadow-xl">
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2">评分诊断结果</p>
                    <div className="text-6xl font-black mb-4">{Object.values(scaleAnswers).reduce((a: number, b: number) => a + b, 0)}</div>
                    <p className="font-bold text-lg">{selectedScale.interpretation(Object.values(scaleAnswers).reduce((a: number, b: number) => a + b, 0))}</p>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolboxTab;
