import React from 'react';
import { X, History, Radio, Volume2, Hand, Play, Clock, Trash2 } from 'lucide-react';
import { TransmissionLog } from '../types';
import { audioEngine } from '../utils/audioEffects';

interface TransmissionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TransmissionLog[];
  onClearLogs: () => void;
}

export const TransmissionHistoryModal: React.FC<TransmissionHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Transmission Log</h2>
              <p className="text-xs text-zinc-400">Recent live broadcasts & pokes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-xl transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs list */}
        <div className="mt-4 space-y-2.5">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-400" />
              No transmissions yet. Hold the PTT button to talk or send a poke!
            </div>
          ) : (
            logs.map((log) => {
              const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between ${
                    log.isSelf
                      ? 'bg-zinc-800/40 border-zinc-800'
                      : 'bg-zinc-800/80 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        log.type === 'poke'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : log.type === 'soundboard'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : log.isSelf
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {log.type === 'poke' ? (
                        <Hand className="w-4 h-4" />
                      ) : log.type === 'soundboard' ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <Radio className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {log.senderName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          #{log.senderPin}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formattedTime}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-zinc-300">
                        {log.type === 'poke' ? (
                          <span className="text-amber-400 italic font-medium">
                            👉 Sent a nudge poke!
                          </span>
                        ) : log.type === 'soundboard' ? (
                          <span className="text-rose-400">
                            🔊 Sound effect: "{log.transcript}"
                          </span>
                        ) : (
                          <span>
                            {log.transcript || `Voice transmission (${log.durationSec}s)`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {log.transcript && log.type === 'voice' && (
                    <button
                      onClick={() => {
                        audioEngine.speakRadioVoice(log.transcript || 'Voice replay');
                      }}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors"
                      title="Replay Voice"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>Replay</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
