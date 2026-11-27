import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Crosshair,
  Shield,
  Skull,
  Ban,
  MapPin,
  Eye,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
  isCityBuilding,
  isBaseCompound,
  isSpawnZoneCell,
  getEffectiveHeroSpawnPoints,
  saveCustomZombieSpawns,
  saveCustomHeroSpawns,
  resetCustomZombieSpawns,
  resetCustomHeroSpawns,
  TACTICAL_ZONES,
} from '../utils/cityMapGeometry';

const buildCurrentZombieSet = () => {
  const keys = new Set();
  for (let r = 1; r < GRID_ROWS - 1; r++) {
    for (let c = 1; c < GRID_COLS - 1; c++) {
      if (isSpawnZoneCell(c, r)) keys.add(`${c},${r}`);
    }
  }
  return keys;
};

export default function SpawnZonesModal({
  isOpen,
  onClose,
  miners = [],
  mapData = null,
  houseLevel = 1,
  onApplySpawns,
}) {
  const [editMode, setEditMode] = useState('inspect'); // 'inspect' | 'zombies' | 'heroes'
  const [showZombies, setShowZombies] = useState(true);
  const [showHeroes, setShowHeroes] = useState(true);
  const [showObstacles, setShowObstacles] = useState(true);
  const [showLiveEntities, setShowLiveEntities] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPaintValue, setDragPaintValue] = useState(true);
  const [saveNotice, setSaveNotice] = useState('');

  const [draftZombieKeys, setDraftZombieKeys] = useState(() => buildCurrentZombieSet());
  const [draftHeroPoints, setDraftHeroPoints] = useState(() => [...getEffectiveHeroSpawnPoints()]);

  useEffect(() => {
    if (isOpen) {
      setDraftZombieKeys(buildCurrentZombieSet());
      setDraftHeroPoints([...getEffectiveHeroSpawnPoints()]);
      setSaveNotice('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const gridAnalysis = useMemo(() => {
    const heroSpawnSet = new Map();
    draftHeroPoints.forEach((p, idx) => {
      const key = `${p.x},${p.y}`;
      if (!heroSpawnSet.has(key)) {
        heroSpawnSet.set(key, {
          ...p,
          index: idx + 1,
          blocked: isCityBuilding(p.x, p.y) || isBaseCompound(p.x, p.y),
        });
      }
    });

    const liveHeroesMap = new Map();
    (miners || []).forEach((m) => {
      if (m.status === 'work') {
        const hx = Math.round(m.x);
        const hy = Math.round(m.y);
        const key = `${hx},${hy}`;
        if (!liveHeroesMap.has(key)) liveHeroesMap.set(key, []);
        liveHeroesMap.get(key).push(m);
      }
    });

    const liveZombiesMap = new Map();
    (mapData?.deposits || []).forEach((d) => {
      if (!d.isCompleted) {
        const key = `${d.c},${d.r}`;
        liveZombiesMap.set(key, d);
      }
    });

    const cells = [];
    let zombieZoneCount = 0;
    let blockedCount = 0;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const isBorder = c === 0 || c === GRID_COLS - 1 || r === 0 || r === GRID_ROWS - 1;
        const isBase = isBaseCompound(c, r);
        const isObstacle = !isBase && isCityBuilding(c, r);
        const isZombieSpawn = !isBorder && !isBase && !isObstacle && draftZombieKeys.has(`${c},${r}`);
        const heroSpawn = heroSpawnSet.get(`${c},${r}`) || null;
        const liveHeroes = liveHeroesMap.get(`${c},${r}`) || [];
        const liveZombie = liveZombiesMap.get(`${c},${r}`) || null;

        if (isZombieSpawn) zombieZoneCount++;
        if (isBorder || isBase || isObstacle) blockedCount++;

        cells.push({
          c,
          r,
          isBorder,
          isBase,
          isObstacle,
          isZombieSpawn,
          heroSpawn,
          liveHeroes,
          liveZombie,
        });
      }
    }

    const heroValidCount = Array.from(heroSpawnSet.values()).filter((h) => !h.blocked).length;
    const heroBlockedCount = Array.from(heroSpawnSet.values()).filter((h) => h.blocked).length;

    return {
      cells,
      zombieZoneCount,
      blockedCount,
      heroTotalCount: heroSpawnSet.size,
      heroValidCount,
      heroBlockedCount,
      heroPoints: Array.from(heroSpawnSet.values()),
    };
  }, [miners, mapData, draftZombieKeys, draftHeroPoints]);

  if (!isOpen) return null;

  const toggleZombieCell = (cell, forceState = null) => {
    if (cell.isBorder || cell.isBase || cell.isObstacle) return;
    const key = `${cell.c},${cell.r}`;
    setDraftZombieKeys((prev) => {
      const next = new Set(prev);
      const shouldAdd = forceState !== null ? forceState : !next.has(key);
      if (shouldAdd) next.add(key);
      else next.delete(key);
      return next;
    });
    setSaveNotice('');
  };

  const toggleHeroCell = (cell) => {
    if (cell.isBorder || cell.isBase || cell.isObstacle) return;
    setDraftHeroPoints((prev) => {
      const exists = prev.some((p) => p.x === cell.c && p.y === cell.r);
      if (exists) {
        if (prev.length <= 1) return prev; // mantém ao menos 1 ponto de spawn
        return prev.filter((p) => !(p.x === cell.c && p.y === cell.r));
      }
      return [...prev, { x: cell.c, y: cell.r }];
    });
    setSaveNotice('');
  };

  const handleCellMouseDown = (cell) => {
    setSelectedCell(cell);
    if (editMode === 'zombies') {
      if (cell.isBorder || cell.isBase || cell.isObstacle) return;
      const key = `${cell.c},${cell.r}`;
      const nextVal = !draftZombieKeys.has(key);
      setIsDragging(true);
      setDragPaintValue(nextVal);
      toggleZombieCell(cell, nextVal);
    } else if (editMode === 'heroes') {
      toggleHeroCell(cell);
    }
  };

  const handleCellMouseEnter = (cell) => {
    setSelectedCell(cell);
    if (isDragging && editMode === 'zombies') {
      toggleZombieCell(cell, dragPaintValue);
    }
  };

  const handleSave = () => {
    saveCustomZombieSpawns(Array.from(draftZombieKeys));
    saveCustomHeroSpawns(draftHeroPoints);
    if (onApplySpawns) {
      onApplySpawns({
        zombieKeys: Array.from(draftZombieKeys),
        heroPoints: draftHeroPoints,
      });
    }
    setSaveNotice('Respawns de Zumbis e Heróis salvos e aplicados!');
  };

  const handleReset = () => {
    resetCustomZombieSpawns();
    resetCustomHeroSpawns();
    setDraftZombieKeys(buildCurrentZombieSet());
    setDraftHeroPoints([...getEffectiveHeroSpawnPoints()]);
    if (onApplySpawns) {
      onApplySpawns({ reset: true });
    }
    setSaveNotice('Respawns restaurados para o padrão oficial!');
  };

  const lvl = Math.max(1, Math.min(3, Number(houseLevel) || 1));
  const mapBg = `/city_map_lvl${lvl}.webp?v=3`;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden font-tech text-white">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Crosshair size={18} />
            </div>
            <div>
              <h2 className="font-arcade text-sm sm:text-base text-amber-400">
                MAPA DE RESPAWN: ZUMBIS & HERÓIS ({GRID_COLS}×{GRID_ROWS})
              </h2>
              <p className="text-xs text-slate-400">
                Clique nas células livres para editar os pontos de respawn de Zumbis e Heróis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BARRA DE MODO DE EDIÇÃO & AÇÕES */}
        <div className="px-5 py-2.5 bg-slate-950/75 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setEditMode('inspect')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                editMode === 'inspect'
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Eye size={13} />
              <span>Inspecionar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode('zombies');
                setShowZombies(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                editMode === 'zombies'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg'
                  : 'bg-slate-900 border-slate-700 text-emerald-300 hover:border-emerald-500/60'
              }`}
            >
              <Skull size={13} />
              <span>Editar Respawn Zumbis</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode('heroes');
                setShowHeroes(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                editMode === 'heroes'
                  ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg'
                  : 'bg-slate-900 border-slate-700 text-sky-300 hover:border-sky-500/60'
              }`}
            >
              <Shield size={13} />
              <span>Editar Respawn Heróis</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-arcade text-[11px] font-bold transition shadow-lg cursor-pointer"
            >
              <Save size={13} />
              <span>Salvar Respawns</span>
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS / LEGENDAS */}
        <div className="px-5 py-2 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowZombies((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                showZombies
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Skull size={13} />
              <span>Zumbis ({gridAnalysis.zombieZoneCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHeroes((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                showHeroes
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Shield size={13} />
              <span>Heróis ({gridAnalysis.heroValidCount}/{gridAnalysis.heroTotalCount} livres)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowObstacles((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                showObstacles
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Ban size={13} />
              <span>Bloqueios ({gridAnalysis.blockedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLiveEntities((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                showLiveEntities
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Eye size={13} />
              <span>Ao Vivo</span>
            </button>
          </div>

          {saveNotice ? (
            <div className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>{saveNotice}</span>
            </div>
          ) : selectedCell ? (
            <div className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 flex items-center gap-2">
              <MapPin size={13} className="text-amber-400" />
              <span>
                ({selectedCell.c}, {selectedCell.r}) •{' '}
                {selectedCell.isBorder
                  ? 'Borda'
                  : selectedCell.isBase
                    ? 'Base Militar'
                    : selectedCell.isObstacle
                      ? 'Obstáculo'
                      : 'Livre'}
                {selectedCell.isZombieSpawn ? ' • Respawn Zumbi' : ''}
                {selectedCell.heroSpawn
                  ? selectedCell.heroSpawn.blocked
                    ? ' • Spawn Herói (BLOQUEADO!)'
                    : ` • Spawn Herói #${selectedCell.heroSpawn.index}`
                  : ''}
              </span>
            </div>
          ) : null}
        </div>

        {/* CORPO: MAPA + DETALHES */}
        <div className="p-4 sm:p-5 overflow-y-auto grid lg:grid-cols-12 gap-4 items-start">
          {/* GRADE VISUAL 19x14 SOBRE O MAPA */}
          <div className="lg:col-span-8 select-none">
            <div
              className="relative w-full aspect-[19/14] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl"
              style={{
                backgroundImage: `url('${mapBg}')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
              }}
            >
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                }}
              >
                {gridAnalysis.cells.map((cell) => {
                  const isBlocked = cell.isBorder || cell.isBase || cell.isObstacle;
                  let bgClass = 'hover:bg-white/20';

                  if (showObstacles && isBlocked) {
                    bgClass = cell.isBase
                      ? 'bg-rose-900/55 border-rose-500/30 cursor-not-allowed'
                      : 'bg-slate-950/65 border-slate-700/40 cursor-not-allowed';
                  } else if (showZombies && cell.isZombieSpawn) {
                    bgClass = 'bg-emerald-500/35 border-emerald-400/50 hover:bg-emerald-400/50';
                  }

                  return (
                    <button
                      key={`${cell.c},${cell.r}`}
                      type="button"
                      onMouseDown={() => handleCellMouseDown(cell)}
                      onMouseEnter={() => handleCellMouseEnter(cell)}
                      title={`(${cell.c}, ${cell.r})`}
                      className={`relative border border-white/10 flex items-center justify-center text-[9px] sm:text-[10px] font-mono transition ${
                        editMode !== 'inspect' && !isBlocked ? 'cursor-pointer' : 'cursor-crosshair'
                      } ${bgClass}`}
                    >
                      {/* Badge Spawn Herói */}
                      {showHeroes && cell.heroSpawn && (
                        <span
                          className={`px-1 py-0.2 rounded font-bold shadow ${
                            cell.heroSpawn.blocked
                              ? 'bg-red-600 text-white border border-yellow-300'
                              : 'bg-sky-500 text-slate-950 border border-white/60'
                          }`}
                          title={
                            cell.heroSpawn.blocked
                              ? `Spawn Herói #${cell.heroSpawn.index} está em célula bloqueada!`
                              : `Spawn Herói #${cell.heroSpawn.index}`
                          }
                        >
                          H{cell.heroSpawn.index}
                        </span>
                      )}

                      {/* Entidades ao vivo */}
                      {showLiveEntities && cell.liveZombie && (
                        <span
                          className="absolute bottom-0.5 right-0.5 text-[10px] leading-none drop-shadow"
                          title={cell.liveZombie.type === 'boss' ? 'Boss Ativo' : 'Zumbi Ativo'}
                        >
                          {cell.liveZombie.type === 'boss' ? '💀' : '🧟'}
                        </span>
                      )}

                      {showLiveEntities && cell.liveHeroes.length > 0 && (
                        <span
                          className="absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950 shadow"
                          title={`${cell.liveHeroes.length} herói(s) ativo(s) aqui agora`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PAINEL LATERAL DE RESUMO */}
          <div className="lg:col-span-4 space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase">
                <Skull size={15} />
                <span>Respawn de Zumbis ({gridAnalysis.zombieZoneCount})</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {editMode === 'zombies' ? (
                  <span className="text-emerald-300 font-bold">
                    Modo edição ativo: clique ou arraste nas células livres para marcar/desmarcar onde os zumbis nascem.
                  </span>
                ) : (
                  <>
                    Selecione <b>Editar Respawn Zumbis</b> acima para adicionar ou remover células de respawn no mapa.
                  </>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold uppercase">
                  <Shield size={15} />
                  <span>Respawn de Heróis</span>
                </div>
                <span className="font-mono text-[11px] text-sky-300">
                  {gridAnalysis.heroValidCount} livres / {gridAnalysis.heroBlockedCount} bloq.
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {editMode === 'heroes' ? (
                  <span className="text-sky-300 font-bold">
                    Modo edição ativo: clique nas células livres do mapa para adicionar/remover pontos de respawn dos heróis.
                  </span>
                ) : (
                  <>
                    Pontos configurados: <b>{gridAnalysis.heroTotalCount}</b>. Clique em <b>Editar Respawn Heróis</b> para alterar.
                  </>
                )}
              </p>
              <div className="max-h-36 overflow-y-auto grid grid-cols-3 gap-1 pt-1">
                {gridAnalysis.heroPoints.map((pt) => (
                  <button
                    key={`${pt.x},${pt.y}`}
                    type="button"
                    onClick={() => {
                      if (editMode === 'heroes' && draftHeroPoints.length > 1) {
                        setDraftHeroPoints((prev) => prev.filter((p) => !(p.x === pt.x && p.y === pt.y)));
                        setSaveNotice('');
                      }
                    }}
                    title={editMode === 'heroes' ? 'Clique para remover este ponto' : undefined}
                    className={`px-2 py-1 rounded text-[10px] font-mono border text-center transition ${
                      pt.blocked
                        ? 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-sky-300'
                    } ${editMode === 'heroes' ? 'hover:border-rose-400 cursor-pointer' : ''}`}
                  >
                    #{pt.index} ({pt.x},{pt.y})
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              <b className="text-amber-300">Zonas Táticas ({TACTICAL_ZONES.length}):</b> Grade{' '}
              <code className="text-slate-200">{GRID_COLS}×{GRID_ROWS}</code> ({TILE_SIZE}px). Após editar, clique em{' '}
              <b className="text-emerald-300">Salvar Respawns</b> para aplicar imediatamente no mapa.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
