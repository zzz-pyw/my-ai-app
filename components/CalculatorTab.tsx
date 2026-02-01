
import React, { useState, useMemo } from 'react';
import { Gender } from '../types';
import { calculateCCr, calculateEGFR, calculateKCorrection, calculateNaDeficit, calculateBurnFluids } from '../utils/formulas';
import { RefreshCw, Info, ChevronRight, Droplets, Baby, User, Flame, Activity, Table as TableIcon } from 'lucide-react';
import { RENAL_STAGES } from '../constants';

const InputField = ({ label, value, onChange, unit, subLabel, yellow }: { label: string, value: string, onChange: (v: string) => void, unit?: string, subLabel?: string, yellow?: boolean }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1.5">
      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      {subLabel && <span className="text-[9px] text-slate-300 font-bold">{subLabel}</span>}
    </div>
    <div className="relative">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-2xl py-3.5 px-5 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all font-black text-lg ${yellow ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}
        placeholder="0.00"
      />
      {unit && <span className="absolute right-5 top-4 text-slate-400 text-sm font-black">{unit}</span>}
    </div>
  </div>
);

const CalculatorTab: React.FC = () => {
  const [activeSub, setActiveSub] = useState<'renal' | 'electrolyte' | 'peds' | 'adult' | 'burn'>('renal');
  const [age, setAge] = useState('65');
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [cr, setCr] = useState('100');
  const [isUmol, setIsUmol] = useState(true);

  // 电解质
  const [kCurrent, setKCurrent] = useState('3.2');
  const [kTarget, setKTarget] = useState('4.0');
  const [naCurrent, setNaCurrent] = useState('125');
  const [naTarget, setNaTarget] = useState('140');

  // 烧伤
  const [tbsa, setTbsa] = useState('30');

  // 儿童
  const [pedsDegree, setPedsDegree] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [pedsNature, setPedsNature] = useState<'isotonic' | 'hypotonic' | 'hypertonic'>('isotonic');

  const ccr = calculateCCr(Number(age), Number(weight), Number(cr), gender, isUmol);
  const egfr = calculateEGFR(Number(age), Number(cr), gender, isUmol);
  const kDef = calculateKCorrection(Number(kCurrent), Number(kTarget), Number(weight));
  const naDef = calculateNaDeficit(Number(naCurrent), Number(naTarget), Number(weight), gender);
  const burn = calculateBurnFluids(Number(weight), Number(tbsa));

  const currentStage = useMemo(() => {
    if (egfr >= 90) return RENAL_STAGES[0];
    if (egfr >= 60) return RENAL_STAGES[1];
    if (egfr >= 45) return RENAL_STAGES[2];
    if (egfr >= 30) return RENAL_STAGES[3];
    if (egfr >= 15) return RENAL_STAGES[4];
    return RENAL_STAGES[5];
  }, [egfr]);

  return (
    <div className="flex flex-col gap-6">
      {/* 顶级滑动导航 */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-[24px] shadow-inner overflow-x-auto hide-scrollbar sticky top-0 z-30 backdrop-blur-md">
        {[
          { id: 'renal', label: '肾功能' },
          { id: 'electrolyte', label: '电解质' },
          { id: 'peds', label: '儿科补液' },
          { id: 'adult', label: '外科补液' },
          { id: 'burn', label: '烧伤补液' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveSub(tab.id as any)}
            className={`shrink-0 px-6 py-3 text-[10px] font-black rounded-[18px] transition-all uppercase tracking-tighter ${activeSub === tab.id ? 'bg-white text-sky-600 shadow-md scale-[1.05]' : 'text-slate-500 opacity-60'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[48px] shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 gap-5 mb-8">
           <InputField label="年龄" value={age} onChange={setAge} unit="岁" />
           <InputField label="体重" value={weight} onChange={setWeight} unit="kg" yellow />
        </div>

        {activeSub === 'renal' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative">
              <InputField label="血肌酐 (Scr)" value={cr} onChange={setCr} unit={isUmol ? "umol/L" : "mg/dL"} />
              <button onClick={() => setIsUmol(!isUmol)} className="absolute right-24 top-0.5 text-[9px] text-sky-500 font-black flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100"><RefreshCw size={10} /> 切换</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">CCr (肌酐清除率)</p>
                <div className="text-3xl font-black text-slate-800">{ccr} <span className="text-xs text-slate-300">ml/min</span></div>
              </div>
              <div className="p-6 bg-sky-500 rounded-[32px] text-white shadow-lg shadow-sky-100">
                <p className="text-[10px] opacity-60 font-black uppercase mb-1">eGFR (滤过率)</p>
                <div className="text-3xl font-black">{egfr} <span className="text-xs opacity-60">ml/min</span></div>
              </div>
            </div>
            
            {/* KDIGO 慢性肾脏病分级参考表 - 深度还原 UI */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 px-2 text-slate-800">
                <div className="w-1.5 h-4 bg-[#00B17D] rounded-full"></div>
                <h4 className="text-sm font-black uppercase tracking-tight">慢性肾脏病分级参考表 (eGFR)</h4>
              </div>
              <div className="grid gap-2.5">
                {RENAL_STAGES.map((s) => (
                  <div key={s.stage} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center font-black text-sm shadow-inner`}>{s.stage}</div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-black text-slate-800">{s.desc}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold leading-tight">{s.detail}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-4">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">eGFR 范围</p>
                      <p className="text-sm font-black text-slate-600 group-hover:text-sky-600 transition-colors">{s.range}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSub === 'electrolyte' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
              <h4 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2"><div className="w-1.5 h-4 bg-sky-500 rounded-full"></div> 补钾计算 (K+)</h4>
              <div className="grid grid-cols-2 gap-4 mb-6"><InputField label="当前值" value={kCurrent} onChange={setKCurrent} /><InputField label="目标值" value={kTarget} onChange={setKTarget} /></div>
              <div className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-inner">
                <div><p className="text-[10px] font-black text-slate-300 uppercase">缺钾总量</p><p className="text-2xl font-black text-sky-600">{kDef.mmol} mmol</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-300 uppercase">对应 KCl 10%</p><p className="text-2xl font-black text-slate-800">{(kDef.grams * 10).toFixed(1)} ml <span className="text-xs text-slate-400">({kDef.grams}g)</span></p></div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
              <h4 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2"><div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div> 补钠计算 (Na+)</h4>
              <div className="grid grid-cols-2 gap-4 mb-6"><InputField label="当前值" value={naCurrent} onChange={setNaCurrent} /><InputField label="目标值" value={naTarget} onChange={setNaTarget} /></div>
              <div className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-inner">
                <div><p className="text-[10px] font-black text-slate-300 uppercase">缺钠总量</p><p className="text-2xl font-black text-indigo-600">{naDef.mmol} mmol</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-300 uppercase">对应 NaCl 3%</p><p className="text-2xl font-black text-slate-800">{(naDef.grams / 0.03).toFixed(0)} ml <span className="text-xs text-slate-400">({naDef.grams}g)</span></p></div>
              </div>
            </div>
          </div>
        )}
        
        {/* 其余部分代码（儿科补液、外科补液、烧伤补液）保持严格不变 */}
        {activeSub === 'peds' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* 核心计算展示 */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                 {['mild', 'moderate', 'severe'].map(d => <button key={d} onClick={() => setPedsDegree(d as any)} className={`py-3 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${pedsDegree === d ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-50 text-slate-300'}`}>{d === 'mild' ? '轻度' : d === 'moderate' ? '中度' : '重度'}</button>)}
              </div>
              <div className="p-8 bg-sky-500 rounded-[40px] text-white shadow-xl">
                 <div className="text-[10px] font-black uppercase opacity-60 mb-2">24h 累计损失 + 生理需要</div>
                 <div className="text-5xl font-black">{Math.round(Number(weight) * (pedsDegree === 'mild' ? 50 : pedsDegree === 'moderate' ? 80 : 120) + Number(weight) * 80)} <span className="text-lg opacity-60">ml</span></div>
                 <div className="mt-6 pt-6 border-t border-white/20 flex justify-between text-[10px] font-bold">
                   <span>首 8h: 1/2 总量</span>
                   <span>见尿补钾 (0.3%)</span>
                 </div>
              </div>
            </div>

            {/* 图表 3-3-1：脱水程度的评估 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2 text-slate-800">
                <TableIcon size={16} className="text-sky-500" />
                <h4 className="text-sm font-black uppercase tracking-tight">表 3-3-1 脱水程度的评估</h4>
              </div>
              <div className="overflow-x-auto rounded-[32px] border border-slate-100 shadow-sm">
                <table className="w-full text-[10px] border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black uppercase">
                      <th className="p-4 text-left border-b border-slate-100">症状与体征</th>
                      <th className="p-4 text-left border-b border-slate-100">轻度脱水</th>
                      <th className="p-4 text-left border-b border-slate-100">中度脱水</th>
                      <th className="p-4 text-left border-b border-slate-100">重度脱水</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600">
                    {[
                      ["一般状况", "精神稍差或不安", "精神萎靡或烦躁不安", "嗜睡、昏迷甚至惊厥"],
                      ["眼窝、前囟", "略凹陷", "明显凹陷", "深凹陷，眼不能闭合"],
                      ["眼泪", "略少", "少", "无"],
                      ["口舌", "略干燥", "干燥", "明显干燥"],
                      ["口渴", "无", "口渴，想喝水", "少量饮水或不能饮水"],
                      ["皮肤弹性", "稍差，捏起后回缩快", "差，捏起后回缩慢(1~2秒)", "很差，捏起后回缩很慢(>2秒)"],
                      ["尿量", "正常或略少", "少", "无"],
                      ["心率", "正常", "增快", "快、弱"],
                      ["四肢末梢", "正常", "稍冷", "冷、凉"],
                      ["体重丢失", "5% 以下", "5% ~ 10%", "10% 以上"]
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-black text-slate-800 whitespace-nowrap">{row[0]}</td>
                        <td className="p-4">{row[1]}</td>
                        <td className="p-4">{row[2]}</td>
                        <td className="p-4">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 图表 3-3-2：脱水的治疗方案 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2 text-slate-800">
                <TableIcon size={16} className="text-indigo-500" />
                <h4 className="text-sm font-black uppercase tracking-tight">表 3-3-2 脱水的治疗方案</h4>
              </div>
              <div className="p-6 bg-slate-900 rounded-[40px] text-white space-y-6">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-white/10 pb-2">累计损失量 (8-12小时补完)</h5>
                  <div className="grid gap-3 text-xs font-bold">
                    <div className="flex justify-between"><span>轻度脱水</span><span className="text-indigo-300">30 ~ 50 ml/kg</span></div>
                    <div className="flex justify-between"><span>中度脱水</span><span className="text-indigo-300">50 ~ 100 ml/kg</span></div>
                    <div className="flex justify-between"><span>重度脱水</span><span className="text-indigo-300">100 ~ 120 ml/kg</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-white/10 pb-2">补液性质选择</h5>
                  <div className="grid gap-3 text-xs font-bold">
                    <div className="flex justify-between"><span>低渗性脱水</span><span className="text-emerald-300">2/3 张液 ~ 等张</span></div>
                    <div className="flex justify-between"><span>等渗性脱水</span><span className="text-emerald-300">1/2 ~ 2/3 张液</span></div>
                    <div className="flex justify-between"><span>高渗性脱水</span><span className="text-emerald-300">1/3 ~ 1/5 张液</span></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 text-[10px] text-slate-400 leading-relaxed italic">
                  备注：难以确定脱水性质者按等渗处理。快速扩容阶段 20ml/kg (0.5~1h)，余量 12~16h 内均匀输入。
                </div>
              </div>
            </div>

            {/* 图表 2-14：常用溶液简便配制 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2 text-slate-800">
                <TableIcon size={16} className="text-emerald-500" />
                <h4 className="text-sm font-black uppercase tracking-tight">表 2-14 几种常用溶液的简便配制 (ml)</h4>
              </div>
              <div className="overflow-x-auto rounded-[32px] border border-slate-100 shadow-sm">
                <table className="w-full text-[10px] border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black uppercase">
                      <th className="p-4 text-left border-b border-slate-100">名 称</th>
                      <th className="p-4 text-center border-b border-slate-100">5~10% 葡萄糖</th>
                      <th className="p-4 text-center border-b border-slate-100">10% 氯化钠</th>
                      <th className="p-4 text-center border-b border-slate-100">11.2% 乳酸钠 (或 5% 碳酸氢钠)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600 text-center">
                    {[
                      ["等张糖盐溶液", "500", "45", "-"],
                      ["1/2 张糖盐溶液", "500", "22.5", "-"],
                      ["1/3 张糖盐溶液", "500", "15", "-"],
                      ["2/3 张糖盐溶液", "500", "30", "-"],
                      ["2:1 等张液", "500", "30", "28 (或 47)"],
                      ["3:2:1 (1/2张)", "500", "15", "15 (或 25)"],
                      ["4:3:2 (2/3张)", "500", "20", "20 (或 33)"],
                      ["维持液", "500", "9", "10% 氯化钾 7.5"]
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-black text-slate-800 text-left whitespace-nowrap">{row[0]}</td>
                        <td className="p-4">{row[1]}</td>
                        <td className="p-4 font-bold text-sky-600">{row[2]}</td>
                        <td className="p-4 font-bold text-indigo-600">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSub === 'burn' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <InputField label="烧伤面积 (TBSA)" value={tbsa} onChange={setTbsa} unit="%" yellow />
            <div className="bg-orange-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase opacity-60 mb-2">第1个 24h 补液总量 (Parkland改良)</p>
                 <div className="text-5xl font-black">{burn.first24hTotal} <span className="text-lg opacity-60">ml</span></div>
                 <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white/10 p-4 rounded-2xl">
                       <p className="text-[9px] opacity-60 uppercase mb-1">前 8h 输入</p>
                       <p className="text-xl font-black">{burn.first8h} ml</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                       <p className="text-[9px] opacity-60 uppercase mb-1">后 16h 输入</p>
                       <p className="text-xl font-black">{burn.next16h} ml</p>
                    </div>
                 </div>
               </div>
               <Flame size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
            </div>
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex justify-around text-center">
               <div><p className="text-[10px] font-black text-slate-400 uppercase">晶体</p><p className="font-bold text-slate-800">{burn.crystalloid} ml</p></div>
               <div className="border-l border-slate-200"></div>
               <div><p className="text-[10px] font-black text-slate-400 uppercase">胶体</p><p className="font-bold text-slate-800">{burn.colloid} ml</p></div>
               <div className="border-l border-slate-200"></div>
               <div><p className="text-[10px] font-black text-slate-400 uppercase">水分</p><p className="font-bold text-slate-800">{burn.water} ml</p></div>
            </div>
          </div>
        )}

        {activeSub === 'adult' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-xl">
               <p className="text-[10px] font-black uppercase opacity-60 mb-2">成人外科基础补液量 (正常状态)</p>
               <div className="text-5xl font-black">{2500 + (Number(weight)-70)*20} <span className="text-lg opacity-60">ml</span></div>
               <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-xs font-bold">
                 <div className="flex items-center gap-2"><Droplets size={14}/> NS/5%GS: 2000-2500ml</div>
                 <div className="flex items-center gap-2"><Activity size={14}/> NaCl: 4.5-9.0 g</div>
               </div>
             </div>
             <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 italic text-[11px] text-slate-500 leading-relaxed">
               注：外科补液应遵循“显性失水 + 隐性失水 + 生理需要”原则。高热患者每升高1℃，需增加补液 500-1000ml。
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorTab;
