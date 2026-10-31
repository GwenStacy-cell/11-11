import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  UserPlus,
  Hash,
  Shield,
  QrCode,
  Scan,
  Trash2,
  Users,
  Ban,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Clock,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { Friend, FriendRequest } from '../types';
import { audioEngine } from '../utils/audioEffects';

interface FriendManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  friends: Friend[];
  onAddFriendByPin: (pin: string) => void;
  onDeleteFriend?: (id: string) => void;
  onSelectFriend: (friend: Friend) => void;
  activeFriendId?: string;
  onOpenQrCode?: (targetFriend?: { name: string; pin: string }) => void;
  blockedPins?: string[];
  onToggleBlockPin?: (pin: string) => void;
  incomingRequests?: FriendRequest[];
  onAcceptRequest?: (req: FriendRequest) => void;
  onDeclineRequest?: (pin: string) => void;
  onRenameFriend?: (id: string, newNickname: string) => void;
}

export const FriendManagerModal: React.FC<FriendManagerModalProps> = ({
  isOpen,
  onClose,
  myPin,
  friends,
  onAddFriendByPin,
  onDeleteFriend,
  onSelectFriend,
  activeFriendId,
  onOpenQrCode,
  blockedPins = [],
  onToggleBlockPin,
  incomingRequests = [],
  onAcceptRequest,
  onDeclineRequest,
  onRenameFriend,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchPin, setSearchPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!isOpen) return null;

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(myPin);
    setCopied(true);
    audioEngine.playPokeSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = searchPin.trim();
    if (!pin) {
      setErrorMsg('Please enter a 4-digit PIN code.');
      setSuccessMsg('');
      return;
    }
    if (pin === myPin) {
      setErrorMsg("You cannot add your own PIN code!");
      setSuccessMsg('');
      return;
    }

    const existing = friends.find((f) => f.pin === pin);
    if (existing && !existing.isPending) {
      onAddFriendByPin(pin);
      onSelectFriend(existing);
      setSearchPin('');
      setErrorMsg('');
      setSuccessMsg(`Refreshed connection with ${existing.name} (#${pin})!`);
      audioEngine.playPokeSound();
      setTimeout(() => setSuccessMsg(''), 4000);
      return;
    }

    onAddFriendByPin(pin);
    setSearchPin('');
    setErrorMsg('');
    setSuccessMsg(`Connection request sent to PIN #${pin}! Waiting for them to accept...`);
    audioEngine.playPokeSound();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const startRenaming = (friend: Friend) => {
    setRenamingId(friend.id);
    setRenameValue(friend.name);
  };

  const handleSaveRename = (friendId: string) => {
    if (onRenameFriend) {
      onRenameFriend(friendId, renameValue.trim());
      audioEngine.playPokeSound();
    }
    setRenamingId(null);
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
              <h2 className="text-base font-bold text-white">Friends & PIN Search</h2>
              <p className="text-xs text-zinc-400">Search by 4-digit PIN & manage walkie circle</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
              #{myPin}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Give your PIN to friends so they can add you
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenQrCode && (
              <button
                onClick={() => onOpenQrCode()}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-bold border border-zinc-700 flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                title="Show My QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span>QR</span>
              </button>
            )}

            <button
              onClick={handleCopyPin}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-950/40 cursor-pointer"
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

        {/* Search Bar: Add User by 4-digit PIN */}
        <form onSubmit={handleSearchSubmit} className="mt-5 p-4 bg-zinc-800/40 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Search Friend by PIN</span>
            </div>

            {onOpenQrCode && (
              <button
                type="button"
                onClick={() => onOpenQrCode()}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
            Enter your friend's 4-digit PIN code. When they accept, their real name, photo, and banner will sync automatically!
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono font-bold text-xs">
                #
              </span>
              <input
                type="text"
                maxLength={4}
                value={searchPin}
                onChange={(e) => setSearchPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 7419"
                className="w-full pl-7 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 placeholder-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={!searchPin.trim()}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Send Request</span>
            </button>
          </div>

          {errorMsg && <div className="mt-2 text-[11px] font-medium text-rose-400">{errorMsg}</div>}
          {successMsg && <div className="mt-2 text-[11px] font-medium text-emerald-400">{successMsg}</div>}
        </form>

        {/* Incoming Friend Requests Section */}
        {incomingRequests.length > 0 && (
          <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Incoming Friend Requests ({incomingRequests.length})</span>
            </div>

            <div className="space-y-2">
              {incomingRequests.map((req) => (
                <div
                  key={req.pin}
                  className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={req.avatar}
                      alt={req.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span>{req.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">#{req.pin}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {req.noteStatus || 'Wants to connect with you'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onAcceptRequest?.(req)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow cursor-pointer"
                      title="Accept friend request"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeclineRequest?.(req.pin)}
                      className="p-1.5 bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Decline request"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Friends List */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Your Walkie Circle ({friends.length})
          </div>

          {friends.length === 0 ? (
            <div className="py-7 px-4 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-500 mb-2.5">
                <Users className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="text-xs font-bold text-zinc-300">No friends in your circle yet</div>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Enter your friend's 4-digit PIN above to send a request, or share your own PIN to connect!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => {
                const isActive = f.id === activeFriendId;
                const isRenamingThis = renamingId === f.id;

                return (
                  <div
                    key={f.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                      isActive
                        ? 'bg-zinc-800/90 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                        : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => {
                          if (!f.isPending) {
                            onSelectFriend(f);
                            audioEngine.playPokeSound();
                          }
                        }}
                        className={`flex items-center gap-3 flex-1 min-w-0 ${
                          f.isPending ? 'opacity-70' : 'cursor-pointer'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={f.avatar}
                            alt={f.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border-2"
                            style={{ borderColor: f.accentColor || '#f59e0b' }}
                          />
                          {!f.isPending && (
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                                f.onlineStatus === 'online'
                                  ? 'bg-emerald-500'
                                  : f.onlineStatus === 'in-class'
                                  ? 'bg-amber-500'
                                  : 'bg-zinc-500'
                              }`}
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{f.name}</span>
                            {f.realName && f.realName !== f.name && (
                              <span className="text-[10px] text-zinc-400 truncate">({f.realName})</span>
                            )}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-700/60 text-zinc-300 shrink-0">
                              #{f.pin}
                            </span>
                            {f.isPending && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Pending</span>
                              </span>
                            )}
                            {blockedPins.includes(f.pin) && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Blocked
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-[170px]">
                            {f.statusText}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {/* Refresh / Re-send Connection Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddFriendByPin(f.pin);
                            setSuccessMsg(`Refreshed connection handshake with #${f.pin}!`);
                            audioEngine.playPokeSound();
                            setTimeout(() => setSuccessMsg(''), 3000);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 border border-zinc-700 transition-colors cursor-pointer"
                          title={`Refresh connection with ${f.name}`}
                        >
                          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        {/* Rename / Nickname Button */}
                        {!f.isPending && onRenameFriend && (
                          <button
                            type="button"
                            onClick={() => startRenaming(f)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 border border-zinc-700 transition-colors cursor-pointer"
                            title="Rename friend / set nickname"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onOpenQrCode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenQrCode({ name: f.name, pin: f.pin });
                            }}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 border border-zinc-700 transition-colors cursor-pointer"
                            title={`Show ${f.name}'s QR Code`}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!f.isPending && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectFriend(f);
                              audioEngine.playPokeSound();
                            }}
                            className="cursor-pointer"
                          >
                            {isActive ? (
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 bg-emerald-950/50 rounded-lg border border-emerald-500/30">
                                Active
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-400 hover:text-zinc-200 px-1.5 py-1">
                                Switch
                              </span>
                            )}
                          </button>
                        )}

                        {onToggleBlockPin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBlockPin(f.pin);
                              audioEngine.playPokeSound();
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              blockedPins.includes(f.pin)
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 border-zinc-800'
                            }`}
                            title={blockedPins.includes(f.pin) ? `Unblock ${f.name}` : `Block ${f.name}`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDeleteFriend && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Remove ${f.name} (#${f.pin}) from your circle? You can re-add them anytime.`)) {
                                onDeleteFriend(f.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title={`Remove ${f.name} from circle`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Rename Form */}
                    {isRenamingThis && (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          placeholder="Enter nickname..."
                          className="flex-1 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(f.id)}
                          className="px-2.5 py-1 bg-amber-500 text-zinc-950 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-lg text-xs hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Real-time human-to-human walkie network. Zero bots or AI audio.</span>
        </div>
      </div>
    </div>
  );
};
