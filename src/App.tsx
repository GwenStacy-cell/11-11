/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Friend, VoiceFilter, TransmissionLog, BroadcastMessage, UserProfile } from './types';
import { INITIAL_FRIENDS, FUN_VOICE_RESPONSES } from './data/mockData';
import { audioEngine } from './utils/audioEffects';
import { walkieBroadcast } from './utils/broadcast';
import { WalkieTalkieMain } from './components/WalkieTalkieMain';
import { LockScreenModal } from './components/LockScreenModal';
import { FriendManagerModal } from './components/FriendManagerModal';
import { SoundboardModal } from './components/SoundboardModal';
import { AboutModal } from './components/AboutModal';
import { TransmissionHistoryModal } from './components/TransmissionHistoryModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { QRCodeModal } from './components/QRCodeModal';
import { InstallAppModal } from './components/InstallAppModal';
import { THEMES, ThemeId } from './data/themes';
import { Radio, Lock, Hand, Volume2, Sparkles, User, Sliders, Palette, QrCode, Scan, Download } from 'lucide-react';

export default function App() {
  // Generate or retrieve persistent PIN
  const [myPin] = useState(() => {
    const saved = localStorage.getItem('tenten_user_pin');
    if (saved) return saved;
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem('tenten_user_pin', generated);
    return generated;
  });

  // User Profile (Avatar, Banner, Note Status, Name)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tenten_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      name: 'You',
      pin: myPin,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      banner: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
      noteStatus: '11:11 make a wish ✨',
      bio: 'Live on walkie channel 11:11',
      accentColor: '#f59e0b',
      themeId: 'amber',
    };
  });

  // Active Aesthetic Theme
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('tenten_active_theme') as ThemeId;
    if (saved && THEMES[saved]) return saved;
    return (userProfile.themeId as ThemeId) || 'amber';
  });

  const activeTheme = THEMES[activeThemeId] || THEMES.amber;

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (newProfile.themeId && THEMES[newProfile.themeId]) {
      setActiveThemeId(newProfile.themeId);
      localStorage.setItem('tenten_active_theme', newProfile.themeId);
    }
  };

  // Incoming Audio Gain (Web Audio API)
  const [volume, setVolume] = useState<number>(() => audioEngine.getIncomingVolume());

  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('tenten_friends');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_FRIENDS;
      }
    }
    return INITIAL_FRIENDS;
  });

  const [activeFriend, setActiveFriend] = useState<Friend>(friends[0]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isLockedOnAir, setIsLockedOnAir] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [incomingSender, setIncomingSender] = useState<string | null>(null);
  const [incomingText, setIncomingText] = useState<string | null>(null);
  const [isDnd, setIsDnd] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState<VoiceFilter>('classic-walkie');
  const [transmissionDuration, setTransmissionDuration] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);

  // Modals
  const [isLockScreenOpen, setIsLockScreenOpen] = useState(false);
  const [isFriendManagerOpen, setIsFriendManagerOpen] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [qrTargetFriend, setQrTargetFriend] = useState<{ name: string; pin: string } | null>(null);

  const handleOpenQrCode = (target?: { name: string; pin: string }) => {
    setQrTargetFriend(target || null);
    setIsQrModalOpen(true);
  };

  // Transmission logs
  const [logs, setLogs] = useState<TransmissionLog[]>([
    {
      id: 'init-1',
      senderName: 'Maya',
      senderPin: '8492',
      isSelf: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      durationSec: 3,
      transcript: "Don't scream on 11:11, teacher is right here!",
      type: 'voice',
    },
    {
      id: 'init-2',
      senderName: 'Leo',
      senderPin: '5021',
      isSelf: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
      durationSec: 1,
      type: 'poke',
    },
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Save profile to localStorage
  useEffect(() => {
    localStorage.setItem('tenten_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Save friends to localStorage
  useEffect(() => {
    localStorage.setItem('tenten_friends', JSON.stringify(friends));
  }, [friends]);

  // Handle Volume Change (Web Audio API)
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setIncomingVolume(newVol);
  };

  // Request Microphone
  const requestMicAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      return stream;
    } catch (err) {
      console.warn('Microphone permission not granted or available:', err);
      setHasMicPermission(false);
      return null;
    }
  }, []);

  // Screen shake helper
  const triggerScreenShake = () => {
    setScreenShake(true);
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    setTimeout(() => setScreenShake(false), 500);
  };

  // Cross-Tab Broadcast Channel listener
  useEffect(() => {
    const unsubscribe = walkieBroadcast.subscribe((msg: BroadcastMessage) => {
      // Ignore messages from self
      if (msg.senderPin === myPin) return;

      if (msg.type === 'ptt-start') {
        if (!isDnd) {
          setIsReceiving(true);
          setIncomingSender(msg.senderName);
          audioEngine.playPttStart();
        }
      } else if (msg.type === 'ptt-stop') {
        if (!isDnd) {
          audioEngine.playRogerBeep();
        }
        setIsReceiving(false);
        setIncomingSender(null);
      } else if (msg.type === 'poke') {
        if (!isDnd) {
          audioEngine.playPokeSound();
          triggerScreenShake();
        }
        setLogs((prev) => [
          {
            id: 'log-' + Date.now(),
            senderName: msg.senderName,
            senderPin: msg.senderPin,
            isSelf: false,
            timestamp: new Date(),
            durationSec: 1,
            type: 'poke',
          },
          ...prev,
        ]);
      } else if (msg.type === 'soundboard') {
        if (!isDnd) {
          setLogs((prev) => [
            {
              id: 'log-' + Date.now(),
              senderName: msg.senderName,
              senderPin: msg.senderPin,
              isSelf: false,
              timestamp: new Date(),
              durationSec: 2,
              transcript: msg.text,
              type: 'soundboard',
            },
            ...prev,
          ]);
        }
      }
    });

    return () => unsubscribe();
  }, [myPin, isDnd]);

  // PTT Start
  const handlePttStart = useCallback(() => {
    if (isTransmitting || isReceiving) return;

    audioEngine.playPttStart();
    setIsTransmitting(true);
    setTransmissionDuration(0);

    // Broadcast PTT Start to any other connected tabs
    walkieBroadcast.send({
      type: 'ptt-start',
      senderPin: myPin,
      senderName: userProfile.name,
      timestamp: Date.now(),
    });

    // Start duration timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTransmissionDuration((prev) => prev + 1);
    }, 1000);

    // If mic not requested yet, try
    if (!hasMicPermission && navigator.mediaDevices) {
      requestMicAccess();
    }
  }, [isTransmitting, isReceiving, myPin, userProfile.name, hasMicPermission, requestMicAccess]);

  // PTT Stop
  const handlePttStop = useCallback(() => {
    if (!isTransmitting && !isLockedOnAir) return;

    audioEngine.playRogerBeep();
    setIsTransmitting(false);
    setIsLockedOnAir(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = Math.max(1, transmissionDuration);

    // Broadcast PTT Stop
    walkieBroadcast.send({
      type: 'ptt-stop',
      senderPin: myPin,
      senderName: userProfile.name,
      timestamp: Date.now(),
    });

    // Add to history
    setLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        senderName: userProfile.name,
        senderPin: myPin,
        isSelf: true,
        timestamp: new Date(),
        durationSec: duration,
        transcript: `Live transmission to ${activeFriend.name}`,
        type: 'voice',
      },
      ...prev,
    ]);

    // Random simulated friend reply (simulating the fun walkie talkie interaction)
    const shouldReply = Math.random() > 0.45;
    if (shouldReply && !isDnd) {
      setTimeout(() => {
        triggerFriendBanter(activeFriend.name);
      }, 1400);
    }
  }, [isTransmitting, isLockedOnAir, transmissionDuration, myPin, userProfile.name, activeFriend, isDnd]);

  // Toggle Hands-Free Locked Mode
  const handleToggleLockOnAir = () => {
    if (isLockedOnAir) {
      handlePttStop();
    } else {
      setIsLockedOnAir(true);
      handlePttStart();
    }
  };

  // Trigger friend speech banter
  const triggerFriendBanter = (friendName: string, customQuote?: string) => {
    if (isDnd) return;

    const quotes = FUN_VOICE_RESPONSES[friendName] || [
      'Yo! Reading you loud and clear on 11:11!',
      'Are you there? Over and out!',
    ];
    const textToSpeak = customQuote || quotes[Math.floor(Math.random() * quotes.length)];
    const friendObj = friends.find((f) => f.name === friendName) || activeFriend;

    setIsReceiving(true);
    setIncomingSender(friendName);
    setIncomingText(textToSpeak);

    audioEngine.speakRadioVoice(
      textToSpeak,
      friendObj.genderVoice || 'female',
      () => {
        // Voice started
      },
      () => {
        // Voice ended
        setIsReceiving(false);
        setIncomingSender(null);
        setIncomingText(null);

        // Record in log
        setLogs((prev) => [
          {
            id: 'log-' + Date.now(),
            senderName: friendName,
            senderPin: friendObj.pin,
            isSelf: false,
            timestamp: new Date(),
            durationSec: 3,
            transcript: textToSpeak,
            type: 'voice',
          },
          ...prev,
        ]);
      }
    );
  };

  // Send Poke
  const handleSendPoke = () => {
    audioEngine.playPokeSound();
    triggerScreenShake();

    walkieBroadcast.send({
      type: 'poke',
      senderPin: myPin,
      senderName: userProfile.name,
      timestamp: Date.now(),
    });

    setLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        senderName: userProfile.name,
        senderPin: myPin,
        isSelf: true,
        timestamp: new Date(),
        durationSec: 1,
        transcript: `Poked ${activeFriend.name}`,
        type: 'poke',
      },
      ...prev,
    ]);

    // Friend pokes back after brief delay
    setTimeout(() => {
      if (!isDnd) {
        audioEngine.playPokeSound();
        triggerScreenShake();
        setLogs((prev) => [
          {
            id: 'log-' + Date.now(),
            senderName: activeFriend.name,
            senderPin: activeFriend.pin,
            isSelf: false,
            timestamp: new Date(),
            durationSec: 1,
            transcript: `${activeFriend.name} poked you back!`,
            type: 'poke',
          },
          ...prev,
        ]);
      }
    }, 1200);
  };

  // Soundboard broadcast
  const handleBroadcastSound = (name: string, soundType: 'siren' | 'roger' | 'alert' | 'wakeup') => {
    walkieBroadcast.send({
      type: 'soundboard',
      senderPin: myPin,
      senderName: userProfile.name,
      text: name,
      timestamp: Date.now(),
    });

    setLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        senderName: userProfile.name,
        senderPin: myPin,
        isSelf: true,
        timestamp: new Date(),
        durationSec: 2,
        transcript: name,
        type: 'soundboard',
      },
      ...prev,
    ]);
  };

  // Add friend
  const handleAddFriend = (name: string, pin: string) => {
    const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newFriend: Friend = {
      id: 'f-' + Date.now(),
      name,
      pin,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      statusText: 'Connected on 11:11 via PIN #' + pin,
      onlineStatus: 'online',
      lastActive: 'Just now',
      accentColor: randomColor,
      genderVoice: Math.random() > 0.5 ? 'female' : 'male',
    };
    setFriends((prev) => [newFriend, ...prev]);
    setActiveFriend(newFriend);
  };

  // Spacebar hotkey for PTT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !isTransmitting &&
        !isLockedOnAir &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        handlePttStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isTransmitting && !isLockedOnAir) {
        e.preventDefault();
        handlePttStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTransmitting, isLockedOnAir, handlePttStart, handlePttStop]);

  // Whole-Screen Blurred Avatar Source & Blur Controls (Revealing & Clear)
  const [avatarGlowSource, setAvatarGlowSource] = useState<'friend' | 'user'>('friend');
  const [bgBlurAmount, setBgBlurAmount] = useState<number>(4); // 4px: highly clear and revealing, facial features recognizable!
  const [bgOpacity, setBgOpacity] = useState<number>(90); // 90% opacity: vivid and revealing!

  const currentBlurredAvatar = avatarGlowSource === 'user' ? userProfile.avatar : activeFriend.avatar;
  const currentBlurredName = avatarGlowSource === 'user' ? userProfile.name : activeFriend.name;

  const isAirActive = isTransmitting || isReceiving || isLockedOnAir;

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-3 sm:p-6 transition-transform relative overflow-hidden ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Full-Screen Ambient Avatar Backdrop (Visible ONLY while pushing to talk / receiving, highly clear & revealing!) */}
      <div
        className={`fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-500 ease-out ${
          isAirActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <img
          key={currentBlurredAvatar}
          src={currentBlurredAvatar}
          alt={currentBlurredName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{
            filter: `blur(${bgBlurAmount}px)`,
            opacity: bgOpacity / 100,
            transform: isAirActive ? 'scale(1.08)' : 'scale(1.0)',
          }}
        />
        {/* Soft edge vignette ensuring text readability without hiding the avatar */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-zinc-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_45%,_rgba(9,9,11,0.55)_100%)]" />
      </div>

      {/* Main Container: Desktop Side-by-Side or Centered Mobile Frame */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
        
        {/* Left Column: The 11:11 Handheld Phone Simulator */}
        <div className="w-full max-w-md h-[780px] max-h-[92vh] bg-zinc-950 rounded-[44px] border-[6px] border-zinc-800 shadow-2xl shadow-black overflow-hidden flex flex-col relative ring-1 ring-white/10">
          
          {/* Hardware Dynamic Island */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-800 mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40" />
          </div>

          <WalkieTalkieMain
            activeFriend={activeFriend}
            friends={friends}
            onSelectFriend={setActiveFriend}
            isTransmitting={isTransmitting}
            isLockedOnAir={isLockedOnAir}
            isReceiving={isReceiving}
            incomingSender={incomingSender}
            onPttStart={handlePttStart}
            onPttStop={handlePttStop}
            onToggleLockOnAir={handleToggleLockOnAir}
            onSendPoke={handleSendPoke}
            onTriggerFriendReply={() => triggerFriendBanter(activeFriend.name)}
            onOpenSoundboard={() => setIsSoundboardOpen(true)}
            onOpenFriendManager={() => setIsFriendManagerOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenLockScreen={() => setIsLockScreenOpen(true)}
            isDnd={isDnd}
            onToggleDnd={() => {
              setIsDnd(!isDnd);
              audioEngine.playPokeSound();
            }}
            voiceFilter={voiceFilter}
            onChangeVoiceFilter={setVoiceFilter}
            myPin={myPin}
            hasMicPermission={hasMicPermission}
            onRequestMic={requestMicAccess}
            transmissionDuration={transmissionDuration}
            volume={volume}
            onChangeVolume={handleVolumeChange}
            userProfile={userProfile}
            onOpenProfileEdit={() => setIsProfileEditOpen(true)}
            activeTheme={activeTheme}
            onOpenQrCode={handleOpenQrCode}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        </div>

        {/* Right Column: Desktop Helper & Quick Testing Panel */}
        <div className="hidden lg:flex flex-col gap-3.5 w-80 text-zinc-300">
          
          {/* Header Card */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center font-black text-xs text-black">
                11:11
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">11:11 Live Walkie</h3>
                <p className="text-[11px] text-zinc-400">Push-to-talk social audio</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use the custom vertical volume slider to adjust the incoming audio gain in real-time via the Web Audio API.
            </p>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Interactive Test Tools
            </div>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-amber-300 transition-all text-left group shadow-sm"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-black flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                <Download className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="text-amber-300 font-extrabold">Download & Install App</div>
                <div className="text-[10px] text-amber-400/80">Install PWA on iOS / Android / Desktop</div>
              </div>
            </button>

            <button
              onClick={() => setIsProfileEditOpen(true)}
              className="w-full py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white">Customize Profile</div>
                <div className="text-[10px] text-zinc-400">Set avatar, banner & status</div>
              </div>
            </button>

            <button
              onClick={() => handleOpenQrCode()}
              className="w-full py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white">Friend QR Code & Scanner</div>
                <div className="text-[10px] text-zinc-400">Share or scan friend PINs instantly</div>
              </div>
            </button>

            <button
              onClick={() => setIsLockScreenOpen(true)}
              className="w-full py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-rose-500/50 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white">11:11 Lock Screen</div>
                <div className="text-[10px] text-zinc-400">Test voice jump-scare override</div>
              </div>
            </button>

            <button
              onClick={() => triggerFriendBanter(activeFriend.name)}
              className="w-full py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500/50 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white">Trigger Friend Voice</div>
                <div className="text-[10px] text-zinc-400">Hear {activeFriend.name} reply on 11:11</div>
              </div>
            </button>

            <button
              onClick={handleSendPoke}
              className="w-full py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Hand className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white">Send Poke Nudge</div>
                <div className="text-[10px] text-zinc-400">Screen shake & pop alert</div>
              </div>
            </button>

            <button
              onClick={() => setIsSoundboardOpen(true)}
              className="w-full py-2.5 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-blue-500/50 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white">Blast Soundboard</div>
                <div className="text-[10px] text-zinc-400">Sirens, roger beeps, alerts</div>
              </div>
            </button>
          </div>

          {/* Ambient Avatar Screen Blur Status & Controls */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={currentBlurredAvatar}
                    alt={currentBlurredName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700 shadow-md"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Full-Screen Avatar Blur</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Glowing: <strong className="text-zinc-200">{currentBlurredName}</strong>
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800/90 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Switch between Friend or User avatar */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[10px]">
              <button
                onClick={() => {
                  setAvatarGlowSource('friend');
                  audioEngine.playPokeSound();
                }}
                className={`py-1 px-2 rounded-lg font-semibold transition-all ${
                  avatarGlowSource === 'friend'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Friend ({activeFriend.name})
              </button>
              <button
                onClick={() => {
                  setAvatarGlowSource('user');
                  audioEngine.playPokeSound();
                }}
                className={`py-1 px-2 rounded-lg font-semibold transition-all ${
                  avatarGlowSource === 'user'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                My Avatar ({userProfile.name})
              </button>
            </div>

            {/* Quick Blur Intensity Selector */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[10px]">
              <span className="text-zinc-400 font-medium">Blur Amount:</span>
              <div className="flex items-center gap-1">
                {[
                  { label: 'Crystal (2px)', val: 2 },
                  { label: 'Revealing (4px)', val: 4 },
                  { label: 'Soft (8px)', val: 8 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    onClick={() => {
                      setBgBlurAmount(preset.val);
                      audioEngine.playPokeSound();
                    }}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      bgBlurAmount === preset.val
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aesthetic Palette Status Card */}
          <div
            onClick={() => setIsProfileEditOpen(true)}
            className="p-3.5 bg-zinc-900/60 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-zinc-950 shadow-md group-hover:scale-105 transition-transform"
                style={{ backgroundColor: activeTheme.primary }}
              >
                <Palette className="w-4 h-4 text-zinc-950" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{activeTheme.name}</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Tap to switch aesthetic theme
                </div>
              </div>
            </div>
            {/* Color Swatch Dots */}
            <div className="flex items-center -space-x-1">
              <span
                className="w-3.5 h-3.5 rounded-full border border-zinc-900 shadow"
                style={{ backgroundColor: activeTheme.primary }}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-zinc-900 shadow"
                style={{ backgroundColor: activeTheme.secondary }}
              />
            </div>
          </div>

          {/* Cross-tab notice card */}
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/30 rounded-3xl">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Device In Browser</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Open 11:11 in <strong>two browser windows side-by-side</strong>. Hold talk in Window 1 and hear it broadcast out loud in Window 2!
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      <LockScreenModal
        isOpen={isLockScreenOpen}
        onClose={() => setIsLockScreenOpen(false)}
        friends={friends}
        activeFriend={activeFriend}
        incomingTransmission={
          isReceiving
            ? {
                senderName: incomingSender || activeFriend.name,
                text: incomingText || `${activeFriend.name} is shouting live!`,
                isPlaying: true,
              }
            : null
        }
        onTriggerIncoming={(name, quote) => {
          triggerFriendBanter(name, quote);
        }}
      />

      <FriendManagerModal
        isOpen={isFriendManagerOpen}
        onClose={() => setIsFriendManagerOpen(false)}
        myPin={myPin}
        friends={friends}
        onAddFriend={handleAddFriend}
        onSelectFriend={setActiveFriend}
        activeFriendId={activeFriend.id}
        onOpenQrCode={handleOpenQrCode}
      />

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        myPin={myPin}
        userName={userProfile.name}
        onAddFriend={handleAddFriend}
        targetFriend={qrTargetFriend}
      />

      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        onBroadcastSound={handleBroadcastSound}
        activeFriendName={activeFriend.name}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <TransmissionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        logs={logs}
        onClearLogs={() => setLogs([])}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        myPin={myPin}
      />
    </div>
  );
}
