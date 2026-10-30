/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Friend, VoiceFilter, TransmissionLog, BroadcastMessage, UserProfile } from './types';
import { INITIAL_FRIENDS, DEFAULT_VOICE_RESPONSES, FUN_VOICE_RESPONSES } from './data/mockData';
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

  // Friends List (Completely empty by default; cleans out any legacy mock friends)
  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('tenten_friends');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove default mock friends if previously stored
          const filtered = parsed.filter(
            (f: Friend) =>
              !['f-maya', 'f-leo', 'f-chloe', 'f-alex'].includes(f.id) &&
              !['Maya', 'Leo', 'Chloe', 'Alex'].includes(f.name)
          );
          return filtered;
        }
      } catch {
        return [];
      }
    }
    return INITIAL_FRIENDS;
  });

  // Active Selected Friend (null if no friends added)
  const [activeFriend, setActiveFriend] = useState<Friend | null>(() => friends[0] || null);

  // Keep activeFriend synchronized with friends list
  useEffect(() => {
    if (activeFriend && !friends.some((f) => f.id === activeFriend.id)) {
      setActiveFriend(friends[0] || null);
    } else if (!activeFriend && friends.length > 0) {
      setActiveFriend(friends[0]);
    }
  }, [friends, activeFriend]);

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
  const [logs, setLogs] = useState<TransmissionLog[]>([]);

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
      targetPin: activeFriend ? activeFriend.pin : undefined,
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
  }, [isTransmitting, isReceiving, myPin, userProfile.name, activeFriend, hasMicPermission, requestMicAccess]);

  // Trigger friend speech banter
  const triggerFriendBanter = useCallback(
    (friendName?: string, customQuote?: string) => {
      if (isDnd) return;

      const targetName = friendName || (activeFriend ? activeFriend.name : 'Channel 11:11');
      const quotes =
        (FUN_VOICE_RESPONSES && FUN_VOICE_RESPONSES[targetName]) || DEFAULT_VOICE_RESPONSES;
      const textToSpeak = customQuote || quotes[Math.floor(Math.random() * quotes.length)];
      const friendObj = friends.find((f) => f.name === targetName) || activeFriend;

      setIsReceiving(true);
      setIncomingSender(targetName);
      setIncomingText(textToSpeak);

      audioEngine.speakRadioVoice(
        textToSpeak,
        friendObj?.genderVoice || 'female',
        () => {
          // Voice started
        },
        () => {
          // Voice ended
          setIsReceiving(false);
          setIncomingSender(null);
          setIncomingText(null);

          setLogs((prev) => [
            {
              id: 'log-' + Date.now(),
              senderName: targetName,
              senderPin: friendObj ? friendObj.pin : '1111',
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
    },
    [isDnd, activeFriend, friends]
  );

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
    const targetLabel = activeFriend ? activeFriend.name : 'Channel 11:11';

    // Broadcast PTT Stop
    walkieBroadcast.send({
      type: 'ptt-stop',
      senderPin: myPin,
      senderName: userProfile.name,
      targetPin: activeFriend ? activeFriend.pin : undefined,
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
        transcript: `Transmission to ${targetLabel}`,
        type: 'voice',
      },
      ...prev,
    ]);

    // Simulated banter reply if friend is active
    if (activeFriend && !isDnd) {
      const shouldReply = Math.random() > 0.45;
      if (shouldReply) {
        setTimeout(() => {
          triggerFriendBanter(activeFriend.name);
        }, 1400);
      }
    }
  }, [
    isTransmitting,
    isLockedOnAir,
    transmissionDuration,
    myPin,
    userProfile.name,
    activeFriend,
    isDnd,
    triggerFriendBanter,
  ]);

  // Toggle Hands-Free Locked Mode
  const handleToggleLockOnAir = () => {
    if (isLockedOnAir) {
      handlePttStop();
    } else {
      setIsLockedOnAir(true);
      handlePttStart();
    }
  };

  // Send Poke
  const handleSendPoke = () => {
    audioEngine.playPokeSound();
    triggerScreenShake();

    const targetLabel = activeFriend ? activeFriend.name : 'Channel 11:11';
    const targetPin = activeFriend ? activeFriend.pin : '1111';

    walkieBroadcast.send({
      type: 'poke',
      senderPin: myPin,
      senderName: userProfile.name,
      targetPin: targetPin,
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
        transcript: `Poked ${targetLabel}`,
        type: 'poke',
      },
      ...prev,
    ]);

    // Friend pokes back if active friend is selected
    if (activeFriend && !isDnd) {
      setTimeout(() => {
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
      }, 1200);
    }
  };

  // Soundboard broadcast
  const handleBroadcastSound = (name: string, _soundType: 'siren' | 'roger' | 'alert' | 'wakeup') => {
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
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      statusText: 'Connected on 11:11 via PIN #' + pin,
      onlineStatus: 'online',
      lastActive: 'Just now',
      accentColor: randomColor,
      genderVoice: Math.random() > 0.5 ? 'female' : 'male',
    };
    setFriends((prev) => [newFriend, ...prev]);
    setActiveFriend(newFriend);
  };

  // Delete friend
  const handleDeleteFriend = (id: string) => {
    setFriends((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem('tenten_friends', JSON.stringify(updated));
      return updated;
    });
    if (activeFriend?.id === id) {
      setActiveFriend(null);
    }
    audioEngine.playPokeSound();
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

  const currentBlurredAvatar = activeFriend ? activeFriend.avatar : userProfile.avatar;
  const currentBlurredName = activeFriend ? activeFriend.name : userProfile.name;
  const isAirActive = isTransmitting || isReceiving || isLockedOnAir;

  return (
    <div
      className={`w-full h-[100dvh] min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col justify-between transition-transform relative overflow-hidden select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Full-Screen Ambient Avatar Backdrop */}
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
            filter: 'blur(5px)',
            opacity: 0.85,
            transform: isAirActive ? 'scale(1.08)' : 'scale(1.0)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-zinc-950/70" />
      </div>

      {/* Main Full-Screen Body */}
      <main className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden">
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
          onTriggerFriendReply={() => triggerFriendBanter(activeFriend?.name)}
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
      </main>

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
                senderName: incomingSender || (activeFriend ? activeFriend.name : 'Channel 11:11'),
                text: incomingText || `${activeFriend ? activeFriend.name : 'Someone'} is talking live!`,
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
        onDeleteFriend={handleDeleteFriend}
        onSelectFriend={setActiveFriend}
        activeFriendId={activeFriend?.id}
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
        activeFriendName={activeFriend ? activeFriend.name : 'Channel 11:11'}
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
