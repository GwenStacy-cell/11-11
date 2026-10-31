import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');
  const [isProcessingGallery, setIsProcessingGallery] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayPin = targetFriend ? targetFriend.pin : myPin;
  const displayName = targetFriend ? targetFriend.name : userName;

  // Callback ref so we attach the stream immediately when the video DOM element mounts
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && mediaStreamRef.current) {
      if (node.srcObject !== mediaStreamRef.current) {
        node.srcObject = mediaStreamRef.current;
      }
      node.play().catch((e) => console.warn('Video play interrupted:', e));
    }
  }, []);

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

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraStarting(false);
  }, []);

  // Continuous frame scanning loop with jsQR
  const startLiveQrScanning = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isFinished = false;
    let lastScanTime = 0;

    const tick = (now: number) => {
      if (!mediaStreamRef.current || isFinished) return;

      const video = videoRef.current;
      // Scan every ~120ms to save CPU and battery
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && now - lastScanTime > 120) {
        lastScanTime = now;
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        if (vw > 0 && vh > 0) {
          // Downscale high-res video (e.g. 1080p/4K) to max 640px for blazing fast decoding
          const scale = Math.min(1, 640 / Math.max(vw, vh));
          const sw = Math.round(vw * scale);
          const sh = Math.round(vh * scale);
          canvas.width = sw;
          canvas.height = sh;

          if (ctx) {
            ctx.drawImage(video, 0, 0, sw, sh);
            const imageData = ctx.getImageData(0, 0, sw, sh);
            const code = jsQR(imageData.data, sw, sh, {
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
  }, []);

  const startCamera = useCallback(
    async (currentFacing: 'environment' | 'user' = facingMode) => {
      stopCamera();
      setCameraError(null);
      setCameraStarting(true);

      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        setCameraStarting(false);
        setCameraError('Camera is not supported on this browser or requires a secure HTTPS connection.');
        return;
      }

      // Check permission state if supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (perm.state === 'denied') {
            setCameraStarting(false);
            setCameraError('Camera access is blocked in browser settings. Please allow camera permissions or upload from gallery below.');
            return;
          }
        } catch {
          // Permissions query not supported on some mobile browsers (e.g. iOS Safari)
        }
      }

      const tryConstraints: MediaStreamConstraints[] = [
        // 1. Ideal facingMode
        { video: { facingMode: { ideal: currentFacing } }, audio: false },
        // 2. Exact facingMode
        { video: { facingMode: currentFacing }, audio: false },
        // 3. Fallback to generic video
        { video: true, audio: false },
      ];

      let stream: MediaStream | null = null;
      let lastError: any = null;

      for (const constraint of tryConstraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) break;
        } catch (err: any) {
          lastError = err;
          console.warn('Camera constraint attempt failed:', constraint, err);
        }
      }

      setCameraStarting(false);

      if (stream) {
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn('Video play error:', e);
          }
        }
        setCameraActive(true);
        startLiveQrScanning();
      } else {
        setCameraActive(false);
        if (lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Please allow camera permissions in your browser or phone settings, or scan from Gallery below.');
        } else if (lastError?.name === 'NotFoundError' || lastError?.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. You can scan a QR code from your photo gallery.');
        } else if (lastError?.name === 'NotReadableError' || lastError?.name === 'TrackStartError') {
          setCameraError('Camera is in use by another app or browser tab. Please close other camera apps and tap "Start Camera".');
        } else {
          setCameraError((lastError?.message || 'Could not open camera.') + ' Please tap "Scan QR from Gallery Photo" below.');
        }
      }
    },
    [facingMode, stopCamera, startLiveQrScanning]
  );

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
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Gallery photo upload & decode
  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value so user can re-pick same image if needed
    e.target.value = '';

    setIsProcessingGallery(true);
    setScanSuccessMsg('');
    setCameraError(null);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Downscale large photos (e.g. 12MP/48MP phone captures) to max 1200px for speed and accuracy
        const MAX_SIZE = 1200;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setIsProcessingGallery(false);
          setCameraError('Unable to process photo on this device.');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, width, height, {
          inversionAttempts: 'attemptBoth',
        });

        setIsProcessingGallery(false);

        if (code && code.data) {
          const parsed = parseQrContent(code.data);
          if (parsed && parsed.pin) {
            handleQrDetected(parsed.pin, parsed.name);
          } else {
            setCameraError(`QR code found, but no 4-digit PIN was recognized in it: "${code.data.slice(0, 32)}..."`);
          }
        } else {
          setCameraError('No QR code detected in this photo. Please choose a clear, uncropped photo or screenshot containing the QR code.');
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setIsProcessingGallery(false);
        setCameraError('Could not load photo from gallery. Please try another image.');
      };

      img.src = objectUrl;
    } catch {
      setIsProcessingGallery(false);
      setCameraError('Failed to read image file from gallery.');
    }
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
            onClick={() => {
              setActiveTab('scanner');
              startCamera(facingMode);
            }}
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
            <div className="relative w-64 h-64 bg-zinc-950 rounded-3xl border-2 border-indigo-500/50 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Always mounted video element so ref is never null */}
              <video
                ref={setVideoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {/* Viewfinder fallback / button when camera is inactive */}
              {!cameraActive && (
                <div className="text-center p-4 text-zinc-400 text-xs flex flex-col items-center justify-center h-full w-full">
                  {cameraStarting ? (
                    <>
                      <Loader2 className="w-10 h-10 mb-2 animate-spin text-indigo-400" />
                      <span className="font-semibold text-zinc-300">Connecting camera...</span>
                      <span className="text-[10px] text-zinc-500 mt-1">Please accept browser permission</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 mb-2 text-indigo-400 opacity-60" />
                      <span className="font-semibold text-zinc-300 mb-2.5">
                        {cameraError ? 'Camera unavailable' : 'Camera ready'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startCamera(facingMode)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/50 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{cameraError ? 'Retry Open Camera' : 'Start Camera'}</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Laser scanning bar animation when active */}
              {cameraActive && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-bounce shadow-lg shadow-indigo-400 pointer-events-none" />
              )}

              {/* Camera flip toggle button */}
              {cameraActive && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="absolute top-2 right-2 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 shadow-md backdrop-blur-sm transition-all cursor-pointer z-10"
                  title="Switch Front/Rear Camera"
                >
                  <RotateCcw className="w-4 h-4" />
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
