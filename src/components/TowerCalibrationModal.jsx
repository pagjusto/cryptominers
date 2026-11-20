import React, { useState, useEffect, useRef } from 'react';
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
  const dragPadRef = useRef(null);
  const isDraggingPadRef = useRef(false);

  // Sinaliza se o painel está aberto para exibir alças visuais no mapa
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.isTowerCalibrating = isOpen;
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.isTowerCalibrating = false;
      }
    };
  }, [isOpen]);

  // Sincroniza em tempo real caso o usuário arraste direto no GameBoard
  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail) {
        setConfig(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('cryptozombies_tower_config_updated', handleSync);
    return () => window.removeEventListener('cryptozombies_tower_config_updated', handleSync);
  }, []);

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

  // Arraste com o mouse dentro da área de controle (Touchpad de inclinação 360°)
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

    // normY > 0 significa mover para baixo (deitar para a frente / perna do meio)
    const newTopDeltaY = Math.round(normY * 50 + 30);
    const newTopDeltaX = Math.round(normX * 35);

    const next = {
      ...config,
      topDeltaX: newTopDeltaX,
      topDeltaY: newTopDeltaY
    };
    setConfig(next);
    if (typeof window !== 'undefined' && window.saveTowerConfig) {
      window.saveTowerConfig(next);
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
    if (typeof window !== 'undefined' && window.resetTowerConfig) {
      window.resetTowerConfig();
      setConfig({ ...DEFAULT_TOWER_CONFIG });
    }
  };

  const handleFlipHorizontal = () => {
    const current = config.scaleX ?? 1.0;
    updateValue('scaleX', current === 0 ? -1 : -current);
  };

  const handleFlipShadow = () => {
    const current = config.shadowScaleX ?? 1.0;
    updateValue('shadowScaleX', current === 0 ? -1 : -current);
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
            {/* PAD INTERATIVO: ARRASTAR COM O MOUSE PARA AJUSTAR ÂNGULO */}
            <div className="bg-slate-900 p-2.5 rounded-2xl border-2 border-amber-500/60 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                  <span>🖱️</span> Arrastar com o Mouse (Ângulo)
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-200 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {(config.leanSouth || 0) >= 0 ? `Sul (+${(config.leanSouth || 0).toFixed(2)})` : `Norte (${(config.leanSouth || 0).toFixed(2)})`}
                </span>
              </div>

              <div 
                ref={dragPadRef}
                onMouseDown={handleDragPadStart}
                onTouchStart={handleDragPadStart}
                className="relative w-full h-24 bg-slate-950 rounded-xl border border-slate-700 cursor-crosshair overflow-hidden select-none touch-none shadow-inner flex items-center justify-center hover:border-amber-400 transition"
                title="Clique e arraste em qualquer direção para inclinar a torre instantaneamente"
              >
                {/* Linhas de Mira / Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-full h-[1px] bg-amber-400"></div>
                  <div className="h-full w-[1px] bg-amber-400 absolute"></div>
                </div>

                {/* Pontos Cardeais */}
                <span className="absolute top-1 text-[8px] font-black text-slate-500 pointer-events-none">▲ NORTE (Trás)</span>
                <span className="absolute bottom-1 text-[9px] font-black text-amber-400 pointer-events-none">▼ SUL (Frente / Perna do Meio)</span>
                <span className="absolute left-1.5 text-[8px] font-bold text-slate-500 pointer-events-none">◀ OESTE</span>
                <span className="absolute right-1.5 text-[8px] font-bold text-slate-500 pointer-events-none">LESTE ▶</span>

                {/* Handle / Ponto de Controle que segue o mouse */}
                <div 
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.9)] flex items-center justify-center pointer-events-none"
                  style={{
                    left: `${Math.max(10, Math.min(90, 50 + ((config.topDeltaX || 0) / 40) * 35))}%`,
                    top: `${Math.max(10, Math.min(90, 50 + (((config.topDeltaY ?? 32) - 30) / 50) * 35))}%`
                  }}
                >
                  <span className="text-[10px] leading-none">🗼</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 text-center mt-1">
                💡 Dica: Você também pode clicar e arrastar <b>direto na torre no mapa</b>!
              </p>
            </div>

            {/* 1. Rotação Horizontal Tridimensional (Giro Yaw 3D) */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <span>🔄</span> Girar Horizontalmente (Yaw °)
                </span>
                <span className="font-mono text-amber-200 text-xs font-black bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                  {(config.yawDeg || 0).toFixed(0)}°
                </span>
              </div>
              <input 
                type="range"
                min="-180"
                max="180"
                step="1"
                value={config.yawDeg ?? 0}
                onChange={(e) => updateValue('yawDeg', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400">Atalhos:</span>
                <div className="flex items-center gap-1">
                  {[-90, -45, 0, 45, 90, 180].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => updateValue('yawDeg', deg)}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold transition-all ${
                        (config.yawDeg ?? 0) === deg 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Escala / Espelho Horizontal (scaleX) & Inverter Face */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-300">Largura / Espelho Horizontal</span>
                <span className="font-mono text-emerald-200 text-[11px] font-bold">
                  {(config.scaleX ?? 1.0).toFixed(2)}x
                </span>
              </div>
              <input 
                type="range"
                min="-1.50"
                max="1.50"
                step="0.02"
                value={config.scaleX ?? 1.0}
                onChange={(e) => updateValue('scaleX', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>Invertido (-1.5)</span>
                <button
                  onClick={handleFlipHorizontal}
                  className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 px-2 py-0.5 rounded font-bold transition-all active:scale-95"
                  title="Inverter a face da torre (esquerda ↔ direita)"
                >
                  ⇆ Inverter Face (Flip)
                </button>
                <span>Normal (+1.5)</span>
              </div>
            </div>

            {/* 3. Deitar a Torre para a Frente (Perna do Meio / Sul) - REGRA OFICIAL */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border-2 border-amber-500/70 shadow-md">
              <div className="flex justify-between items-center mb-1">
                <span className="font-extrabold text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <span>🗼</span> Deitar para Frente (Perna do Meio / Sul)
                </span>
                <span className="font-mono text-amber-200 text-xs font-black bg-amber-950 px-2 py-0.5 rounded border border-amber-400">
                  {config.topDeltaY ?? 32}px
                </span>
              </div>
              <input 
                type="range"
                min="-40"
                max="80"
                step="1"
                value={config.topDeltaY ?? 32}
                onChange={(e) => updateValue('topDeltaY', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>▲ Trás / Norte (-40px)</span>
                <span className="text-amber-300 font-black">▼ Deitar Frente (+80px)</span>
              </div>
              
              {/* Botões rápidos de inclinação */}
              <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-slate-800">
                <span className="text-[10px] text-slate-400">Atalhos:</span>
                <div className="flex items-center gap-1">
                  {[0, 15, 30, 45, 60, 75].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateValue('topDeltaY', val)}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold transition-all ${
                        (config.topDeltaY ?? 32) === val
                          ? 'bg-amber-600 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {val}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Inclinar Topo para os Lados (Esquerda ↔ Direita/Escada) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sky-300">Inclinar Topo (Esquerda ↔ Direita)</span>
                <span className="font-mono text-sky-200 text-[11px] font-bold">
                  {config.topDeltaX ?? 0}px
                </span>
              </div>
              <input 
                type="range"
                min="-40"
                max="40"
                step="1"
                value={config.topDeltaX ?? 0}
                onChange={(e) => updateValue('topDeltaX', e.target.value)}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Esquerda (-40px)</span>
                <span>Direita (+40px)</span>
              </div>
            </div>

            {/* 5. Pender Topo para os Lados (Esquerda ↔ Escada) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-indigo-300">Pender Topo (Esquerda ↔ Escada)</span>
                <span className="font-mono text-indigo-200 text-[11px] font-bold">
                  {(config.leanSides ?? config.skewX ?? 0).toFixed(3)}
                </span>
              </div>
              <input 
                type="range"
                min="-0.20"
                max="0.20"
                step="0.005"
                value={config.leanSides ?? config.skewX ?? 0}
                onChange={(e) => updateValue('leanSides', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Inclina p/ Esquerda</span>
                <span>Inclina p/ Escada</span>
              </div>
            </div>

            {/* 5. Rotação Geral no Plano (rotDeg) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-teal-300">Girar Torre no Plano (Ângulo °)</span>
                <span className="font-mono text-teal-200 text-[11px] font-bold">
                  {(config.rotDeg || 0).toFixed(1)}°
                </span>
              </div>
              <input 
                type="range"
                min="-30"
                max="30"
                step="0.2"
                value={config.rotDeg ?? 0}
                onChange={(e) => updateValue('rotDeg', e.target.value)}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Sentido Anti-horário (-30°)</span>
                <span>Sentido Horário (+30°)</span>
              </div>
            </div>

            {/* 6. Altura / Perspectiva Y (scaleY) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-purple-300">Altura / Perspectiva Y</span>
                <span className="font-mono text-purple-200 text-[11px] font-bold">
                  {(config.scaleY ?? 1.0).toFixed(2)}x
                </span>
              </div>
              <input 
                type="range"
                min="0.70"
                max="1.30"
                step="0.01"
                value={config.scaleY ?? 1.0}
                onChange={(e) => updateValue('scaleY', e.target.value)}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* 7. Posição no Solo (Offset X & Y) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                  <span>Pos X</span>
                  <span className="font-mono">{config.offsetX || 0}px</span>
                </div>
                <input 
                  type="range"
                  min="-40"
                  max="40"
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
                  min="-40"
                  max="40"
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
            {/* 1. Giro Horizontal da Sombra (shadowYawDeg) */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <span>🔄</span> Girar Sombra Horizontalmente (Yaw °)
                </span>
                <span className="font-mono text-amber-200 text-xs font-black bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                  {(config.shadowYawDeg || 0).toFixed(0)}°
                </span>
              </div>
              <input 
                type="range"
                min="-180"
                max="180"
                step="1"
                value={config.shadowYawDeg ?? 0}
                onChange={(e) => updateValue('shadowYawDeg', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>Invertida (-180°)</span>
                <button
                  onClick={handleFlipShadow}
                  className="bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 px-2 py-0.5 rounded font-bold transition-all active:scale-95"
                  title="Inverter o lado da sombra (esquerda ↔ direita)"
                >
                  ⇆ Inverter Sombra (Flip)
                </button>
                <span>Normal (+180°)</span>
              </div>
            </div>

            {/* 2. Ângulo / Rotação da Sombra (shadowRotDeg) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-300">Ângulo da Sombra (Girar °)</span>
                <span className="font-mono text-amber-200 text-[11px] font-bold">
                  {(config.shadowRotDeg || 0).toFixed(1)}°
                </span>
              </div>
              <input 
                type="range"
                min="-90"
                max="90"
                step="0.5"
                value={config.shadowRotDeg ?? 0}
                onChange={(e) => updateValue('shadowRotDeg', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Gira Esquerda (-90°)</span>
                <span>Gira Direita (+90°)</span>
              </div>
            </div>

            {/* 3. Direção Horizontal da Sombra (shadowSkewX) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sky-300">Direção Horizontal (Leste/Oeste)</span>
                <span className="font-mono text-sky-200 text-[11px] font-bold">
                  {(config.shadowSkewX ?? -0.75).toFixed(2)}
                </span>
              </div>
              <input 
                type="range"
                min="-1.80"
                max="0.80"
                step="0.02"
                value={config.shadowSkewX ?? -0.75}
                onChange={(e) => updateValue('shadowSkewX', e.target.value)}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Mais p/ Direita (-1.8)</span>
                <span>Mais p/ Esquerda (+0.8)</span>
              </div>
            </div>

            {/* 4. Achatamento Vertical no Solo (shadowSkewY) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-300">Achatamento Vertical no Solo</span>
                <span className="font-mono text-emerald-200 text-[11px] font-bold">
                  {(config.shadowSkewY ?? -0.26).toFixed(2)}
                </span>
              </div>
              <input 
                type="range"
                min="-0.90"
                max="0.30"
                step="0.01"
                value={config.shadowSkewY ?? -0.26}
                onChange={(e) => updateValue('shadowSkewY', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Mais Longa / Sul (-0.9)</span>
                <span>Mais Curta (+0.3)</span>
              </div>
            </div>

            {/* 5. Comprimento e Opacidade */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-purple-300 mb-1">
                  <span>Comprimento</span>
                  <span className="font-mono">{(config.shadowLength ?? 1.0).toFixed(2)}x</span>
                </div>
                <input 
                  type="range"
                  min="0.20"
                  max="2.50"
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

            {/* 6. Deslocamento Fino da Sombra (Offsets) */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                  <span>Sombra Offset X</span>
                  <span className="font-mono">{config.shadowOffsetX || 0}px</span>
                </div>
                <input 
                  type="range"
                  min="-40"
                  max="40"
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
                  min="-40"
                  max="40"
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
