import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  X,
  QrCode,
  Scan,
  Copy,
  Check,
  Camera,
  RefreshCw,
  Share2,
  Image as ImageIcon,
  RotateCcw,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEffects';
import { parseQrContent } from '../utils/qrParser';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  userName: string;
  onAddFriend: (name: string, pin: string) => void;
  targetFriend?: { name: string; pin: string } | null;
  onShareApp?: () => void;
  initialTab?: 'my-code' | 'scanner';
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  myPin,
  userName,
  onAddFriend,
  targetFriend,
  onShareApp,
  initialTab = 'my-code',
}) => {
  const [activeTab, setActiveTab] = useState<'my-code' | 'scanner'>(initialTab);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');
  const [isProcessingGallery, setIsProcessingGallery] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayPin = targetFriend ? targetFriend.pin : myPin;
  const displayName = targetFriend ? targetFriend.name : userName;

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCameraError(null);
      setScanSuccessMsg('');
    }
  }, [isOpen, initialTab]);

  // Generate QR Code data URL for "My QR Code" tab
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

  // Start/Stop Camera for Scanner tab
  useEffect(() => {
    if (isOpen && activeTab === 'scanner') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (currentFacing: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported on this browser or requires HTTPS.');
      return;
    }

    let stream: MediaStream | null = null;
    try {
      // 1. First attempt: preferred facingMode
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: currentFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn('Preferred camera facing mode failed, attempting generic fallback:', err1);
      try {
        // 2. Generic fallback: any available video device
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err2: any) {
        console.error('All camera attempts failed:', err2);
        setCameraActive(false);
        if (err2?.name === 'NotAllowedError' || err2?.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Please allow camera permissions in browser settings, or use Gallery scanning below.');
        } else if (err2?.name === 'NotFoundError' || err2?.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. You can scan a QR code from your photo gallery.');
        } else {
          setCameraError('Could not open camera. Please tap "Scan QR from Gallery Photo" below.');
        }
        return;
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video play interrupted:', e);
        }
      }
      setCameraActive(true);
      startLiveQrScanning();
    }
  };

  // Continuous frame scanning loop with jsQR
  const startLiveQrScanning = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isFinished = false;

    const tick = () => {
      if (!mediaStreamRef.current || isFinished) return;

      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
              const parsed = parseQrContent(code.data);
              if (parsed && parsed.pin) {
                isFinished = true;
                handleQrDetected(parsed.pin, parsed.name);
                return;
              }
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  // Gallery photo upload & decode
  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value so user can re-pick same image if needed
    e.target.value = '';

    setIsProcessingGallery(true);
    setScanSuccessMsg('');
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setIsProcessingGallery(false);
          setCameraError('Unable to initialize image processor.');
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        setIsProcessingGallery(false);

        if (code && code.data) {
          const parsed = parseQrContent(code.data);
          if (parsed && parsed.pin) {
            handleQrDetected(parsed.pin, parsed.name);
          } else {
            setCameraError(`QR code found, but no 4-digit PIN was identified: "${code.data.slice(0, 32)}..."`);
          }
        } else {
          setCameraError('No QR code detected in this photo. Please choose a clear, uncropped photo or screenshot of the QR code.');
        }
      };
      img.onerror = () => {
        setIsProcessingGallery(false);
        setCameraError('Could not load image file from gallery.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingGallery(false);
      setCameraError('Failed to read file from gallery.');
    };
    reader.readAsDataURL(file);
  };

  // Successful QR code detection
  const handleQrDetected = (pin: string, name?: string) => {
    const cleanPin = pin.replace(/[^0-9]/g, '').trim();
    if (cleanPin === myPin) {
      setCameraError("That is your own QR code! Scan a friend's code to connect.");
      return;
    }

    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // ignore
    }

    audioEngine.playPokeSound();
    const friendName = name?.trim() || `User #${cleanPin}`;
    setScanSuccessMsg(`Scanned #${cleanPin}! Sending friend request...`);
    onAddFriend(friendName, cleanPin);

    stopCamera();

    setTimeout(() => {
      setScanSuccessMsg(`Friend request sent to ${friendName}!`);
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 1200);
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(displayPin);
    setCopied(true);
    audioEngine.playPokeSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Switcher */}
        <div className="w-full flex items-center p-1 bg-zinc-950 rounded-2xl border border-zinc-800 mb-5">
          <button
            onClick={() => setActiveTab('my-code')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'my-code'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{targetFriend ? `${targetFriend.name}'s QR` : 'My QR Code'}</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* TAB 1: My QR Code */}
        {activeTab === 'my-code' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            <div className="text-center mb-3">
              <h3 className="text-sm font-bold text-white">
                {targetFriend ? `${targetFriend.name}'s PIN Card` : 'Your Walkie PIN Card'}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Scan with camera or upload photo to connect instantly
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-3xl shadow-xl border-2 border-indigo-500/40 relative flex items-center justify-center">
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
              <div className="absolute w-10 h-10 rounded-xl bg-zinc-950 border-2 border-indigo-400 flex items-center justify-center font-black text-xs text-indigo-400 shadow-md">
                11:11
              </div>
            </div>

            {/* PIN Code Display & Copy */}
            <div className="mt-4 w-full p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Walkie PIN
                </span>
                <span className="text-lg font-mono font-black text-indigo-400">
                  #{displayPin}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 border border-zinc-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy PIN'}</span>
              </button>
            </div>

            {/* Share App Button */}
            {onShareApp && (
              <button
                onClick={onShareApp}
                className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Walkie Link & PIN #{displayPin}</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: QR Scanner (Camera + Gallery) */}
        {activeTab === 'scanner' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            <div className="text-center mb-3">
              <h3 className="text-sm font-bold text-white">Scan Friend's QR Code</h3>
              <p className="text-[11px] text-zinc-400">
                Point camera at code or pick a photo from gallery
              </p>
            </div>

            {/* Viewfinder View */}
            <div className="relative w-56 h-56 bg-zinc-950 rounded-3xl border-2 border-indigo-500/50 overflow-hidden shadow-2xl flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-zinc-500 text-xs flex flex-col items-center justify-center h-full">
                  <Camera className="w-10 h-10 mb-2 opacity-40 text-indigo-400" />
                  <span>{cameraError ? 'Camera unavailable' : 'Starting camera...'}</span>
                  {!cameraActive && (
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="mt-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-[11px] font-semibold rounded-lg border border-zinc-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Camera</span>
                    </button>
                  )}
                </div>
              )}

              {/* Laser scanning bar animation when active */}
              {cameraActive && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-bounce shadow-lg shadow-indigo-400" />
              )}

              {/* Camera flip toggle button */}
              {cameraActive && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 shadow-md backdrop-blur-sm transition-all cursor-pointer"
                  title="Switch Front/Rear Camera"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Viewfinder Corner Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-indigo-400 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-indigo-400 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-indigo-400 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-indigo-400 pointer-events-none" />
            </div>

            {/* Error Message */}
            {cameraError && (
              <div className="mt-3 w-full p-2.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-[11px] text-rose-300 flex items-start gap-1.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-snug">{cameraError}</span>
              </div>
            )}

            {/* Success Message */}
            {scanSuccessMsg && (
              <div className="mt-3 w-full p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{scanSuccessMsg}</span>
              </div>
            )}

            {/* Gallery Upload Option ("and it should also scanned from gallery add that option also") */}
            <div className="w-full mt-4 pt-3 border-t border-zinc-800">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleGalleryFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingGallery}
                className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isProcessingGallery ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Scanning photo from gallery...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <span>Scan QR from Gallery Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
