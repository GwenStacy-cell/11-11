import React, { useState } from 'react';
import { X, Download, Smartphone, Share2, Check, ExternalLink, QrCode, Sparkles, ShieldCheck, Radio, Copy } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose, myPin }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'source' | 'share' | 'hosting'>('source');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/11-11-walkie-talkie-source.zip', { cache: 'no-store' });
      if (!res.ok) throw new Error('Download request failed');
      const blob = await res.blob();
      const zipBlob = new Blob([blob], { type: 'application/zip' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = '11-11-walkie-talkie-source.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error('Blob download fallback:', err);
      window.location.href = '/11-11-walkie-talkie-source.zip';
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
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
          text: `Join my live 11:11 walkie channel! My friend PIN is ${myPin}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/40 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center font-black text-black shadow-lg shadow-amber-500/20">
              <Download className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Download & Export App</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Download source ZIP for GitHub or install as app</p>
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
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1 gap-1 text-[11px] font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('source')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'source'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Code ZIP</span>
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'install'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1-Tap App</span>
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'share'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'hosting'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>GitHub Guide</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/40 rounded-3xl text-center space-y-3 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black font-black flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                  <Download className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1-Click Full Codebase ZIP</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Download the complete, self-contained project source code directly to your PC or phone.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Download className={`w-4.5 h-4.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'Preparing ZIP File...' : 'Download 11-11-walkie-talkie-source.zip'}</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>What is inside this ZIP package?</span>
                </div>
                <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                  <li>Complete React 19 + TypeScript + Vite project</li>
                  <li>Tailwind v4 CSS styling + Live Audio Engine</li>
                  <li>All PWA icons (192, 512, maskable, iOS apple-touch)</li>
                  <li><code>README.md</code> with full GitHub upload guide</li>
                  <li>Pre-configured <code>package.json</code> & <code>vite.config.ts</code></li>
                </ul>
              </div>

              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-[11px] text-zinc-400">
                <span className="font-bold text-zinc-200">How to extract:</span> Unzip the downloaded file, open your terminal in the extracted folder, run <code className="text-amber-300">npm install</code>, then <code className="text-amber-300">npm run dev</code>.
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Standalone Installed Notice */}
              {isInstalled ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">App Already Installed!</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      You are running <strong>11:11 Live Walkie</strong> in standalone mode. It works directly from your home screen just like a native app!
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="p-5 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                    <Download className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Instant 1-Tap App Download</h3>
                    <p className="text-xs text-zinc-300 mt-1">
                      Install 11:11 directly to your Home Screen / Desktop app launcher with no app store required!
                    </p>
                  </div>
                  <button
                    onClick={install}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install 11:11 Walkie App Now</span>
                  </button>
                </div>
              ) : isIOS ? (
                <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                    <Smartphone className="w-5 h-5" />
                    <span>How to Install on iPhone / iPad (iOS Safari)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Apple iOS Safari requires adding to Home Screen manually:
                  </p>
                  <ol className="space-y-2 text-xs text-zinc-300 list-decimal list-inside pl-1 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                    <li>Tap the <strong className="text-white">Share button</strong> (square with arrow) at bottom of Safari.</li>
                    <li>Scroll down and select <strong className="text-amber-400">Add to Home Screen</strong>.</li>
                    <li>Tap <strong className="text-white">Add</strong> in the top right corner.</li>
                  </ol>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>The app icon will appear right on your iPhone home screen!</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                    <ExternalLink className="w-5 h-5" />
                    <span>Desktop / Chrome / Android Setup</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    You can install 11:11 Walkie in 2 easy steps:
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                    <li>In Chrome/Edge: Click the <strong className="text-amber-400">Install icon (⊕)</strong> in the URL bar.</li>
                    <li>On Android: Open browser menu (⋮) and tap <strong className="text-amber-400">Install app</strong> or <strong className="text-white font-semibold">Add to Home screen</strong>.</li>
                  </ul>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-left pt-2">
                <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Instant Audio</div>
                  <p className="text-[11px] text-zinc-300">Push-to-talk voice broadcast with real-time volume rings.</p>
                </div>
                <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">QR PIN Connect</div>
                  <p className="text-[11px] text-zinc-300">Scan camera QR code to instantly add friends on walkie.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-center space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Personal PIN</span>
                <div className="text-3xl font-black font-mono tracking-widest text-amber-400">
                  {myPin}
                </div>
                <p className="text-xs text-zinc-400">
                  Share this 4-digit PIN or link with your friends to connect on 11:11 Walkie.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">App Link to Send Friends:</label>
                <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="bg-transparent text-xs text-zinc-300 px-2 flex-1 focus:outline-none font-mono truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleNativeShare}
                className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition border border-zinc-700"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Share Via WhatsApp / SMS / Socials</span>
              </button>
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  <span>How 11:11 Communication Works</span>
                </h4>
                <p className="leading-relaxed">
                  11:11 is built as a progressive web application. When you open this web link, all friends connected to the same web app or PINs can talk to each other live!
                </p>
              </div>

              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-xs">Hosting & Sharing Options:</h4>
                <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
                  <li><strong className="text-zinc-200">AI Studio Preview Link:</strong> Share the app preview URL directly with your friends so everyone opens the same app.</li>
                  <li><strong className="text-zinc-200">Deploy to Web / Netlify / Vercel:</strong> Run <code className="text-amber-300 font-mono text-[10px]">npm run build</code> and deploy the <code className="text-amber-300 font-mono text-[10px]">dist/</code> folder to any static hosting provider.</li>
                  <li><strong className="text-zinc-200">Cross-Tab Multi-Window Test:</strong> Open 2 browser windows on your screen right now to test sending voice back and forth!</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] text-zinc-500 font-mono">
            PWA Standard v1.0 • 11:11 Walkie
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
