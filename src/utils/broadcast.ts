import { BroadcastMessage } from '../types';

type Listener = (msg: BroadcastMessage) => void;

class WalkieBroadcast {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('tenten-walkie-network');
        this.channel.onmessage = (event) => {
          const data = event.data as BroadcastMessage;
          this.listeners.forEach((fn) => fn(data));
        };
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }
    }
  }

  send(msg: BroadcastMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('Failed to postMessage', e);
      }
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const walkieBroadcast = new WalkieBroadcast();
