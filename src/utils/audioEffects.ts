import { VoiceFilter } from '../types';

// Web Audio API synthesizer for authentic walkie-talkie and Ten Ten sound effects

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.85;
  private currentLiveAudio: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getDestinationNode(): AudioNode {
    this.getContext();
    return this.masterGain || this.ctx!.destination;
  }

  setIncomingVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  getIncomingVolume(): number {
    return this.currentVolume;
  }

  // PTT Start: iconic high-pitched chirping beep
  playPttStart() {
    try {
      const ctx = this.getContext();
      const dest = this.getDestinationNode();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.05);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.08);

      // Add a tiny static burst
      this.playStaticBurst(0.05, 0.08);
    } catch {
      // AudioContext might be blocked before first gesture
    }
  }

  // PTT Release / Roger Beep: dual-tone frequency drop + static tail
  playRogerBeep() {
    try {
      const ctx = this.getContext();
      const dest = this.getDestinationNode();
      const now = ctx.currentTime;

      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1200, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // Tone 2 immediately following
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now + 0.09);
      gain2.gain.setValueAtTime(0.15, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(dest);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.19);

      // Static squelch tail
      setTimeout(() => {
        this.playStaticBurst(0.12, 0.15);
      }, 180);
    } catch {
      // ignore
    }
  }

  // Radio squelch / static burst: bandpass filtered white noise
  playStaticBurst(duration = 0.15, volume = 0.15) {
    try {
      const ctx = this.getContext();
      const dest = this.getDestinationNode();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to simulate CB radio speaker (300Hz - 3400Hz)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1800;
      bandpass.Q.value = 1.2;

      const gain = ctx.createGain();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(dest);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  // Poke sound: cheerful pop/nudge tone
  playPokeSound() {
    try {
      const ctx = this.getContext();
      const dest = this.getDestinationNode();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // ignore
    }
  }

  // Soundboard alerts
  playSoundboard(type: 'siren' | 'roger' | 'alert' | 'wakeup') {
    const ctx = this.getContext();
    const dest = this.getDestinationNode();
    const now = ctx.currentTime;

    if (type === 'siren') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.25);
      osc.frequency.linearRampToValueAtTime(600, now + 0.5);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.75);
      osc.frequency.linearRampToValueAtTime(600, now + 1.0);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 1.15);
    } else if (type === 'roger') {
      this.playRogerBeep();
    } else if (type === 'alert') {
      [0, 0.15, 0.3].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1046.5, now + offset); // High C
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } else if (type === 'wakeup') {
      // Dramatic ascending chime
      [400, 500, 650, 800, 1000].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.12);
      });
    }
  }

  // Play live incoming real-time audio stream from friend
  playLiveStream(stream: MediaStream, onStart?: () => void) {
    try {
      this.playPttStart();
      setTimeout(() => {
        this.playStaticBurst(0.1, 0.12);
      }, 70);

      const audio = new Audio();
      audio.srcObject = stream;
      audio.volume = this.currentVolume;
      audio.autoplay = true;
      this.currentLiveAudio = audio;

      audio.play().catch((err) => {
        console.warn('Autoplay error on live stream:', err);
      });

      onStart?.();
    } catch (e) {
      console.warn('Error playing live stream:', e);
    }
  }

  // Stop live stream and play Roger beep
  stopLiveStream(onEnd?: () => void) {
    if (this.currentLiveAudio) {
      try {
        this.currentLiveAudio.pause();
        this.currentLiveAudio.srcObject = null;
      } catch {
        // ignore
      }
      this.currentLiveAudio = null;
    }
    this.playRogerBeep();
    onEnd?.();
  }

  // Play real recorded voice audio through Web Audio API with radio filters & beeps
  async playRecordedVoice(
    audioDataUrl: string,
    filter: VoiceFilter = 'classic-walkie',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    try {
      const ctx = this.getContext();
      const dest = this.getDestinationNode();

      // Play authentic walkie-talkie opening squelch chirp
      this.playPttStart();
      setTimeout(() => {
        this.playStaticBurst(0.1, 0.14);
      }, 70);

      try {
        const res = await fetch(audioDataUrl);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;

        let lastNode: AudioNode = source;

        if (filter === 'classic-walkie') {
          const bandpass = ctx.createBiquadFilter();
          bandpass.type = 'bandpass';
          bandpass.frequency.value = 1800;
          bandpass.Q.value = 1.2;
          source.connect(bandpass);
          lastNode = bandpass;
        } else if (filter === 'megaphone') {
          const bandpass = ctx.createBiquadFilter();
          bandpass.type = 'bandpass';
          bandpass.frequency.value = 2400;
          bandpass.Q.value = 3.0;
          source.connect(bandpass);
          lastNode = bandpass;
        } else if (filter === 'deep-radio') {
          const lowshelf = ctx.createBiquadFilter();
          lowshelf.type = 'lowshelf';
          lowshelf.frequency.value = 350;
          lowshelf.gain.value = 8;
          source.connect(lowshelf);
          lastNode = lowshelf;
        }

        lastNode.connect(dest);

        source.onended = () => {
          this.playRogerBeep();
          onEnd?.();
        };

        setTimeout(() => {
          onStart?.();
          source.start(0);
        }, 160);
      } catch (decodeErr) {
        // Fallback to HTML5 Audio element if format cannot be decoded directly
        const audio = new Audio(audioDataUrl);
        audio.volume = this.currentVolume;
        setTimeout(() => {
          onStart?.();
          audio.play().catch(() => {});
        }, 160);
        audio.onended = () => {
          this.playRogerBeep();
          onEnd?.();
        };
        audio.onerror = () => {
          this.playRogerBeep();
          onEnd?.();
        };
      }
    } catch (e) {
      this.playRogerBeep();
      onEnd?.();
    }
  }

  // Simulated live radio voice through speech synthesis with squelch
  speakRadioVoice(
    text: string,
    gender: 'female' | 'male' = 'female',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!('speechSynthesis' in window)) {
      onStart?.();
      setTimeout(() => onEnd?.(), 1500);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Opening squelch
    this.playPttStart();
    setTimeout(() => {
      this.playStaticBurst(0.1, 0.12);
    }, 70);

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // slightly faster radio cadence
      utterance.pitch = gender === 'female' ? 1.25 : 0.85;
      utterance.volume = this.currentVolume; // sync with Web Audio API master gain!

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // pick English voice
        const engVoice = voices.find((v) =>
          gender === 'female'
            ? v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google US English'))
            : v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (engVoice) utterance.voice = engVoice;
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        // Roger beep closing
        this.playRogerBeep();
        onEnd?.();
      };

      utterance.onerror = () => {
        this.playRogerBeep();
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    }, 180);
  }
}

export const audioEngine = new AudioEngine();
