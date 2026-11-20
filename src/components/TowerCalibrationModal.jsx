import React, { useState } from 'react';
import { DEFAULT_TOWER_CONFIG } from '../utils/renderGraphics';

export default function TowerCalibrationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('tower'); // 'tower' | 'shadow'
  const [config, setConfig] = useState(() => {
    if (typeof window !== 'undefined' && window.towerTiltConfig) {
      return { ...window.towerTiltConfig };
    }
    return { ...DEFAULT_TOWER_CONFIG };
  });

  const [copied, setCopied] = useState(false);

  // Sincroniza estado com o renderizador da torre em tempo real
  const updateValue = (key, val) => {
    const num = parseFloat(val);
    const next = { ...config, [key]: isNaN(num) ? 0 : num };
    setConfig(next);
    if (typeof window !== 'undefined') {
      if (window.saveTowerConfig) {
        window.saveTowerConfig(next);
      } else {
        Object.assign(window.towerTiltConfig || {}, next);
      }
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && window.resetTowerConfig) {
      window.resetTowerConfig();
      setConfig({ ...DEFAULT_TOWER_CONFIG });
    }
  };

  const handleCopy = () => {
    const text = JSON.stringify(config, null, 2);
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-12 right-3 z-50 w-84 max-w-[94vw] bg-slate-950/95 backdrop-blur-md border-2 border-amber-500/70 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.95)] text-slate-100 font-sans text-xs select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🗼</span>
          <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
            Calibrador Torre & Sombra
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
          title="Fechar painel"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl mb-3 border border-slate-800">
        <button
          onClick={() => setActiveTab('tower')}
          className={`py-1.5 font-bold rounded-lg transition-all text-[11px] flex items-center justify-center gap-1 ${
            activeTab === 'tower' 
              ? 'bg-amber-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🗼</span> Torre (Estrutura)
        </button>
        <button
          onClick={() => setActiveTab('shadow')}
          className={`py-1.5 font-bold rounded-lg transition-all text-[11px] flex items-center justify-center gap-1 ${
            activeTab === 'shadow' 
              ? 'bg-amber-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🌑</span> Sombra (Ângulo)
        </button>
      </div>

      <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
        {activeTab === 'tower' ? (
          <>
            {/* 1. Descer Frente (skewY) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-300">Descer Frente (Pitch Y)</span>
                <span className="font-mono text-amber-200 text-[11px] font-bold">
                  {(config.skewY || 0).toFixed(3)}
                </span>
              </div>
              <input 
                type="range"
                min="-0.25"
                max="0.25"
                step="0.005"
                value={config.skewY ?? 0}
                onChange={(e) => updateValue('skewY', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Sobe Frente (-0.25)</span>
                <span>Desce Frente (+0.25)</span>
              </div>
            </div>

            {/* 2. Pender Perna do Meio (skewX) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sky-300">Pender Perna do Meio (Roll X)</span>
                <span className="font-mono text-sky-200 text-[11px] font-bold">
                  {(config.skewX || 0).toFixed(3)}
                </span>
              </div>
              <input 
                type="range"
                min="-0.25"
                max="0.25"
                step="0.005"
                value={config.skewX ?? 0}
                onChange={(e) => updateValue('skewX', e.target.value)}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Direita (-0.25)</span>
                <span>Perna do Meio (+0.25)</span>
              </div>
            </div>

            {/* 3. Rotação Geral (rotDeg) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-300">Girar Torre (Ângulo °)</span>
                <span className="font-mono text-emerald-200 text-[11px] font-bold">
                  {(config.rotDeg || 0).toFixed(1)}°
                </span>
              </div>
              <input 
                type="range"
                min="-20"
                max="20"
                step="0.2"
                value={config.rotDeg ?? 0}
                onChange={(e) => updateValue('rotDeg', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 4. Altura / Perspectiva Y (scaleY) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-purple-300">Altura / Perspectiva Y</span>
                <span className="font-mono text-purple-200 text-[11px] font-bold">
                  {(config.scaleY ?? 1.0).toFixed(2)}x
                </span>
              </div>
              <input 
                type="range"
                min="0.80"
                max="1.20"
                step="0.01"
                value={config.scaleY ?? 1.0}
                onChange={(e) => updateValue('scaleY', e.target.value)}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* 5. Posição no Solo (Offset X & Y) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                  <span>Pos X</span>
                  <span className="font-mono">{config.offsetX || 0}px</span>
                </div>
                <input 
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={config.offsetX || 0}
                  onChange={(e) => updateValue('offsetX', e.target.value)}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                  <span>Pos Y</span>
                  <span className="font-mono">{config.offsetY || 0}px</span>
                </div>
                <input 
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={config.offsetY || 0}
                  onChange={(e) => updateValue('offsetY', e.target.value)}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 1. Ângulo / Rotação da Sombra (shadowRotDeg) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-300">Ângulo da Sombra (Girar °)</span>
                <span className="font-mono text-amber-200 text-[11px] font-bold">
                  {(config.shadowRotDeg || 0).toFixed(1)}°
                </span>
              </div>
              <input 
                type="range"
                min="-60"
                max="60"
                step="0.5"
                value={config.shadowRotDeg ?? 0}
                onChange={(e) => updateValue('shadowRotDeg', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Gira Esquerda (-60°)</span>
                <span>Gira Direita (+60°)</span>
              </div>
            </div>

            {/* 2. Direção Horizontal da Sombra (shadowSkewX) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sky-300">Direção Horizontal (Leste/Oeste)</span>
                <span className="font-mono text-sky-200 text-[11px] font-bold">
                  {(config.shadowSkewX ?? -0.75).toFixed(2)}
                </span>
              </div>
              <input 
                type="range"
                min="-1.50"
                max="0.50"
                step="0.02"
                value={config.shadowSkewX ?? -0.75}
                onChange={(e) => updateValue('shadowSkewX', e.target.value)}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Mais p/ Direita (-1.5)</span>
                <span>Mais p/ Esquerda (+0.5)</span>
              </div>
            </div>

            {/* 3. Achatamento Vertical no Solo (shadowSkewY) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-300">Achatamento Vertical no Solo</span>
                <span className="font-mono text-emerald-200 text-[11px] font-bold">
                  {(config.shadowSkewY ?? -0.26).toFixed(2)}
                </span>
              </div>
              <input 
                type="range"
                min="-0.80"
                max="0.20"
                step="0.01"
                value={config.shadowSkewY ?? -0.26}
                onChange={(e) => updateValue('shadowSkewY', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Mais Longa / Sul (-0.8)</span>
                <span>Mais Curta (+0.2)</span>
              </div>
            </div>

            {/* 4. Comprimento e Opacidade */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-purple-300 mb-1">
                  <span>Comprimento</span>
                  <span className="font-mono">{(config.shadowLength ?? 1.0).toFixed(2)}x</span>
                </div>
                <input 
                  type="range"
                  min="0.30"
                  max="2.00"
                  step="0.05"
                  value={config.shadowLength ?? 1.0}
                  onChange={(e) => updateValue('shadowLength', e.target.value)}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-rose-300 mb-1">
                  <span>Opacidade</span>
                  <span className="font-mono">{Math.round((config.shadowOpacity ?? 0.85) * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={config.shadowOpacity ?? 0.85}
                  onChange={(e) => updateValue('shadowOpacity', e.target.value)}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 5. Deslocamento Fino da Sombra (Offsets) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                  <span>Sombra Offset X</span>
                  <span className="font-mono">{config.shadowOffsetX || 0}px</span>
                </div>
                <input 
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={config.shadowOffsetX || 0}
                  onChange={(e) => updateValue('shadowOffsetX', e.target.value)}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                  <span>Sombra Offset Y</span>
                  <span className="font-mono">{config.shadowOffsetY || 0}px</span>
                </div>
                <input 
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={config.shadowOffsetY || 0}
                  onChange={(e) => updateValue('shadowOffsetY', e.target.value)}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
        <button
          onClick={handleReset}
          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-all active:scale-95 text-[11px]"
        >
          🔄 Padrão
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all active:scale-95 text-[11px]"
        >
          {copied ? '✅ Copiado!' : '📋 Copiar'}
        </button>
      </div>
    </div>
  );
}
