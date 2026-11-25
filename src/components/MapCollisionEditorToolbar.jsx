import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Eraser, 
  RotateCcw, 
  Copy, 
  Check, 
  Grid3X3, 
  X, 
  Eye, 
  Layers, 
  HelpCircle,
  Square,
  Maximize2
} from 'lucide-react';
import { exportCustomObstaclesCode, TOTAL_SUB_CELLS } from '../utils/cityMapGeometry';

/**
 * CRYPTOZOMBIES — BARRA FLUTUANTE DE DESENHO DE BLOQUEIOS DO MAPA
 * 
 * Permite ao usuário clicar e arrastar diretamente no mapa do jogo para:
 * - 🟥 Bloquear quadradinhos (criar paredes/escombros intransponíveis)
 * - 🟩 Liberar quadradinhos (remover obstáculos e permitir passagem de heróis e zumbis)
 * - Quadradinhos bem menores de 19px (60x44 = 2.640 células por todo o mapa)
 * - Seletor de Pincel: 19px (Pequeno 1x1), 38px (Médio 2x2), 76px (Grande 4x4)
 * - Visualizar a grade de precisão e coordenadas
 * - Restaurar bloqueios padrão do jogo
 * - Exportar / copiar o código gerado
 */
export default function MapCollisionEditorToolbar({
  isOpen,
  onClose,
  tool = 'block',
  onSelectTool,
  brushSize = 1,
  onSelectBrushSize,
  showGrid = true,
  onToggleGrid,
  showCoordinates = false,
  onToggleCoordinates,
  onReset,
  onBlockAll,
  onClearAll,
  dockPosition = 'top',
  onToggleDock,
  isFullPage = false,
  onToggleFullPage,
  blockedCount = 0,
  totalCells = TOTAL_SUB_CELLS || 4256
}) {
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isOpen) return null;

  const pct = Math.round((blockedCount / totalCells) * 100);

  const handleCopyCode = () => {
    try {
      const code = exportCustomObstaclesCode();
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('Erro ao copiar código:', e);
    }
  };

  // Modo Recolhido (Pill minimalista para liberar 100% da visualização do mapa)
  if (isCollapsed) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/95 border-2 border-amber-500/80 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md text-white select-none animate-fadeIn">
        <span className="text-xs font-bold text-amber-300">🧱 Bloqueios ({blockedCount}/{totalCells})</span>
        <button
          type="button"
          onClick={() => onSelectTool('block')}
          className={`px-2 py-0.5 rounded text-xs font-bold ${tool === 'block' ? 'bg-red-600 text-white' : 'text-red-300'}`}
        >
          🟥
        </button>
        <button
          type="button"
          onClick={() => onSelectTool('clear')}
          className={`px-2 py-0.5 rounded text-xs font-bold ${tool === 'clear' ? 'bg-emerald-600 text-white' : 'text-emerald-300'}`}
        >
          🟩
        </button>
        <button
          type="button"
          onClick={() => onSelectTool('billboard')}
          className={`px-2 py-0.5 rounded text-xs font-bold ${tool === 'billboard' ? 'bg-sky-600 text-white' : 'text-sky-300'}`}
          title="Arrastar Outdoor"
        >
          🪧
        </button>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
        >
          Expandir ▾
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-red-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-1 px-3.5 py-2 rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.30)] backdrop-blur-md transition-all animate-fadeIn text-white z-30 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        
        {/* Cabeçalho & Estatística */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black tracking-wider uppercase text-amber-300">
                Bloqueios do Mapa • 60x44 (19px)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                {blockedCount}/{totalCells} • {pct}%
              </span>
            </div>
          </div>
        </div>

        {/* Ferramentas: Bloquear / Liberar */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onSelectTool('block')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tool === 'block'
                ? 'bg-red-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.6)] ring-2 ring-red-400'
                : 'text-red-300 hover:bg-red-950/50 hover:text-white'
            }`}
            title="Pincel Bloquear: transforma qualquer quadradinho em barreira intransponível (vermelho)"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>🟥 Bloquear</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('clear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tool === 'clear'
                ? 'bg-emerald-600 text-white shadow-[0_0_14px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400'
                : 'text-emerald-300 hover:bg-emerald-950/50 hover:text-white'
            }`}
            title="Pincel Liberar: remove o bloqueio e abre caminho livre para heróis e zumbis (verde)"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>🟩 Liberar</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('billboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tool === 'billboard'
                ? 'bg-sky-600 text-white shadow-[0_0_14px_rgba(14,165,233,0.6)] ring-2 ring-sky-400'
                : 'text-sky-300 hover:bg-sky-950/50 hover:text-white'
            }`}
            title="Mover Outdoor: clique e arraste o outdoor CryptoZombies para qualquer lugar do mapa"
          >
            <span>🪧 Mover Outdoor</span>
          </button>
        </div>

        {/* Tamanho do Quadradinho / Pincel */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1 hidden sm:inline">
            Tamanho:
          </span>

          <button
            type="button"
            onClick={() => onSelectBrushSize?.(1)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              brushSize === 1
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Quadradinho Pequeno 19px (1x1) - Alta precisão cirúrgica"
          >
            <Square className="w-3 h-3" />
            <span>19px (Fino)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrushSize?.(2)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              brushSize === 2
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Quadradinho Médio 38px (2x2)"
          >
            <Maximize2 className="w-3 h-3" />
            <span>38px (Médio)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrushSize?.(4)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              brushSize === 4
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Bloco Grande 76px (4x4) - Pinta setores inteiros"
          >
            <span>76px (Grande)</span>
          </button>
        </div>

        {/* Ações em Massa: Bloquear Tudo / Limpar Tudo */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={onBlockAll}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/40 transition-all cursor-pointer"
            title="Bloquear 100% de todo o mapa de uma só vez (depois use Liberar para abrir caminhos)"
          >
            Bloquear Tudo
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 transition-all cursor-pointer"
            title="Liberar 100% de todo o mapa (remove todos os bloqueios para desenhar do zero)"
          >
            Limpar Tudo
          </button>
        </div>

        {/* Alternar Posição (Topo / Rodapé) para não tampar o mapa */}
        <button
          type="button"
          onClick={onToggleDock}
          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
          title="Mover barra entre o Topo e o Rodapé da tela para não tampar nenhuma área do mapa"
        >
          {dockPosition === 'top' ? '⬇️ Descer' : '⬆️ Subir'}
        </button>

        {/* Alternar Tela Cheia / Página Toda */}
        {onToggleFullPage && (
          <button
            type="button"
            onClick={onToggleFullPage}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
              isFullPage
                ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                : 'bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border-indigo-500/40'
            }`}
            title={isFullPage ? "Restaurar layout normal com lista de heróis" : "Expandir mapa para a página toda (tela cheia)"}
          >
            <Maximize2 className="w-3 h-3" />
            <span>{isFullPage ? '🗗 Painel Normal' : '🖥️ Página Toda'}</span>
          </button>
        )}

        {/* Toggles de Visualização */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={onToggleGrid}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              showGrid
                ? 'bg-amber-600/40 text-amber-200 border border-amber-500/50 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Alternar visibilidade das linhas da grade 60x44 por todo o mapa"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Grade</span>
          </button>

          <button
            type="button"
            onClick={onToggleCoordinates}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              showCoordinates
                ? 'bg-amber-600/40 text-amber-200 border border-amber-500/50 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Alternar exibição das coordenadas numéricas e setores"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Coords</span>
          </button>
        </div>

        {/* Ações: Copiar, Restaurar, Recolher e Fechar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-sky-950/80 hover:bg-sky-900 text-sky-200 hover:text-white border border-sky-500/50 transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
            title="Copiar lista de quadradinhos bloqueados em JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/40 transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
            title="Restaurar bloqueios oficiais originais do jogo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
            title="Minimizar barra para uma pílula compacta"
          >
            —
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-rose-900/60 transition-all cursor-pointer border border-transparent hover:border-rose-500/50"
            title="Fechar Editor de Bloqueios"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Card Expansível de Ajuda e Atalhos */}
      {showHelp && (
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl">
          <div className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold">🖱️ Botão Esquerdo:</span>
            <span>Pinta usando a ferramenta selecionada (Bloquear ou Liberar). Arraste com o botão pressionado para desenhar contínuo!</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">🔘 Botão Direito:</span>
            <span>Atalho rápido de borracha: apaga e libera qualquer quadradinho imediatamente sem precisar trocar de ferramenta.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-sky-400 font-bold">⚡ Quadradinhos de 19px:</span>
            <span>60 colunas por 44 linhas cobrindo todo o mapa. Enquadre só as pedras e ruínas sem encostar na rua!</span>
          </div>
        </div>
      )}
    </div>
  );
}
