import { Peer, DataConnection, MediaConnection } from 'peerjs';
import { BroadcastMessage } from '../types';
import { walkieBroadcast } from './broadcast';
import { saveKnownProfile, getKnownProfile } from './knownUsers';

type MessageHandler = (msg: BroadcastMessage) => void;
type CallHandler = (senderPin: string, stream: MediaStream, call: MediaConnection) => void;
type CallEndHandler = () => void;

class WalkieP2P {
  private peer: Peer | null = null;
  private myPin: string = '';
  private activeConnections: Map<string, DataConnection> = new Map();
  private activeMediaCall: MediaConnection | null = null;
  private messageListeners: Set<MessageHandler> = new Set();
  private callListeners: Set<CallHandler> = new Set();
  private callEndListeners: Set<CallEndHandler> = new Set();
  public isConnected: boolean = false;

  init(myPin: string) {
    if (this.peer || typeof window === 'undefined') return;
    this.myPin = myPin;

    const peerId = `tenten-walkie-${myPin}`;
    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
        },
      });

      this.peer.on('open', (id) => {
        this.isConnected = true;
        console.log('11:11 Walkie P2P network ready. Peer ID:', id);
      });

      // Data connection listener
      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      // Incoming live audio stream call listener
      this.peer.on('call', (call) => {
        const callerPin = call.peer.replace('tenten-walkie-', '');
        this.activeMediaCall = call;

        // Answer call to receive remote audio stream
        call.answer();

        call.on('stream', (remoteStream) => {
          this.callListeners.forEach((fn) => fn(callerPin, remoteStream, call));
        });

        call.on('close', () => {
          this.activeMediaCall = null;
          this.callEndListeners.forEach((fn) => fn());
        });

        call.on('error', () => {
          this.activeMediaCall = null;
          this.callEndListeners.forEach((fn) => fn());
        });
      });

      this.peer.on('error', (err) => {
        console.warn('P2P connection notice:', err);
      });
    } catch (e) {
      console.warn('PeerJS init failed:', e);
    }
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.activeConnections.set(conn.peer, conn);
    });

    conn.on('data', (data) => {
      try {
        const msg = (typeof data === 'string' ? JSON.parse(data) : data) as BroadcastMessage;
        if (msg.profile && msg.senderPin) {
          saveKnownProfile({ pin: msg.senderPin, ...msg.profile });
        }
        this.messageListeners.forEach((fn) => fn(msg));
      } catch (e) {
        console.warn('Failed to parse P2P message', e);
      }
    });

    conn.on('close', () => {
      this.activeConnections.delete(conn.peer);
    });

    conn.on('error', () => {
      this.activeConnections.delete(conn.peer);
    });
  }

  // Start live voice call while holding PTT
  callFriend(targetPin: string, localStream: MediaStream): MediaConnection | null {
    if (!this.peer) return null;
    const targetPeerId = `tenten-walkie-${targetPin}`;

    try {
      const call = this.peer.call(targetPeerId, localStream);
      this.activeMediaCall = call;
      return call;
    } catch (err) {
      console.warn('Could not initiate live call to friend:', err);
      return null;
    }
  }

  // End live voice call on PTT release
  endCurrentCall() {
    if (this.activeMediaCall) {
      try {
        this.activeMediaCall.close();
      } catch {
        // ignore
      }
      this.activeMediaCall = null;
    }
  }

  sendToFriend(targetPin: string, msg: BroadcastMessage) {
    if (!this.peer) return;
    const targetPeerId = `tenten-walkie-${targetPin}`;

    const conn = this.activeConnections.get(targetPeerId);
    if (conn && conn.open) {
      conn.send(JSON.stringify(msg));
    } else {
      try {
        const newConn = this.peer.connect(targetPeerId);
        this.setupConnection(newConn);
        newConn.on('open', () => {
          newConn.send(JSON.stringify(msg));
        });
      } catch (err) {
        console.warn('Could not connect to friend peer:', err);
      }
    }
  }

  onMessage(listener: MessageHandler) {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  onIncomingCall(listener: CallHandler) {
    this.callListeners.add(listener);
    return () => {
      this.callListeners.delete(listener);
    };
  }

  onCallEnd(listener: CallEndHandler) {
    this.callEndListeners.add(listener);
    return () => {
      this.callEndListeners.delete(listener);
    };
  }

  // Verify and query if a user with targetPin exists online
  checkUserExists(targetPin: string, timeoutMs: number = 3800): Promise<{ exists: boolean; profile?: any }> {
    const cleanPin = targetPin.replace(/[^0-9]/g, '').trim();
    return new Promise((resolve) => {
      if (!cleanPin || cleanPin === this.myPin) {
        resolve({ exists: false });
        return;
      }

      // Check known profiles cache first
      const cached = getKnownProfile(cleanPin);

      const targetPeerId = `tenten-walkie-${cleanPin}`;
      let resolved = false;

      const finish = (result: { exists: boolean; profile?: any }) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          cleanupBroadcast();
          cleanupMsg();
          if (peerErrHandler && this.peer) {
            this.peer.off('error', peerErrHandler);
          }
          if (result.profile) {
            saveKnownProfile({ pin: cleanPin, ...result.profile });
          }
          resolve(result);
        }
      };

      const timer = setTimeout(() => {
        if (cached) {
          finish({ exists: true, profile: cached });
        } else {
          finish({ exists: false });
        }
      }, timeoutMs);

      // Listen for profile response from direct P2P data connection
      const cleanupMsg = this.onMessage((msg) => {
        if (msg.type === 'profile-response' && msg.senderPin === cleanPin) {
          finish({ exists: true, profile: msg.profile });
        }
      });

      // Listen for profile response from local BroadcastChannel
      const cleanupBroadcast = walkieBroadcast.subscribe((msg) => {
        if (msg.type === 'profile-response' && msg.senderPin === cleanPin) {
          finish({ exists: true, profile: msg.profile });
        }
      });

      // Listen for peer-unavailable error from PeerJS broker
      const peerErrHandler = (err: any) => {
        if (err && (err.type === 'peer-unavailable' || (err.message && err.message.includes(targetPeerId)))) {
          if (cached) {
            finish({ exists: true, profile: cached });
          } else {
            finish({ exists: false });
          }
        }
      };

      if (this.peer) {
        this.peer.on('error', peerErrHandler);
      }

      // Try connecting to peer
      if (this.peer) {
        try {
          const conn = this.peer.connect(targetPeerId, { reliable: true });

          conn.on('open', () => {
            this.setupConnection(conn);
            const queryMsg: BroadcastMessage = {
              type: 'profile-query',
              senderPin: this.myPin,
              senderName: '',
              targetPin: cleanPin,
              timestamp: Date.now(),
            };
            try {
              conn.send(JSON.stringify(queryMsg));
            } catch {
              // fallback
            }
          });

          conn.on('error', () => {
            if (cached) {
              finish({ exists: true, profile: cached });
            } else {
              finish({ exists: false });
            }
          });
        } catch {
          if (cached) {
            finish({ exists: true, profile: cached });
          } else {
            finish({ exists: false });
          }
        }
      } else {
        if (cached) {
          finish({ exists: true, profile: cached });
        } else {
          finish({ exists: false });
        }
      }
    });
  }
}

export const walkieP2P = new WalkieP2P();
