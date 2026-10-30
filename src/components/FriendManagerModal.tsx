import React, { useState } from 'react';
import { X, Copy, Check, UserPlus, Hash, Shield, QrCode, Scan } from 'lucide-react';
import { Friend } from '../types';
import { audioEngine } from '../utils/audioEffects';

interface FriendManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  friends: Friend[];
  onAddFriend: (name: string, pin: string) => void;
  onSelectFriend: (friend: Friend) => void;
  activeFriendId: string;
  onOpenQrCode?: (targetFriend?: { name: string; pin: string }) => void;
}

export const FriendManagerModal: React.FC<FriendManagerModalProps> = ({
  isOpen,
  onClose,
  myPin,
  friends,
  onAddFriend,
  onSelectFriend,
  activeFriendId,
  onOpenQrCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendPin, setFriendPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(myPin);
    setCopied(true);
    audioEngine.playPokeSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || !friendPin.trim()) {
      setErrorMsg('Please enter both a name and a PIN code.');
      return;
    }
    if (friendPin.trim() === myPin) {
      setErrorMsg("You cannot add your own PIN code!");
      return;
    }
    onAddFriend(friendName.trim(), friendPin.trim());
    setFriendName('');
    setFriendPin('');
    setErrorMsg('');
    audioEngine.playPokeSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Friends & PIN Codes</h2>
              <p className="text-xs text-zinc-400">Share QR codes & add friends</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* My PIN card with QR Code button */}
        <div className="mt-5 p-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900 border border-zinc-700/60 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Your Walkie PIN Code
            </div>
            <div className="text-2xl font-black font-mono tracking-wider text-amber-400 mt-0.5">
              {myPin}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Share PIN or QR code to connect
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenQrCode && (
              <button
                onClick={() => onOpenQrCode()}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-bold border border-zinc-700 flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                title="Show My QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span>QR</span>
              </button>
            )}

            <button
              onClick={handleCopyPin}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-950/40"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add Friend Form & QR Scan trigger */}
        <form onSubmit={handleAdd} className="mt-5 p-4 bg-zinc-800/40 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Add Friend by PIN</span>
            </div>

            {onOpenQrCode && (
              <button
                type="button"
                onClick={() => onOpenQrCode()}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Friend's Name</label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Liam"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">4-Digit PIN</label>
              <input
                type="text"
                maxLength={6}
                value={friendPin}
                onChange={(e) => setFriendPin(e.target.value)}
                placeholder="e.g. 7419"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="mt-2 text-[11px] text-rose-400">{errorMsg}</div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add to Circle</span>
            </button>

            {onOpenQrCode && (
              <button
                type="button"
                onClick={() => onOpenQrCode()}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Scan QR Code"
              >
                <Scan className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan</span>
              </button>
            )}
          </div>
        </form>

        {/* Existing Friends List */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Your Walkie Circle ({friends.length})
          </div>

          <div className="space-y-2">
            {friends.map((f) => {
              const isActive = f.id === activeFriendId;
              return (
                <div
                  key={f.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-zinc-800 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectFriend(f);
                      audioEngine.playPokeSound();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="relative">
                      <img
                        src={f.avatar}
                        alt={f.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border-2"
                        style={{ borderColor: f.accentColor }}
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                          f.onlineStatus === 'online'
                            ? 'bg-emerald-500'
                            : f.onlineStatus === 'in-class'
                            ? 'bg-amber-500'
                            : 'bg-zinc-500'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{f.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-700/60 text-zinc-300">
                          #{f.pin}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                        {f.statusText}
                      </div>
                    </div>
                  </div>

                  {/* Actions: QR & Select */}
                  <div className="flex items-center gap-2">
                    {onOpenQrCode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQrCode({ name: f.name, pin: f.pin });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 border border-zinc-700 transition-colors"
                        title={`Show ${f.name}'s QR Code`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectFriend(f);
                        audioEngine.playPokeSound();
                      }}
                      className="text-right"
                    >
                      {isActive ? (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 bg-emerald-950/50 rounded-lg border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500 hover:text-zinc-300">
                          Switch
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Scan friend QR codes to instantly join each other's 11:11 walkie network.</span>
        </div>
      </div>
    </div>
  );
};
