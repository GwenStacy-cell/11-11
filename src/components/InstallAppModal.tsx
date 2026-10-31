import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Share2,
  Check,
  ShieldCheck,
  Copy,
  PlusSquare,
  Share,
  Download,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { audioEngine } from '../utils/audioEffects';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose, myPin }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'share'>('install');
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleDownloadAndInstall = async () => {
    audioEngine.playPokeSound();
    setDownloadTriggered(true);

    if (isInstallable) {
      try {
        const success = await install();
        if (success) {
          onClose();
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }

    if (isIOS) {
      alert('To install directly on iPhone: Tap the Share button at the bottom of Safari, then choose "Add to Home Screen".');
    } else {
      // Android / Chrome
      alert('To install directly on Android: Tap Chrome menu (three dots ⋮) at top right, then choose "Install app" or "Add to Home screen".');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `Join me on 11:11 Live Walkie-Talkie! Add my PIN #${myPin} at ${currentUrl}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      audioEngine.playPokeSound();
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '11:11 Live Walkie-Talkie',
          text: `Join my live 11:11 walkie channel! My friend PIN is #${myPin}`,
          url: currentUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/40 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center font-black text-black shadow-lg shadow-amber-500/20">
              <Download className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Download 11:11 Walkie</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Vercel Live
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Download directly to your phone & lock screen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1 gap-1 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download App</span>
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'share'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite Friends</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Standalone Installed Notice */}
              {isInstalled ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">App Already Installed!</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      You are running <strong>11:11 Live Walkie</strong> in standalone mode. Incoming voice plays aloud directly through your phone speaker even when screen is locked!
                    </p>
                  </div>
                </div>
              ) : (
                /* Primary Direct Download Box from Vercel */
                <div className="p-5 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/40 rounded-3xl text-center space-y-3.5 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black font-black flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                    <Download className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-base font-extrabold text-white">Direct Vercel App Download</h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Vercel PWA
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Download and install 11:11 directly from Vercel to your home screen with zero app store hassle!
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadAndInstall}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                  >
                    <Download className="w-4.5 h-4.5 text-zinc-950" />
                    <span>Download / Install 11:11 App</span>
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Install
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Free & Safe
                    </span>
                  </div>
                </div>
              )}

              {/* iOS Manual Step Card */}
              {isIOS && !isInstalled && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[11px]">🍎</span>
                    <span>Install on iPhone (Safari)</span>
                  </div>
                  <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside pl-1">
                    <li>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" /> at the bottom of Safari.</li>
                    <li>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />.</li>
                    <li>Tap <strong>Add</strong> in the top right corner.</li>
                    <li>Open 11:11 from your home screen — audio will play continuously even when your phone is locked!</li>
                  </ol>
                </div>
              )}

              {/* Android Guide */}
              {!isIOS && !isInstalled && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[11px]">🤖</span>
                    <span>Install on Android (Chrome / Samsung)</span>
                  </div>
                  <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside pl-1">
                    <li>Tap the Chrome menu (<strong>⋮</strong> three dots) in the top right.</li>
                    <li>Select <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li>
                    <li>Tap <strong>Install</strong> to confirm.</li>
                    <li>11:11 will be added to your app drawer & home screen with lock screen widget!</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl">
                <div className="text-xs font-semibold text-zinc-400">YOUR WALKIE PIN CODE</div>
                <div className="text-3xl font-black font-mono text-amber-400 mt-1">#{myPin}</div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Friends need this 4-digit code to connect and speak to your walkie.
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleNativeShare}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Invite Sheet</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
