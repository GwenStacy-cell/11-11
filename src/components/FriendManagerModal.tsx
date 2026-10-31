import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  UserPlus,
  Hash,
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
  RotateCw,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { Friend, FriendRequest, FoundUser } from '../types';
import { audioEngine } from '../utils/audioEffects';

interface FriendManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  friends: Friend[];
  onAddFriendByPin: (pin: string) => void;
  onSearchUser?: (pin: string) => Promise<FoundUser | null>;
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
  onSearchUser,
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
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
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

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = searchPin.trim();
    if (!pin) {
      setErrorMsg('Please enter a 4-digit PIN code.');
      setFoundUser(null);
      setSuccessMsg('');
      return;
    }
    if (pin === myPin) {
      setErrorMsg("You cannot add your own PIN code!");
      setFoundUser(null);
      setSuccessMsg('');
      return;
    }

    // Check if already in local friends list
    const existing = friends.find((f) => f.pin === pin);
    if (existing && !existing.isPending) {
      onSelectFriend(existing);
      setSearchPin('');
      setErrorMsg('');
      setFoundUser(null);
      setSuccessMsg(`Switched to ${existing.name} (#${pin})!`);
      audioEngine.playPokeSound();
      setTimeout(() => setSuccessMsg(''), 4000);
      return;
    }

    // Real search (Instagram / Facebook logic: verify if user actually exists online)
    setIsSearching(true);
    setErrorMsg('');
    setSuccessMsg('');
    setFoundUser(null);

    if (onSearchUser) {
      try {
        const result = await onSearchUser(pin);
        setIsSearching(false);
        if (result) {
          setFoundUser(result);
          audioEngine.playPokeSound();
        } else {
          setErrorMsg(`No active user found with PIN #${pin}. Check the PIN or make sure your friend has 11:11 open.`);
        }
      } catch {
        setIsSearching(false);
        setErrorMsg(`Failed to search for PIN #${pin}. Please try again.`);
      }
    } else {
      setIsSearching(false);
      onAddFriendByPin(pin);
      setSearchPin('');
      setSuccessMsg(`Connection request sent to PIN #${pin}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSendFoundUserRequest = () => {
    if (!foundUser) return;
    onAddFriendByPin(foundUser.pin);
    audioEngine.playPokeSound();
    setSuccessMsg(`Friend request sent to ${foundUser.name} (#${foundUser.pin})!`);
    setFoundUser(null);
    setSearchPin('');
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
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Friends & PIN Search</h2>
              <p className="text-xs text-zinc-400">Search real users by PIN & manage circle</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* My PIN card */}
        <div className="mt-5 p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Your Walkie PIN
            </div>
            <div className="text-2xl font-black font-mono tracking-wider text-indigo-400 mt-0.5">
              #{myPin}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Give your PIN to friends so they can find you
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenQrCode && (
              <button
                onClick={() => onOpenQrCode()}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-indigo-300 rounded-xl text-xs font-semibold border border-zinc-700 flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                title="Show My QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span>QR</span>
              </button>
            )}

            <button
              onClick={handleCopyPin}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-indigo-950/40 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
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

        {/* Search Bar: Real User Search by 4-digit PIN */}
        <form onSubmit={handleSearchSubmit} className="mt-5 p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Search User by PIN</span>
            </div>

            {onOpenQrCode && (
              <button
                type="button"
                onClick={() => onOpenQrCode()}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
            Search for an active user with their 4-digit PIN to view their profile and send an invite.
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
                onChange={(e) => {
                  setSearchPin(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                  setFoundUser(null);
                }}
                placeholder="e.g. 7419"
                className="w-full pl-7 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500 placeholder-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={!searchPin.trim() || isSearching}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Real User Found Card (Instagram / Facebook Style) */}
          {foundUser && (
            <div className="mt-4 p-4 rounded-2xl bg-zinc-900 border border-indigo-500/50 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <img
                  src={foundUser.avatar}
                  alt={foundUser.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{foundUser.name}</span>
                    {foundUser.age && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {foundUser.age} yrs
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                      #{foundUser.pin}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-300 font-medium mt-0.5 truncate">
                    {foundUser.noteStatus || 'Available on 11:11'}
                  </div>
                  {foundUser.bio && (
                    <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {foundUser.bio}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-zinc-800 flex items-center justify-between">
                {friends.some((f) => f.pin === foundUser.pin && !f.isPending) ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Already connected in your circle
                  </span>
                ) : friends.some((f) => f.pin === foundUser.pin && f.isPending) ? (
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Friend request pending
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendFoundUserRequest}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Send Friend Request</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Incoming Friend Requests Section */}
        {incomingRequests.length > 0 && (
          <div className="mt-5 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
            <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-3">
              <span>Incoming Friend Requests ({incomingRequests.length})</span>
            </div>

            <div className="space-y-2">
              {incomingRequests.map((req) => (
                <div
                  key={req.pin}
                  className="p-3 bg-zinc-950/90 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={req.avatar}
                      alt={req.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span>{req.name}</span>
                        {req.age && (
                          <span className="text-[10px] text-zinc-400">({req.age})</span>
                        )}
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
                Enter your friend's 4-digit PIN above to search and connect!
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
                        ? 'bg-zinc-800/90 border-indigo-500/60 shadow-lg'
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
                            style={{ borderColor: f.accentColor || '#818cf8' }}
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">{f.name}</span>
                            {f.age && (
                              <span className="text-[10px] text-zinc-400">({f.age})</span>
                            )}
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
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 border border-zinc-700 transition-colors cursor-pointer"
                          title={`Refresh connection with ${f.name}`}
                        >
                          <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                        </button>

                        {/* Rename / Nickname Button */}
                        {!f.isPending && onRenameFriend && (
                          <button
                            type="button"
                            onClick={() => startRenaming(f)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 border border-zinc-700 transition-colors cursor-pointer"
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
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 border border-zinc-700 transition-colors cursor-pointer"
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
                              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider px-2 py-1 bg-indigo-950/70 rounded-lg border border-indigo-500/30">
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
                          className="flex-1 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(f.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className="px-2 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs cursor-pointer"
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
      </div>
    </div>
  );
};
