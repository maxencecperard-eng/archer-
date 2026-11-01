import React, { useState, useEffect } from 'react';
import { 
  X, Video, CreditCard, Sparkles, CheckCircle2, ShieldCheck, 
  Play, Gift, ArrowRight, Loader2, Coins
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CoinShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantCoins: (amount: number) => void;
  currentCoins: number;
}

export const CoinShopModal: React.FC<CoinShopModalProps> = ({
  isOpen,
  onClose,
  onGrantCoins,
  currentCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'ad' | 'pay'>('ad');
  
  // Ad state
  const [adPlaying, setAdPlaying] = useState(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState(5);
  const [adCompleted, setAdCompleted] = useState(false);

  // Pay state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'card' | 'apple' | 'google'>('card');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adPlaying && adSecondsLeft > 0) {
      timer = setTimeout(() => {
        setAdSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (adPlaying && adSecondsLeft === 0) {
      setAdPlaying(false);
      setAdCompleted(true);
      soundManager.playLevelUp();
    }
    return () => clearTimeout(timer);
  }, [adPlaying, adSecondsLeft]);

  if (!isOpen) return null;

  const handleStartAd = () => {
    soundManager.playClick();
    setAdCompleted(false);
    setAdSecondsLeft(5);
    setAdPlaying(true);
  };

  const handleClaimAdReward = () => {
    soundManager.playCoin();
    onGrantCoins(500);
    setAdCompleted(false);
    onClose();
  };

  const handlePay2Euros = () => {
    soundManager.playClick();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      soundManager.playLevelUp();
      soundManager.playCoin();
      setTimeout(() => {
        onGrantCoins(500);
        setPaymentSuccess(false);
        onClose();
      }, 1200);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 p-6 flex flex-col gap-5 overflow-hidden">
        {/* Glow ambient header */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Modal Close Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            if (!adPlaying) onClose();
          }}
          disabled={adPlaying}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider uppercase">
            <Coins className="w-3.5 h-3.5" />
            <span>Banque d'Or • Obtenir +500 Pièces</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            RECHARGE DE PIÈCES D'OR
          </h2>
          <p className="text-xs text-slate-400">
            Pour débloquer instantanément les héros légendaires et leur armement.
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Solde actuel en trésor :</span>
          <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-lg">
            <span>🪙</span>
            <span>{currentCoins}</span>
          </div>
        </div>

        {/* Two Options Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              if (adPlaying) return;
              soundManager.playClick();
              setActiveTab('ad');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ad'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Regarder une Pub (Gratuit)</span>
          </button>
          <button
            onClick={() => {
              if (adPlaying) return;
              soundManager.playClick();
              setActiveTab('pay');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pay'
                ? 'bg-indigo-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payer 2,00 € (Direct)</span>
          </button>
        </div>

        {/* Tab 1: Video Ad Flow */}
        {activeTab === 'ad' && (
          <div className="bg-slate-950/80 rounded-2xl border border-amber-500/30 p-5 flex flex-col items-center text-center gap-4">
            {!adPlaying && !adCompleted && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                  <Gift className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="font-black text-white text-base">Vidéo Promotionnelle Courte</div>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Regardez une vidéo courte de 5 secondes pour débloquer immédiatement votre prime de <span className="text-amber-400 font-bold">+500 pièces</span> !
                  </p>
                </div>
                <button
                  onClick={handleStartAd}
                  className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Lancer la Pub (5 sec) &amp; Gagner +500 🪙</span>
                </button>
              </>
            )}

            {/* Ad playing screen */}
            {adPlaying && (
              <div className="w-full flex flex-col items-center gap-3 py-2">
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex flex-col items-center justify-center">
                  {/* Fake game trailer canvas animation */}
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 flex flex-col items-center justify-center p-4">
                    <div className="animate-bounce text-4xl mb-2">🏹 💥 👾</div>
                    <div className="text-xs font-black tracking-widest text-amber-300 uppercase">
                      PUBLICITÉ SPONSORISÉE • NOUVEAU BLASTER VIOLET
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Explorez l'arène Archero 2 avec de superbes pouvoirs !
                    </div>
                  </div>

                  {/* Countdown pill */}
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-950/80 border border-amber-400/60 text-amber-300 font-mono font-black text-xs flex items-center gap-1.5 shadow">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Récompense dans {adSecondsLeft}s</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - adSecondsLeft) / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400">Ne fermez pas la fenêtre pendant la publicité.</span>
              </div>
            )}

            {/* Ad finished, claim reward */}
            {adCompleted && (
              <div className="w-full flex flex-col items-center gap-3 py-2 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-black text-emerald-400">Publicité terminée !</div>
                  <p className="text-xs text-slate-300">Votre bonus de 500 pièces est prêt à être encaissé.</p>
                </div>
                <button
                  onClick={handleClaimAdReward}
                  className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Récupérer +500 Pièces d'Or 🪙</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pay 2€ Flow */}
        {activeTab === 'pay' && (
          <div className="bg-slate-950/80 rounded-2xl border border-indigo-500/30 p-5 flex flex-col gap-4">
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="text-lg font-black text-emerald-400">Paiement Réussi !</div>
                <div className="text-xs text-slate-300">+500 pièces d'or créditées à votre compte.</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                      🪙
                    </div>
                    <div>
                      <div className="font-black text-white text-sm">Pack Héros : 500 Pièces</div>
                      <div className="text-[11px] text-slate-400">Crédit instantané permanent</div>
                    </div>
                  </div>
                  <div className="font-mono font-black text-lg text-emerald-400">
                    2,00 €
                  </div>
                </div>

                {/* Simulated payment selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Moyen de Paiement Sécurisé :
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedPayMethod === 'card'
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Carte Bancaire</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('apple')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedPayMethod === 'apple'
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span></span>
                      <span>Apple Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('google')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedPayMethod === 'google'
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-black text-xs">G</span>
                      <span>Google Pay</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Transaction sécurisée chiffrée SSL 256 bits (environnement de simulation).</span>
                </div>

                <button
                  disabled={isProcessingPayment}
                  onClick={handlePay2Euros}
                  className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Traitement sécurisé du paiement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmer et Payer 2,00 € • Obtenir 500 🪙</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
