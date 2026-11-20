import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_BILLBOARD_CONFIG } from '../utils/renderGraphics';

export default function BillboardCalibrationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('projection'); // 'projection' | 'position' | 'appearance'
  const [config, setConfig] = useState(() => {
    if (typeof window !== 'undefined' && window.billboardConfig) {
      return { ...window.billboardConfig };
    }
    return { ...DEFAULT_BILLBOARD_CONFIG };
  });

  const [copied, setCopied] = useState(false);
  const dragPadRef = useRef(null);
  const isDraggingPadRef = useRef(false);

  // Sincroniza em tempo real caso a configuração seja alterada externamente
  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail) {
        setConfig(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('cryptozombies_billboard_config_updated', handleSync);
    return () => window.removeEventListener('cryptozombies_billboard_config_updated', handleSync);
  }, []);

  // Sincroniza estado com o renderizador do outdoor em tempo real
  const updateValue = (key, val) => {
    const num = parseFloat(val);
    const next = { ...config, [key]: isNaN(num) ? 0 : num };
    setConfig(next);
    if (typeof window !== 'undefined' && window.saveBillboardConfig) {
      window.saveBillboardConfig(next);
    }
  };

  // Arraste com o mouse dentro da área de controle (Touchpad de deslocamento 2D)
  const handleDragPadStart = (e) => {
    isDraggingPadRef.current = true;
    handleDragPadMove(e);
  };

  const handleDragPadMove = (e) => {
    if (!isDraggingPadRef.current || !dragPadRef.current) return;
    const rect = dragPadRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;

    // Normalizado de -1 a +1 relativo ao centro
    const normX = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1));

    const newOffsetX = Math.round(normX * 60 + 26);
    const newOffsetY = Math.round(normY * 50 + 82);

    const next = {
      ...config,
      shadowOffsetX: newOffsetX,
      shadowOffsetY: newOffsetY
    };
    setConfig(next);
    if (typeof window !== 'undefined' && window.saveBillboardConfig) {
      window.saveBillboardConfig(next);
    }
  };

  useEffect(() => {
    const handleGlobalPadMove = (e) => {
      if (isDraggingPadRef.current) handleDragPadMove(e);
    };
    const handleGlobalPadUp = () => {
      isDraggingPadRef.current = false;
    };
    window.addEventListener('mousemove', handleGlobalPadMove);
    window.addEventListener('mouseup', handleGlobalPadUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalPadMove);
      window.removeEventListener('mouseup', handleGlobalPadUp);
    };
  }, [config]);

  const handleReset = () => {
    if (typeof window !== 'undefined' && window.resetBillboardConfig) {
      const reset = window.resetBillboardConfig();
      setConfig({ ...reset });
    } else {
      setConfig({ ...DEFAULT_BILLBOARD_CONFIG });
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  // Presets rápidos de iluminação e projeção retangular
  const applyPreset = (preset) => {
    let patch = {};
    if (preset === 'default') {
      patch = { ...DEFAULT_BILLBOARD_CONFIG };
    } else if (preset === 'noon') {
      patch = {
        shadowSkewX: -0.30,
        shadowSkewY: -0.05,
        shadowScaleX: 0.95,
        shadowScaleY: 0.28,
        shadowRotDeg: -5,
        shadowOffsetX: 10,
        shadowOffsetY: 65,
        shadowOpacity: 0.65,
        shadowBlur: 1
      };
    } else if (preset === 'sunset') {
      patch = {
        shadowSkewX: -1.25,
        shadowSkewY: -0.28,
        shadowScaleX: 1.20,
        shadowScaleY: 0.58,
        shadowRotDeg: -18,
        shadowOffsetX: 42,
        shadowOffsetY: 95,
        shadowOpacity: 0.50,
        shadowBlur: 3
      };
    }
    const next = { ...config, ...patch };
    setConfig(next);
    if (typeof window !== 'undefined' && window.saveBillboardConfig) {
      window.saveBillboardConfig(next);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-slate-950 border-2 border-emerald-500/70 w-full max-w-md rounded-2xl p-4 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <span className="text-xl p-1.5 bg-emerald-950/80 rounded-lg border border-emerald-500/50 shadow">🪧</span>
            <div>
              <h3 className="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
                Calibrador da Sombra do Outdoor
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/40">
                  Retangular
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Ajuste a forma retangular, inclinação e posição da sombra no gramado
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-sm font-bold"
            title="Fechar Calibrador"
          >
            ✕
          </button>
        </div>

        {/* ABAS DE NAVEGAÇÃO */}
        <div className="grid grid-cols-3 gap-1 mb-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('projection')}
            className={`py-1.5 font-bold rounded-lg transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'projection' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📐</span> Projeção
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`py-1.5 font-bold rounded-lg transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'position' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯</span> Posição
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-1.5 font-bold rounded-lg transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'appearance' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎨</span> Aparência
          </button>
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">

          {/* ABA 1: PROJEÇÃO RETANGULAR */}
          {activeTab === 'projection' && (
            <>
              {/* Presets Rápidos */}
              <div className="bg-slate-900/90 p-2 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] font-bold text-slate-400 mb-1 block">Iluminação Solar (Presets):</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => applyPreset('default')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold py-1 px-1.5 rounded border border-emerald-500/30 cursor-pointer transition"
                  >
                    ☀️ Noroeste (Padrão)
                  </button>
                  <button
                    onClick={() => applyPreset('noon')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-1 px-1.5 rounded border border-amber-500/30 cursor-pointer transition"
                  >
                    🕛 Meio-Dia (Curta)
                  </button>
                  <button
                    onClick={() => applyPreset('sunset')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-orange-300 font-bold py-1 px-1.5 rounded border border-orange-500/30 cursor-pointer transition"
                  >
                    🌅 Fim de Tarde (Longa)
                  </button>
                </div>
              </div>

              {/* Inclinação Horizontal (Skew X) */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>↔️</span> Inclinação Horizontal (Skew X)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {(config.shadowSkewX ?? -0.80).toFixed(2)}
                  </span>
                </div>
                <input 
                  type="range"
                  min="-2.0"
                  max="0.5"
                  step="0.02"
                  value={config.shadowSkewX ?? -0.80}
                  onChange={(e) => updateValue('shadowSkewX', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Mais para a Direita (-2.0)</span>
                  <span>Alinhado Reto (0.0)</span>
                </div>
              </div>

              {/* Inclinação Vertical (Skew Y) */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>↕️</span> Perspectiva no Solo (Skew Y)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {(config.shadowSkewY ?? -0.18).toFixed(2)}
                  </span>
                </div>
                <input 
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.02"
                  value={config.shadowSkewY ?? -0.18}
                  onChange={(e) => updateValue('shadowSkewY', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Achatamento no Solo (Scale Y) */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>📏</span> Achatamento no Solo (Scale Y)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {(config.shadowScaleY ?? 0.42).toFixed(2)}x
                  </span>
                </div>
                <input 
                  type="range"
                  min="0.10"
                  max="1.20"
                  step="0.02"
                  value={config.shadowScaleY ?? 0.42}
                  onChange={(e) => updateValue('shadowScaleY', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Mais Achatada no Chão (0.10)</span>
                  <span>Mais Alta (1.20)</span>
                </div>
              </div>

              {/* Largura da Sombra (Scale X) */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>↔️</span> Largura da Sombra (Scale X)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {(config.shadowScaleX ?? 1.05).toFixed(2)}x
                  </span>
                </div>
                <input 
                  type="range"
                  min="0.50"
                  max="1.60"
                  step="0.02"
                  value={config.shadowScaleX ?? 1.05}
                  onChange={(e) => updateValue('shadowScaleX', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Rotação no Plano (Graus) */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>🔄</span> Ângulo de Rotação (Graus °)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {(config.shadowRotDeg ?? -12).toFixed(0)}°
                  </span>
                </div>
                <input 
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={config.shadowRotDeg ?? -12}
                  onChange={(e) => updateValue('shadowRotDeg', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* ABA 2: POSIÇÃO & DESLOCAMENTO */}
          {activeTab === 'position' && (
            <>
              {/* TOUCHPAD 2D PARA POSICIONAMENTO */}
              <div className="bg-slate-900 p-2.5 rounded-2xl border-2 border-emerald-500/60 shadow-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-emerald-300 text-xs flex items-center gap-1.5">
                    <span>🖱️</span> Arrastar Sombra no Gramado (2D Pad)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-200 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    X: {config.shadowOffsetX ?? 26} | Y: {config.shadowOffsetY ?? 82}
                  </span>
                </div>

                <div 
                  ref={dragPadRef}
                  onMouseDown={handleDragPadStart}
                  onTouchStart={handleDragPadStart}
                  className="relative w-full h-28 bg-slate-950 rounded-xl border border-slate-700 cursor-crosshair overflow-hidden select-none touch-none shadow-inner flex items-center justify-center hover:border-emerald-400 transition"
                  title="Clique e arraste em qualquer direção para posicionar a sombra no gramado"
                >
                  {/* Linhas de Mira / Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-emerald-400"></div>
                    <div className="h-full w-[1px] bg-emerald-400 absolute"></div>
                  </div>

                  {/* Pontos Cardeais */}
                  <span className="absolute top-1 text-[8px] font-black text-slate-500 pointer-events-none">▲ NORTE (Acima)</span>
                  <span className="absolute bottom-1 text-[8px] font-black text-emerald-400 pointer-events-none">▼ SUL (Abaixo)</span>
                  <span className="absolute left-1.5 text-[8px] font-bold text-slate-500 pointer-events-none">◀ OESTE</span>
                  <span className="absolute right-1.5 text-[8px] font-bold text-slate-500 pointer-events-none">LESTE ▶</span>

                  {/* Handle / Ponto de Controle que segue o mouse */}
                  <div 
                    className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.9)] flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${Math.max(10, Math.min(90, 50 + (((config.shadowOffsetX ?? 26) - 26) / 60) * 35))}%`,
                      top: `${Math.max(10, Math.min(90, 50 + (((config.shadowOffsetY ?? 82) - 82) / 50) * 35))}%`
                    }}
                  >
                    <span className="text-[10px] leading-none">🪧</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 text-center mt-1">
                  💡 Clique e arraste para projetar a sombra para sudeste sob o outdoor
                </p>
              </div>

              {/* Deslocamento X */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>➡️</span> Deslocamento Horizontal X (px)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {config.shadowOffsetX ?? 26} px
                  </span>
                </div>
                <input 
                  type="range"
                  min="-50"
                  max="100"
                  step="1"
                  value={config.shadowOffsetX ?? 26}
                  onChange={(e) => updateValue('shadowOffsetX', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Deslocamento Y */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>⬇️</span> Deslocamento Vertical Y (px)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {config.shadowOffsetY ?? 82} px
                  </span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="140"
                  step="1"
                  value={config.shadowOffsetY ?? 82}
                  onChange={(e) => updateValue('shadowOffsetY', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* ABA 3: APARÊNCIA & CONTATO */}
          {activeTab === 'appearance' && (
            <>
              {/* Opacidade da Sombra Projetada */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>🌑</span> Opacidade da Sombra do Painel
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {Math.round((config.shadowOpacity ?? 0.60) * 100)}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.02"
                  value={config.shadowOpacity ?? 0.60}
                  onChange={(e) => updateValue('shadowOpacity', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Suavidade / Blur da Sombra */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>🌫️</span> Difusão / Desfoque Suave (Blur px)
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {config.shadowBlur ?? 2} px
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={config.shadowBlur ?? 2}
                  onChange={(e) => updateValue('shadowBlur', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Nitidez Total (0px)</span>
                  <span>Muito Suave (8px)</span>
                </div>
              </div>

              {/* Opacidade das Sapatas / Pés de Contato */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <span>👣</span> Oclusão nos Pés Metálicos
                  </span>
                  <span className="font-mono text-emerald-200 text-xs font-black bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {Math.round((config.footShadowOpacity ?? 0.85) * 100)}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0.20"
                  max="1.00"
                  step="0.05"
                  value={config.footShadowOpacity ?? 0.85}
                  onChange={(e) => updateValue('footShadowOpacity', e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </>
          )}

        </div>

        {/* RODAPÉ DE AÇÕES */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg font-bold border border-slate-700 transition cursor-pointer"
              title="Restaurar valores de fábrica"
            >
              🔄 Restaurar
            </button>
            <button
              onClick={handleCopy}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1"
              title="Copiar JSON da configuração calibrada"
            >
              {copied ? '✅ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-1.5 rounded-lg shadow cursor-pointer transition active:scale-95"
          >
            Salvar & Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
