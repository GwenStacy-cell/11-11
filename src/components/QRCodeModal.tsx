import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Scan, Copy, Check, Sparkles, UserPlus, Camera, RefreshCw } from 'lucide-react';
import { audioEngine } from '../utils/audioEffects';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  userName: string;
  onAddFriend: (name: string, pin: string) => void;
  targetFriend?: { name: string; pin: string } | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  myPin,
  userName,
  onAddFriend,
  targetFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'my-code' | 'scanner'>('my-code');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const displayPin = targetFriend ? targetFriend.pin : myPin;
  const displayName = targetFriend ? targetFriend.name : userName;

  // Generate QR Code data URL
  useEffect(() => {
    if (!isOpen) return;

    const payload = JSON.stringify({
      app: '11:11',
      pin: displayPin,
      name: displayName,
      time: Date.now(),
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [isOpen, displayPin, displayName]);

  // Handle camera for scanner tab
  useEffect(() => {
    if (isOpen && activeTab === 'scanner') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access error or denied:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(displayPin);
    setCopied(true);
    audioEngine.playPokeSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = (friendName: string, friendPin: string) => {
    audioEngine.playPokeSound();
    onAddFriend(friendName, friendPin);
    setScanSuccessMsg(`Successfully added ${friendName} (#${friendPin}) to your Walkie Circle!`);
    setTimeout(() => {
      setScanSuccessMsg('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Switcher */}
        <div className="w-full flex items-center p-1 bg-zinc-950 rounded-2xl border border-zinc-800 mb-5">
          <button
            onClick={() => setActiveTab('my-code')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'my-code'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{targetFriend ? `${targetFriend.name}'s QR` : 'My QR Code'}</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'scanner'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* TAB 1: Display QR Code */}
        {activeTab === 'my-code' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            <div className="text-center mb-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <span>{displayName}'s 11:11 Walkie QR</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Scan with any phone camera to instantly connect
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-3xl shadow-2xl border-4 border-amber-400/80 relative flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Walkie PIN QR Code"
                  className="w-56 h-56 rounded-xl object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-zinc-600">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}

              {/* 11:11 Logo in center of QR */}
              <div className="absolute w-10 h-10 rounded-xl bg-zinc-950 border-2 border-amber-400 flex items-center justify-center font-black text-xs text-amber-400 shadow-md">
                11:11
              </div>
            </div>

            {/* PIN Code Display & Copy */}
            <div className="mt-4 w-full p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Walkie PIN
                </span>
                <span className="text-lg font-mono font-black text-amber-400">
                  #{displayPin}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 border border-zinc-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy PIN'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: QR Scanner */}
        {activeTab === 'scanner' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            <div className="text-center mb-3">
              <h3 className="text-sm font-bold text-white">Scan Friend's QR Code</h3>
              <p className="text-[11px] text-zinc-400">
                Point your camera at a friend's 11:11 QR code
              </p>
            </div>

            {/* Viewfinder View */}
            <div className="relative w-56 h-56 bg-zinc-950 rounded-3xl border-2 border-amber-500/60 overflow-hidden shadow-2xl flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-zinc-500 text-xs">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-400" />
                  <span>Camera Viewfinder</span>
                </div>
              )}

              {/* Laser scanning line animation */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-bounce shadow-lg shadow-amber-400" />

              {/* Viewfinder Corner Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
            </div>

            {scanSuccessMsg ? (
              <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center text-xs font-bold text-emerald-400 animate-in fade-in">
                {scanSuccessMsg}
              </div>
            ) : (
              /* Quick Simulation Buttons to instantly test QR scanning */
              <div className="mt-4 w-full">
                <span className="text-[10px] text-zinc-400 font-semibold block text-center mb-2">
                  ⚡ Quick Test Instant QR Scans:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleSimulateScan('Samira', '9241')}
                    className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-[11px] font-semibold text-white flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <UserPlus className="w-3 h-3 text-amber-400" />
                    <span>Scan Samira (#9241)</span>
                  </button>
                  <button
                    onClick={() => handleSimulateScan('Kai', '4108')}
                    className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-[11px] font-semibold text-white flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <UserPlus className="w-3 h-3 text-emerald-400" />
                    <span>Scan Kai (#4108)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
