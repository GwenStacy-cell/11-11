/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Friend, VoiceFilter, TransmissionLog, BroadcastMessage, UserProfile, FriendRequest } from './types';
import { INITIAL_FRIENDS } from './data/mockData';
import { audioEngine } from './utils/audioEffects';
import { walkieBroadcast } from './utils/broadcast';
import { walkieP2P } from './utils/webrtc';
import { usePWAInstall } from './hooks/usePWAInstall';
import { WalkieTalkieMain } from './components/WalkieTalkieMain';
import { FriendManagerModal } from './components/FriendManagerModal';
import { SoundboardModal } from './components/SoundboardModal';
import { AboutModal } from './components/AboutModal';
import { TransmissionHistoryModal } from './components/TransmissionHistoryModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { SettingsModal } from './components/SettingsModal';
import { AddLockScreenModal } from './components/AddLockScreenModal';
import { InstallAppModal } from './components/InstallAppModal';
import { QRCodeModal } from './components/QRCodeModal';
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

  // User Profile
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

    // Broadcast real-time profile update (avatar & banner) to all walkie friends
    const updateMsg: BroadcastMessage = {
      type: 'profile-update',
      senderPin: myPin,
      senderName: newProfile.name,
      profile: {
        name: newProfile.name,
        avatar: newProfile.avatar,
        banner: newProfile.banner,
        noteStatus: newProfile.noteStatus,
        bio: newProfile.bio,
        accentColor: newProfile.accentColor,
      },
      timestamp: Date.now(),
    };
    walkieBroadcast.send(updateMsg);
    friends.forEach((f) => walkieP2P.sendToFriend(f.pin, updateMsg));
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setActiveThemeId(themeId);
    localStorage.setItem('tenten_active_theme', themeId);
    const th = THEMES[themeId];
    if (th) {
      setUserProfile((prev) => ({
        ...prev,
        themeId,
        accentColor: th.primary,
      }));
    }
  };

  // Incoming Audio Gain
  const [volume, setVolume] = useState<number>(() => audioEngine.getIncomingVolume());

  // Friends List
  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('tenten_friends');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (f: Friend) =>
              !['f-maya', 'f-leo', 'f-chloe', 'f-alex'].includes(f.id) &&
              !['Maya', 'Leo', 'Chloe', 'Alex'].includes(f.name)
          );
        }
      } catch {
        return [];
      }
    }
    return INITIAL_FRIENDS;
  });

  // Active Selected Friend
  const [activeFriend, setActiveFriend] = useState<Friend | null>(() => friends[0] || null);

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
  const [incomingSenderPin, setIncomingSenderPin] = useState<string | null>(null);
  const [incomingText, setIncomingText] = useState<string | null>(null);
  const [isDnd, setIsDnd] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState<VoiceFilter>('classic-walkie');
  const [transmissionDuration, setTransmissionDuration] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);

  // Blocked Friends PINs
  const [blockedPins, setBlockedPins] = useState<string[]>(() => {
    const saved = localStorage.getItem('tenten_blocked_pins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Save blocked pins to localStorage
  useEffect(() => {
    localStorage.setItem('tenten_blocked_pins', JSON.stringify(blockedPins));
  }, [blockedPins]);

  const handleBlockPin = useCallback((pin: string) => {
    setBlockedPins((prev) => (prev.includes(pin) ? prev : [...prev, pin]));
  }, []);

  const handleUnblockPin = useCallback((pin: string) => {
    setBlockedPins((prev) => prev.filter((p) => p !== pin));
  }, []);

  const handleToggleBlockPin = useCallback((pin: string) => {
    setBlockedPins((prev) => (prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin]));
  }, []);

  // 5-minute mute dictionary: { [pin]: timestampUntilMuted }
  const [mutedUntil, setMutedUntil] = useState<Record<string, number>>({});

  const handleMuteFriend = useCallback((pin: string, minutes: number = 5) => {
    const until = Date.now() + minutes * 60 * 1000;
    setMutedUntil((prev) => ({ ...prev, [pin]: until }));
    audioEngine.stopLiveStream();
    setIsReceiving(false);
    setIncomingSender(null);
    setIncomingSenderPin(null);
    audioEngine.playPokeSound();
  }, []);

  const handleMuteCurrentSender = useCallback(() => {
    if (incomingSenderPin) {
      handleMuteFriend(incomingSenderPin, 5);
    } else {
      audioEngine.stopLiveStream();
      setIsReceiving(false);
      setIncomingSender(null);
      setIncomingSenderPin(null);
    }
  }, [incomingSenderPin, handleMuteFriend]);

  // Incoming Friend Requests
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>(() => {
    const saved = localStorage.getItem('tenten_friend_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tenten_friend_requests', JSON.stringify(incomingRequests));
  }, [incomingRequests]);

  // Send friend request by 4-digit PIN
  const handleSendFriendRequest = useCallback(
    (targetPin: string) => {
      if (targetPin === myPin) return;

      const reqMsg: BroadcastMessage = {
        type: 'friend-request',
        senderPin: myPin,
        senderName: userProfile.name,
        targetPin,
        profile: {
          name: userProfile.name,
          avatar: userProfile.avatar,
          banner: userProfile.banner,
          noteStatus: userProfile.noteStatus,
          bio: userProfile.bio,
          accentColor: userProfile.accentColor,
        },
        timestamp: Date.now(),
      };

      walkieBroadcast.send(reqMsg);
      walkieP2P.sendToFriend(targetPin, reqMsg);

      // Add to circle with pending status
      setFriends((prev) => {
        if (prev.some((f) => f.pin === targetPin)) return prev;
        const pendingFriend: Friend = {
          id: 'f-' + targetPin,
          name: `PIN #${targetPin}`,
          realName: `PIN #${targetPin}`,
          pin: targetPin,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          statusText: 'Connection request sent · Waiting for accept...',
          onlineStatus: 'offline',
          lastActive: 'Requested',
          accentColor: '#f59e0b',
          isPending: true,
        };
        const updated = [pendingFriend, ...prev];
        localStorage.setItem('tenten_friends', JSON.stringify(updated));
        return updated;
      });
    },
    [myPin, userProfile]
  );

  // Accept incoming friend request
  const handleAcceptFriendRequest = useCallback(
    (req: FriendRequest) => {
      const confirmedFriend: Friend = {
        id: 'f-' + req.pin,
        name: req.name, // The real name they kept!
        realName: req.name,
        pin: req.pin,
        avatar: req.avatar, // Their real gallery photo!
        banner: req.banner, // Their real gallery banner!
        noteStatus: req.noteStatus,
        bio: req.bio,
        statusText: req.noteStatus || `Connected on 11:11 via PIN #${req.pin}`,
        onlineStatus: 'online',
        lastActive: 'Just now',
        accentColor: req.accentColor || '#f59e0b',
        isPending: false,
      };

      setFriends((prev) => {
        const filtered = prev.filter((f) => f.pin !== req.pin);
        const updated = [confirmedFriend, ...filtered];
        localStorage.setItem('tenten_friends', JSON.stringify(updated));
        return updated;
      });

      setActiveFriend(confirmedFriend);
      setIncomingRequests((prev) => prev.filter((r) => r.pin !== req.pin));

      // Send accept reply with my real profile
      const acceptMsg: BroadcastMessage = {
        type: 'friend-accept',
        senderPin: myPin,
        senderName: userProfile.name,
        targetPin: req.pin,
        profile: {
          name: userProfile.name,
          avatar: userProfile.avatar,
          banner: userProfile.banner,
          noteStatus: userProfile.noteStatus,
          bio: userProfile.bio,
          accentColor: userProfile.accentColor,
        },
        timestamp: Date.now(),
      };
      walkieBroadcast.send(acceptMsg);
      walkieP2P.sendToFriend(req.pin, acceptMsg);

      audioEngine.playPokeSound();
    },
    [myPin, userProfile]
  );

  // Decline incoming friend request
  const handleDeclineFriendRequest = useCallback(
    (pin: string) => {
      setIncomingRequests((prev) => prev.filter((r) => r.pin !== pin));
      const declineMsg: BroadcastMessage = {
        type: 'friend-decline',
        senderPin: myPin,
        senderName: userProfile.name,
        targetPin: pin,
        timestamp: Date.now(),
      };
      walkieBroadcast.send(declineMsg);
      walkieP2P.sendToFriend(pin, declineMsg);
    },
    [myPin, userProfile.name]
  );

  // Rename friend / set custom nickname
  const handleRenameFriend = useCallback((id: string, newNickname: string) => {
    setFriends((prev) => {
      const updated = prev.map((f) => {
        if (f.id === id) {
          const finalName = newNickname.trim() || f.realName || f.name;
          return { ...f, name: finalName };
        }
        return f;
      });
      localStorage.setItem('tenten_friends', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Dynamic state refs for async listeners
  const blockedPinsRef = useRef(blockedPins);
  blockedPinsRef.current = blockedPins;

  const mutedUntilRef = useRef(mutedUntil);
  mutedUntilRef.current = mutedUntil;

  const friendsRef = useRef(friends);
  friendsRef.current = friends;

  const isDndRef = useRef(isDnd);
  isDndRef.current = isDnd;

  // Request notifications gracefully on initial user interaction
  useEffect(() => {
    const handleFirstUserGesture = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
      window.removeEventListener('click', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
    };
    window.addEventListener('click', handleFirstUserGesture);
    window.addEventListener('touchstart', handleFirstUserGesture);
    return () => {
      window.removeEventListener('click', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
    };
  }, []);

  // Show speaker notification (works when backgrounded / outside app)
  const showSpeakerNotification = useCallback(
    (senderName: string, senderPin: string) => {
      // 1. Lock screen media session
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `${senderName} is speaking live...`,
            artist: '11:11 Walkie-Talkie',
            album: 'Tap to mute for 5 mins',
            artwork: [
              { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            ],
          });
        } catch {
          // ignore
        }
      }

      // 2. Web Notification (even outside the app)
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const notif = new Notification(`${senderName} is speaking...`, {
            body: 'Tap to mute for 5 mins',
            tag: 'tenten-speaking',
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            silent: false,
          });

          notif.onclick = () => {
            window.focus();
            handleMuteFriend(senderPin, 5);
            notif.close();
          };
        } catch (e) {
          console.warn('Notification error:', e);
        }
      }
    },
    [handleMuteFriend]
  );

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLockScreenGuideOpen, setIsLockScreenGuideOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isFriendManagerOpen, setIsFriendManagerOpen] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTargetFriend, setQrTargetFriend] = useState<{ name: string; pin: string } | null>(null);

  const { isInstallable, install } = usePWAInstall();

  const handleOpenQrCode = (target?: { name: string; pin: string }) => {
    setQrTargetFriend(target || null);
    setIsQrModalOpen(true);
  };

  // Transmission logs
  const [logs, setLogs] = useState<TransmissionLog[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize WebRTC P2P
  useEffect(() => {
    walkieP2P.init(myPin);
  }, [myPin]);

  // Save profile to localStorage
  useEffect(() => {
    localStorage.setItem('tenten_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Save friends to localStorage
  useEffect(() => {
    localStorage.setItem('tenten_friends', JSON.stringify(friends));
  }, [friends]);

  // Handle Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setIncomingVolume(newVol);
  };

  // Request Microphone
  const requestMicAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      return stream;
    } catch (err) {
      console.warn('Microphone permission not granted:', err);
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

  // Universal Share App
  const handleShareApp = () => {
    const shareData = {
      title: '11:11 Live Walkie-Talkie',
      text: `Talk with me live on 11:11 Walkie! My PIN is #${myPin}. Enter my PIN to connect!`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `Join me on 11:11 Live Walkie-Talkie! Add my PIN #${myPin} at ${window.location.href}`
      );
      alert(`Link & PIN #${myPin} copied to clipboard! Share it with your friends!`);
      audioEngine.playPokeSound();
    }
  };

  // Reset all data
  const handleClearData = () => {
    localStorage.removeItem('tenten_friends');
    setFriends([]);
    setActiveFriend(null);
    setLogs([]);
    audioEngine.playPokeSound();
  };

  // Central Incoming Message Handler (BroadcastChannel + WebRTC)
  const handleIncomingMessage = useCallback(
    (msg: BroadcastMessage) => {
      if (msg.senderPin === myPin) return;
      if (msg.targetPin && msg.targetPin !== myPin) return;

      // Discard messages from blocked or temporarily muted friends
      if (blockedPinsRef.current.includes(msg.senderPin)) return;
      if ((mutedUntilRef.current[msg.senderPin] || 0) > Date.now()) return;

      if (msg.type === 'ptt-start') {
        if (!isDndRef.current) {
          setIsReceiving(true);
          setIncomingSender(msg.senderName);
          setIncomingSenderPin(msg.senderPin);
          audioEngine.playPttStart();
          showSpeakerNotification(msg.senderName, msg.senderPin);
        }
      } else if (msg.type === 'ptt-stop') {
        if (!isDndRef.current) {
          audioEngine.playRogerBeep();
        }
        audioEngine.stopLiveStream();
        setIsReceiving(false);
        setIncomingSender(null);
        setIncomingSenderPin(null);
      } else if (msg.type === 'voice-message' && msg.audioData) {
        if (!isDndRef.current) {
          setIsReceiving(true);
          setIncomingSender(msg.senderName);
          setIncomingSenderPin(msg.senderPin);
          showSpeakerNotification(msg.senderName, msg.senderPin);

          audioEngine.playRecordedVoice(
            msg.audioData,
            voiceFilter,
            () => {},
            () => {
              setIsReceiving(false);
              setIncomingSender(null);
              setIncomingSenderPin(null);
            }
          );
        }

        setLogs((prev) => [
          {
            id: 'log-' + Date.now(),
            senderName: msg.senderName,
            senderPin: msg.senderPin,
            isSelf: false,
            timestamp: new Date(),
            durationSec: msg.duration || 2,
            transcript: `Voice transmission from ${msg.senderName}`,
            type: 'voice',
          },
          ...prev,
        ]);
      } else if (msg.type === 'poke') {
        if (!isDndRef.current) {
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
            transcript: `${msg.senderName} poked you!`,
            type: 'poke',
          },
          ...prev,
        ]);
      } else if (msg.type === 'soundboard') {
        if (!isDndRef.current) {
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
      } else if (msg.type === 'friend-request') {
        const senderProfile = msg.profile;
        const senderName = senderProfile?.name || msg.senderName || `User #${msg.senderPin}`;
        const newReq: FriendRequest = {
          pin: msg.senderPin,
          name: senderName,
          avatar: senderProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          banner: senderProfile?.banner,
          noteStatus: senderProfile?.noteStatus,
          bio: senderProfile?.bio,
          accentColor: senderProfile?.accentColor || '#f59e0b',
          timestamp: Date.now(),
        };

        setIncomingRequests((prev) => [newReq, ...prev.filter((r) => r.pin !== msg.senderPin)]);
        audioEngine.playPokeSound();

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`Friend Request: ${senderName}`, {
              body: `User #${msg.senderPin} wants to connect with you on 11:11! Tap to accept.`,
              tag: 'tenten-friend-request',
              icon: newReq.avatar || '/pwa-192x192.png',
            });
          } catch {}
        }
      } else if (msg.type === 'friend-accept') {
        const friendProfile = msg.profile;
        const friendName = friendProfile?.name || msg.senderName || `User #${msg.senderPin}`;
        const newFriend: Friend = {
          id: 'f-' + msg.senderPin,
          name: friendName,
          realName: friendName,
          pin: msg.senderPin,
          avatar: friendProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          banner: friendProfile?.banner,
          noteStatus: friendProfile?.noteStatus,
          bio: friendProfile?.bio,
          statusText: friendProfile?.noteStatus || `Connected on 11:11 via PIN #${msg.senderPin}`,
          onlineStatus: 'online',
          lastActive: 'Just now',
          accentColor: friendProfile?.accentColor || '#f59e0b',
          isPending: false,
        };

        setFriends((prev) => {
          const filtered = prev.filter((f) => f.pin !== msg.senderPin);
          const updated = [newFriend, ...filtered];
          localStorage.setItem('tenten_friends', JSON.stringify(updated));
          return updated;
        });

        setActiveFriend(newFriend);
        audioEngine.playPokeSound();

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`${friendName} accepted your friend request!`, {
              body: 'You are now connected! Hold the PTT button to talk live.',
              tag: 'tenten-friend-accepted',
              icon: newFriend.avatar || '/pwa-192x192.png',
            });
          } catch {}
        }
      } else if (msg.type === 'profile-update' && msg.profile) {
        const updatedProfile = msg.profile;
        setFriends((prev) => {
          const updated = prev.map((f) => {
            if (f.pin === msg.senderPin) {
              const keepCustomNickname = f.realName && f.name !== f.realName;
              return {
                ...f,
                name: keepCustomNickname ? f.name : updatedProfile.name,
                realName: updatedProfile.name,
                avatar: updatedProfile.avatar || f.avatar,
                banner: updatedProfile.banner || f.banner,
                noteStatus: updatedProfile.noteStatus,
                bio: updatedProfile.bio,
                statusText: updatedProfile.noteStatus || f.statusText,
              };
            }
            return f;
          });
          localStorage.setItem('tenten_friends', JSON.stringify(updated));
          return updated;
        });
      } else if (msg.type === 'friend-decline') {
        setFriends((prev) => {
          const updated = prev.map((f) => {
            if (f.pin === msg.senderPin && f.isPending) {
              return {
                ...f,
                statusText: 'Connection request declined',
              };
            }
            return f;
          });
          localStorage.setItem('tenten_friends', JSON.stringify(updated));
          return updated;
        });
      }
    },
    [myPin, voiceFilter, showSpeakerNotification]
  );

  // Subscribe to BroadcastChannel & WebRTC
  useEffect(() => {
    const unsubBroadcast = walkieBroadcast.subscribe(handleIncomingMessage);
    const unsubP2P = walkieP2P.onMessage(handleIncomingMessage);

    // Live WebRTC Audio Stream listener (direct real-time speaking)
    const unsubCall = walkieP2P.onIncomingCall((callerPin, remoteStream) => {
      if (blockedPinsRef.current.includes(callerPin)) return;
      if ((mutedUntilRef.current[callerPin] || 0) > Date.now()) return;
      if (isDndRef.current) return;

      const callerObj = friendsRef.current.find((f) => f.pin === callerPin);
      const callerName = callerObj ? callerObj.name : `Friend #${callerPin}`;

      setIsReceiving(true);
      setIncomingSender(callerName);
      setIncomingSenderPin(callerPin);

      // Play real-time live incoming audio
      audioEngine.playLiveStream(remoteStream);
      showSpeakerNotification(callerName, callerPin);

      // When remote audio track ceases
      const audioTrack = remoteStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.onended = () => {
          audioEngine.stopLiveStream();
          setIsReceiving(false);
          setIncomingSender(null);
          setIncomingSenderPin(null);
        };
      }
    });

    const unsubCallEnd = walkieP2P.onCallEnd(() => {
      audioEngine.stopLiveStream();
      setIsReceiving(false);
      setIncomingSender(null);
      setIncomingSenderPin(null);
    });

    return () => {
      unsubBroadcast();
      unsubP2P();
      unsubCall();
      unsubCallEnd();
    };
  }, [handleIncomingMessage, showSpeakerNotification]);

  // PTT Start (Records real mic voice & streams live to friend)
  const handlePttStart = useCallback(async () => {
    if (isTransmitting || isReceiving) return;

    let stream = mediaStreamRef.current;
    if (!stream && navigator.mediaDevices) {
      stream = await requestMicAccess();
    }

    audioEngine.playPttStart();
    setIsTransmitting(true);
    setTransmissionDuration(0);

    const pttStartMsg: BroadcastMessage = {
      type: 'ptt-start',
      senderPin: myPin,
      senderName: userProfile.name,
      targetPin: activeFriend ? activeFriend.pin : undefined,
      timestamp: Date.now(),
    };
    walkieBroadcast.send(pttStartMsg);
    if (activeFriend) {
      walkieP2P.sendToFriend(activeFriend.pin, pttStartMsg);
      // LIVE AUDIO: stream real-time voice while holding PTT
      if (stream) {
        walkieP2P.callFriend(activeFriend.pin, stream);
      }
    }

    // Start recording real microphone audio
    if (stream) {
      try {
        audioChunksRef.current = [];
        let mimeType = '';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          }
          const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          recorder.start(100);
          mediaRecorderRef.current = recorder;
        }
      } catch (err) {
        console.warn('Failed to start MediaRecorder:', err);
      }
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTransmissionDuration((prev) => prev + 1);
    }, 1000);
  }, [isTransmitting, isReceiving, myPin, userProfile.name, activeFriend, requestMicAccess]);

  // PTT Stop (Sends real recorded audio over WebRTC & BroadcastChannel)
  const handlePttStop = useCallback(() => {
    if (!isTransmitting && !isLockedOnAir) return;

    // End active live WebRTC call
    walkieP2P.endCurrentCall();

    audioEngine.playRogerBeep();
    setIsTransmitting(false);
    setIsLockedOnAir(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = Math.max(1, transmissionDuration);
    const targetLabel = activeFriend ? activeFriend.name : 'Friend';

    // Stop MediaRecorder and transmit real audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const mime = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mime });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            const voiceMsg: BroadcastMessage = {
              type: 'voice-message',
              senderPin: myPin,
              senderName: userProfile.name,
              targetPin: activeFriend ? activeFriend.pin : undefined,
              audioData: base64Audio,
              duration,
              timestamp: Date.now(),
            };

            if (activeFriend) {
              walkieP2P.sendToFriend(activeFriend.pin, voiceMsg);
            }
            walkieBroadcast.send(voiceMsg);
          };
          reader.readAsDataURL(audioBlob);
        }
      };
      recorder.stop();
    } else {
      const pttStopMsg: BroadcastMessage = {
        type: 'ptt-stop',
        senderPin: myPin,
        senderName: userProfile.name,
        targetPin: activeFriend ? activeFriend.pin : undefined,
        timestamp: Date.now(),
      };
      walkieBroadcast.send(pttStopMsg);
      if (activeFriend) {
        walkieP2P.sendToFriend(activeFriend.pin, pttStopMsg);
      }
    }

    setLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        senderName: userProfile.name,
        senderPin: myPin,
        isSelf: true,
        timestamp: new Date(),
        durationSec: duration,
        transcript: `Voice message to ${targetLabel}`,
        type: 'voice',
      },
      ...prev,
    ]);
  }, [
    isTransmitting,
    isLockedOnAir,
    transmissionDuration,
    myPin,
    userProfile.name,
    activeFriend,
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

    const targetLabel = activeFriend ? activeFriend.name : 'Friend';
    const targetPin = activeFriend ? activeFriend.pin : undefined;

    const pokeMsg: BroadcastMessage = {
      type: 'poke',
      senderPin: myPin,
      senderName: userProfile.name,
      targetPin,
      timestamp: Date.now(),
    };

    walkieBroadcast.send(pokeMsg);
    if (activeFriend) {
      walkieP2P.sendToFriend(activeFriend.pin, pokeMsg);
    }

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
  };

  // Soundboard broadcast
  const handleBroadcastSound = (name: string, _soundType: 'siren' | 'roger' | 'alert' | 'wakeup') => {
    const sbMsg: BroadcastMessage = {
      type: 'soundboard',
      senderPin: myPin,
      senderName: userProfile.name,
      targetPin: activeFriend ? activeFriend.pin : undefined,
      text: name,
      timestamp: Date.now(),
    };

    walkieBroadcast.send(sbMsg);
    if (activeFriend) {
      walkieP2P.sendToFriend(activeFriend.pin, sbMsg);
    }

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
        activeFriend &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        handlePttStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (isTransmitting || isLockedOnAir)) {
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
  }, [isTransmitting, isLockedOnAir, activeFriend, handlePttStart, handlePttStop]);

  const currentBlurredAvatar = activeFriend?.banner || activeFriend?.avatar || userProfile.avatar;
  const currentBlurredName = activeFriend ? activeFriend.name : userProfile.name;
  const isAirActive = isTransmitting || isReceiving || isLockedOnAir;

  return (
    <div
      className={`w-full h-[100dvh] min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col justify-between transition-transform relative overflow-hidden select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Full-Screen Ambient Avatar / Banner Backdrop */}
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
          onOpenSoundboard={() => setIsSoundboardOpen(true)}
          onOpenFriendManager={() => setIsFriendManagerOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenLockScreenGuide={() => setIsLockScreenGuideOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onShareApp={handleShareApp}
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
          blockedPins={blockedPins}
          onBlockFriend={handleBlockPin}
          onUnblockFriend={handleUnblockPin}
          onMuteCurrentSender={handleMuteCurrentSender}
          onRenameFriend={handleRenameFriend}
          incomingRequests={incomingRequests}
          onAcceptRequest={handleAcceptFriendRequest}
          onDeclineRequest={handleDeclineFriendRequest}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        myPin={myPin}
        volume={volume}
        onChangeVolume={handleVolumeChange}
        voiceFilter={voiceFilter}
        onChangeVoiceFilter={setVoiceFilter}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        activeTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        hasMicPermission={hasMicPermission}
        onRequestMic={requestMicAccess}
        onOpenLockScreenGuide={() => setIsLockScreenGuideOpen(true)}
        onClearData={handleClearData}
        onShareApp={handleShareApp}
        blockedPins={blockedPins}
        friends={friends}
        onBlockPin={handleBlockPin}
        onUnblockPin={handleUnblockPin}
        onOpenInstallModal={() => {
          setIsSettingsOpen(false);
          setIsInstallModalOpen(true);
        }}
      />

      {/* Direct App Download / Install Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        myPin={myPin}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Add Lock Screen & PWA Guide Modal */}
      <AddLockScreenModal
        isOpen={isLockScreenGuideOpen}
        onClose={() => setIsLockScreenGuideOpen(false)}
        onTriggerTestAudio={() => audioEngine.playRogerBeep()}
        onInstallPwa={install}
        isInstallable={isInstallable}
      />

      {/* Friend Manager Modal */}
      <FriendManagerModal
        isOpen={isFriendManagerOpen}
        onClose={() => setIsFriendManagerOpen(false)}
        myPin={myPin}
        friends={friends}
        onAddFriendByPin={handleSendFriendRequest}
        onDeleteFriend={handleDeleteFriend}
        onSelectFriend={setActiveFriend}
        activeFriendId={activeFriend?.id}
        onOpenQrCode={handleOpenQrCode}
        blockedPins={blockedPins}
        onToggleBlockPin={handleToggleBlockPin}
        incomingRequests={incomingRequests}
        onAcceptRequest={handleAcceptFriendRequest}
        onDeclineRequest={handleDeclineFriendRequest}
        onRenameFriend={handleRenameFriend}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        myPin={myPin}
        userName={userProfile.name}
        onAddFriend={(_name, pin) => handleSendFriendRequest(pin)}
        targetFriend={qrTargetFriend}
      />

      {/* Soundboard Modal */}
      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        onBroadcastSound={handleBroadcastSound}
        activeFriendName={activeFriend ? activeFriend.name : 'Friend'}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Transmission History Modal */}
      <TransmissionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        logs={logs}
        onClearLogs={() => setLogs([])}
      />
    </div>
  );
}
