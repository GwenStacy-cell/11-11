import React, { useState } from 'react';
import { X, Smartphone, Share2, Check, ExternalLink, ShieldCheck, Copy, PlusSquare, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose, myPin }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'share'>('install');

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `Join me on 11:11 Live Walkie-Talkie! Add my PIN #${myPin} at ${currentUrl}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
              <Smartphone className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Install 11:11 Walkie</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PWA
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Install to your mobile home screen & lock screen</p>
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
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install App</span>
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
                      You are running <strong>11:11 Live Walkie</strong> in standalone mode. Transmissions play out loud through your speaker even when locked!
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="p-5 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                    <Smartphone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Instant 1-Tap App Install</h3>
                    <p className="text-xs text-zinc-300 mt-1">
                      Install 11:11 directly to your Home Screen without needing an app store!
                    </p>
                  </div>
                  <button
                    onClick={install}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  >
                    <Smartphone className="w-4.5 h-4.5" />
                    <span>Install 11:11 App</span>
                  </button>
                </div>
              ) : null}

              {/* iOS Manual Step Card */}
              {isIOS && !isInstalled && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[11px]">🍎</span>
                    <span>Install on iPhone (Safari)</span>
                  </div>
                  <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside pl-1">
                    <li>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-amber-400" /> at the bottom of Safari.</li>
                    <li>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />.</li>
                    <li>Tap <strong>Add</strong> in the top right corner.</li>
                  </ol>
                </div>
              )}

              {/* Android Guide */}
              {!isIOS && !isInstalled && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[11px]">🤖</span>
                    <span>Install on Android (Chrome)</span>
                  </div>
                  <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside pl-1">
                    <li>Tap the Chrome menu (<strong>⋮</strong> three dots) top right.</li>
                    <li>Select <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li>
                    <li>Tap <strong>Install</strong> to confirm.</li>
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
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Invite Sheet</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
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
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
