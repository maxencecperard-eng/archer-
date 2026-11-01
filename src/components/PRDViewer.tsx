import React, { useState } from 'react';
import { PRD_MARKDOWN, ENHANCED_PROMPT } from '../data/prdContent';
import { ALL_SKILLS } from '../data/skills';
import { 
  FileText, Terminal, Copy, Check, Download, Zap, Shield, 
  Flame, Skull, Crosshair, Sparkles, BookOpen 
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PRDViewerProps {
  onBackToGame: () => void;
}

export const PRDViewer: React.FC<PRDViewerProps> = ({ onBackToGame }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'prd' | 'skills'>('prompt');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedPrd, setCopiedPrd] = useState(false);

  const handleCopyPrompt = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(ENHANCED_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyPrd = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(PRD_MARKDOWN);
    setCopiedPrd(true);
    setTimeout(() => setCopiedPrd(false), 2000);
  };

  const handleDownloadPrd = () => {
    soundManager.playClick();
    const blob = new Blob([PRD_MARKDOWN], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ARCHERO_2_PRD.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navbar */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Documentation PRD &amp; Prompt Optimisé</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Archero 2
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Spécifications fonctionnelles, prompt enrichi et matrice des compétences
            </p>
          </div>
        </div>

        {/* Tab Switcher & Return to Game */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('prompt');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'prompt'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Prompt Optimisé</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('prd');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'prd'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document PRD</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('skills');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Compétences ({ALL_SKILLS.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onBackToGame();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <span>🎮 Jouer au Jeu</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
        {/* TAB 1: ENHANCED PROMPT */}
        {activeTab === 'prompt' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Prompt Amélioré Prêt à l'Emploi</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Issu de la transcription et de la structuration professionnelle du brief initial.
                  </p>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrompt ? 'Copié dans le presse-papier !' : 'Copier le Prompt'}</span>
                </button>
              </div>

              {/* Comparison badge */}
              <div className="my-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                  Améliorations apportées par rapport au texte original :
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Précision de la mécanique "Stutter-step" (Stop-to-shoot)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Physique magnétique des orbes d'XP et jauge Archero HUD</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Système de spin et de draft à 3 compétences pondérées</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Spécifications claires des types d'ennemis et du Boss</span>
                  </li>
                </ul>
              </div>

              {/* Formatted Code Block */}
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-800 overflow-x-auto">
                {ENHANCED_PROMPT}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: PRD COMPLETE DOCUMENT */}
        {activeTab === 'prd' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Product Requirements Document (PRD)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Document complet de conception logicielle et de game design
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPrd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
                >
                  {copiedPrd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrd ? 'Copié !' : 'Copier'}</span>
                </button>
                <button
                  onClick={handleDownloadPrd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .MD</span>
                </button>
              </div>
            </div>

            {/* Rendered PRD content */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-sm bg-transparent p-0 border-0">
                {PRD_MARKDOWN}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS AND BESTIARY */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Matrice des Compétences &amp; Synergies Archero 2</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Catalogue complet des perks implémentés dans le moteur de jeu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_SKILLS.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3.5 hover:border-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-white">
                        {skill.nameFr}{' '}
                        <span className="text-xs font-normal text-slate-400">({skill.name})</span>
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                        {skill.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {skill.descriptionFr}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-500 font-mono">
                      Catégorie : <span className="text-slate-400 uppercase">{skill.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
