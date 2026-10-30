import { Peer, DataConnection, MediaConnection } from 'peerjs';
import { BroadcastMessage } from '../types';

type MessageHandler = (msg: BroadcastMessage) => void;
type CallHandler = (senderPin: string, stream: MediaStream) => void;

class WalkieP2P {
  private peer: Peer | null = null;
  private myPin: string = '';
  private activeConnections: Map<string, DataConnection> = new Map();
  private activeMediaCall: MediaConnection | null = null;
  private messageListeners: Set<MessageHandler> = new Set();
  private callListeners: Set<CallHandler> = new Set();
  public isConnected: boolean = false;

  init(myPin: string) {
    if (this.peer || typeof window === 'undefined') return;
    this.myPin = myPin;

    const peerId = `tenten-walkie-${myPin}`;
    try {
      this.peer = new Peer(peerId, {
        debug: 1,
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
          this.callListeners.forEach((fn) => fn(callerPin, remoteStream));
        });

        call.on('close', () => {
          this.activeMediaCall = null;
        });

        call.on('error', () => {
          this.activeMediaCall = null;
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
}

export const walkieP2P = new WalkieP2P();
