import React, { useState } from 'react';
import { GAME_ASSETS, GameAsset } from '../data/assets';
import { 
  Crosshair, Shield, Zap, Search, Package, Sparkles, 
  Check, ArrowRight, Layers, Eye 
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface AssetGalleryProps {
  activeBlasterId: string;
  onSelectBlaster: (blaster: GameAsset) => void;
  onBackToGame: () => void;
}

export const AssetGallery: React.FC<AssetGalleryProps> = ({
  activeBlasterId,
  onSelectBlaster,
  onBackToGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAsset, setPreviewAsset] = useState<GameAsset | null>(null);

  const categories = [
    { id: 'all', label: 'Tous les Assets', count: GAME_ASSETS.length },
    { id: 'blaster', label: 'Blasters & Armes (18)', count: GAME_ASSETS.filter((a) => a.category === 'blaster').length },
    { id: 'ammo', label: 'Projectiles & Fléchettes (4)', count: GAME_ASSETS.filter((a) => a.category === 'ammo').length },
    { id: 'crate', label: 'Caisses & Décors (3)', count: GAME_ASSETS.filter((a) => a.category === 'crate').length },
    { id: 'mod', label: 'Lunettes & Silencieux (7)', count: GAME_ASSETS.filter((a) => a.category === 'mod').length },
    { id: 'target_explosive', label: 'Cibles & Grenades (8)', count: GAME_ASSETS.filter((a) => a.category === 'target_explosive').length },
  ];

  const filteredAssets = GAME_ASSETS.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-md">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Répertoire &amp; Galerie des Assets</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                40 Fichiers Inclus
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Dossier physique : <code className="text-amber-300 font-mono">/Assets</code>
            </p>
          </div>
        </div>

        {/* Action button: Return to game */}
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToGame();
          }}
          className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <span>🎮 Retour au Combat</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un asset..."
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filteredAssets.map((asset) => {
            const isEquipped = asset.id === activeBlasterId;
            const isBlaster = asset.category === 'blaster';

            return (
              <div
                key={asset.id}
                onClick={() => setPreviewAsset(asset)}
                className={`group relative rounded-xl bg-slate-900/90 border-2 p-3 flex flex-col items-center justify-between transition-all duration-200 hover:scale-103 cursor-pointer ${
                  isEquipped
                    ? 'border-amber-400 shadow-lg shadow-amber-500/20 bg-slate-800/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Active Equipped Badge */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" />
                    <span>Équipé</span>
                  </div>
                )}

                {/* Category Pill */}
                <div className="w-full flex justify-start mb-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                    {asset.category}
                  </span>
                </div>

                {/* Asset Image Preview */}
                <div className="w-20 h-20 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center p-2 my-1 shadow-inner group-hover:border-slate-600 transition-colors overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </div>

                {/* Title */}
                <div className="w-full text-center mt-2">
                  <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-300">
                    {asset.nameFr}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate font-mono">
                    {asset.filename}
                  </p>
                </div>

                {/* Equip Button if Blaster */}
                {isBlaster && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playClick();
                      onSelectBlaster(asset);
                    }}
                    className={`mt-2.5 w-full py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                    }`}
                  >
                    {isEquipped ? 'Arme Active' : 'Équiper Blaster'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-24 h-24 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 shadow-inner">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-lg"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {previewAsset.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {previewAsset.nameFr}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {previewAsset.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {previewAsset.descriptionFr}
            </p>

            <div className="space-y-1.5 text-xs font-mono text-slate-400 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500">Chemin : </span>
                <span className="text-amber-300">{previewAsset.url}</span>
              </div>
              <div>
                <span className="text-slate-500">Fichier : </span>
                <span className="text-slate-300">{previewAsset.filename}</span>
              </div>
            </div>

            {previewAsset.category === 'blaster' && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onSelectBlaster(previewAsset);
                  setPreviewAsset(null);
                }}
                className="w-full py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Équiper ce Blaster en Jeu
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
