import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Share2, Trophy, Snowflake, CheckCircle2 } from 'lucide-react';

const BINGO_ITEMS = [
  // Italy & Host Nation (1-8)
  { id: 1, text: "Someone yells 'Ciao, Milano!'" },
  { id: 2, text: "Green-white-red lighting everywhere" },
  { id: 3, text: "Opera singer performs" },
  { id: 4, text: "Vespa or Fiat on stage" },
  { id: 5, text: "Mountain/ski tribute segment" },
  { id: 6, text: "Leonardo da Vinci reference" },
  { id: 7, text: "Pasta or espresso visual" },
  { id: 8, text: "Gondola appears (it's not Venice!)" },

  // Performance & Production (9-17)
  { id: 9, text: "Massive synchronized dance number" },
  { id: 10, text: "LED floor projections" },
  { id: 11, text: "Kids singing multiple languages" },
  { id: 12, text: "Performance drags on forever" },
  { id: 13, text: "Confusing abstract art segment" },
  { id: 14, text: "Famous Italian pop star cameo" },
  { id: 15, text: "Drones forming shapes in sky" },
  { id: 16, text: "Someone playing violin in snow" },
  { id: 17, text: "Dramatic narration about unity" },

  // Athletes & Parade (18-23)
  { id: 18, text: "Giant flag carried awkwardly" },
  { id: 19, text: "Small country gets huge cheers" },
  { id: 20, text: "Athletes dancing during parade" },
  { id: 21, text: "Athletes trading pins on camera" },
  { id: 22, text: "Dog mascot interaction" },
  { id: 23, text: "Athletes sitting during parade" },

  // Broadcast Clichés (24-32)
  { id: 24, text: "Time zones mentioned repeatedly" },
  { id: 25, text: "'Blends tradition and modernity'" },
  { id: 26, text: "Name or place mispronounced" },
  { id: 27, text: "Commentators talk over performance" },
  { id: 28, text: "'The Olympics are about unity'" },
  { id: 29, text: "Tone shift when USA enters" },
  { id: 30, text: "Random trivia about tiny delegation" },
  { id: 31, text: "Commentary about the weather" },
  { id: 32, text: "Celebrities shown in audience" },

  // Olympic Traditions (33-37)
  { id: 33, text: "Olympic torch almost goes out" },
  { id: 34, text: "Overly complex cauldron lighting" },
  { id: 35, text: "Multiple fake-out cauldron lights" },
  { id: 36, text: "Very solemn Olympic oath moment" },
  { id: 37, text: "Fireworks right after cauldron lights" },

  // Technical Chaos (38-43)
  { id: 38, text: "Microphone doesn't work" },
  { id: 39, text: "Camera cuts to wrong person" },
  { id: 40, text: "Performer out of sync" },
  { id: 41, text: "Long awkward pause for stage reset" },
  { id: 42, text: "Fireworks mistimed" },
  { id: 43, text: "Pope or Vatican reference" },
];

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];
const STORAGE_KEY = 'mc2026-bingo';

function saveToStorage(teamName, grid, marked) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      teamName,
      gridIds: grid.map((item) => item.id),
      marked,
    }));
  } catch {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.teamName || !data.gridIds || !data.marked) return null;
    const grid = data.gridIds.map((id) => {
      if (id === 0) return { id: 0, text: 'FREE SPACE' };
      return BINGO_ITEMS.find((item) => item.id === id);
    });
    if (grid.some((item) => !item)) return null;
    return { teamName: data.teamName, grid, marked: data.marked };
  } catch {
    return null;
  }
}

function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Milano Cortina brand colors + Italian flag
    const colors = ['#00B2A9', '#0077C8', '#78BE20', '#FFD700', '#009246', '#CE2B37', '#FFFFFF'];

    for (let i = 0; i < 150; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.y < canvas.height + 20);
      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      particlesRef.current = [];
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

export default function OlympicBingo() {
  const [teamName, setTeamName] = useState('');
  const [grid, setGrid] = useState([]);
  const [marked, setMarked] = useState(new Array(25).fill(false));
  const [isGenerated, setIsGenerated] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [winner, setWinner] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMarkedIndex, setLastMarkedIndex] = useState(null);

  useEffect(() => {
    // URL params take priority (shared card view)
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    const urlGrid = params.get('grid');
    const urlMarked = params.get('marked');

    if (urlName && urlGrid && urlMarked) {
      setTeamName(urlName);
      const gridIds = urlGrid.split(',').map(Number);
      const gridItems = gridIds.map((id) => {
        if (id === 0) return { id: 0, text: 'FREE SPACE' };
        return BINGO_ITEMS.find((item) => item.id === id);
      });
      setGrid(gridItems);
      setMarked(urlMarked.split(',').map((v) => v === '1'));
      setIsGenerated(true);
      setIsViewOnly(true);
      return;
    }

    // Otherwise restore from localStorage
    const saved = loadFromStorage();
    if (saved) {
      setTeamName(saved.teamName);
      setGrid(saved.grid);
      setMarked(saved.marked);
      setIsGenerated(true);
    }
  }, []);

  const checkWin = useCallback((currentMarked) => {
    for (let i = 0; i < 5; i++) {
      if (currentMarked.slice(i * 5, i * 5 + 5).every((v) => v)) return true;
    }
    for (let i = 0; i < 5; i++) {
      if ([0, 1, 2, 3, 4].every((j) => currentMarked[i + j * 5])) return true;
    }
    if ([0, 6, 12, 18, 24].every((i) => currentMarked[i])) return true;
    if ([4, 8, 12, 16, 20].every((i) => currentMarked[i])) return true;
    return false;
  }, []);

  useEffect(() => {
    if (marked.length === 25) {
      const won = checkWin(marked);
      if (won && !winner) {
        setWinner(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else if (!won && winner) {
        setWinner(false);
      }
    }
  }, [marked, checkWin, winner]);

  const generateCard = () => {
    if (isGenerated || !teamName.trim()) return;

    const shuffled = [...BINGO_ITEMS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 24);

    const gridWithFree = [
      ...selected.slice(0, 12),
      { id: 0, text: 'FREE SPACE' },
      ...selected.slice(12),
    ];

    setGrid(gridWithFree);
    const newMarked = new Array(25).fill(false);
    newMarked[12] = true;
    setMarked(newMarked);
    setIsGenerated(true);
    saveToStorage(teamName, gridWithFree, newMarked);
  };

  const toggleMark = (index) => {
    if (isViewOnly || index === 12) return;
    const newMarked = [...marked];
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);
    setLastMarkedIndex(newMarked[index] ? index : null);
    setTimeout(() => setLastMarkedIndex(null), 300);
    saveToStorage(teamName, grid, newMarked);
  };

  const shareCard = () => {
    const gridIds = grid.map((item) => item.id).join(',');
    const markedBinary = marked.map((v) => (v ? '1' : '0')).join(',');
    const url = `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(teamName)}&grid=${gridIds}&marked=${markedBinary}`;

    setShareUrl(url);
    setShowShareModal(true);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const markedCount = marked.filter((v) => v).length - 1;

  return (
    <div className="min-h-screen mc-background p-3 sm:p-4">
      <div className="mc-wave" />
      <Confetti active={showConfetti} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header - pill-style nav inspired by official site */}
        <div className="text-center mb-4 sm:mb-6 pt-2">
          <div className="inline-flex items-center gap-3 mc-pill px-5 sm:px-8 py-2.5 sm:py-3 mb-3 shadow-lg">
            <Snowflake className="text-mc-teal hidden sm:block" size={22} />
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-mc-navy leading-tight">
                Milano Cortina 2026
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-mc-teal">
                Opening Ceremony Bingo
              </p>
            </div>
            <Snowflake className="text-mc-teal hidden sm:block" size={22} />
          </div>
        </div>

        {/* Team Name Input / Card Generation */}
        {!isGenerated && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-mc-navy">
              Generate Your Bingo Card
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              Enter your team name to get a unique, randomized bingo card.
              Once generated, it's locked in — no take-backs!
            </p>
            <input
              type="text"
              placeholder="Enter your team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateCard()}
              className="w-full p-3 sm:p-4 border-2 border-slate-200 rounded-full mb-4 text-base sm:text-lg text-mc-navy placeholder-slate-400 focus:outline-none focus:border-mc-teal focus:ring-2 focus:ring-mc-teal/20 transition-all"
              autoFocus
            />
            <button
              onClick={generateCard}
              disabled={!teamName.trim()}
              className="mc-btn-primary w-full py-3 sm:py-4 px-6 text-base sm:text-lg"
            >
              Generate My Card
            </button>
          </div>
        )}

        {/* Bingo Card */}
        {isGenerated && (
          <>
            {/* Card container - white like the official nav pill */}
            <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-5 mb-4">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-mc-navy">
                    {isViewOnly ? `${teamName}'s Card` : `Team: ${teamName}`}
                  </h2>
                  <p className="text-mc-teal text-xs sm:text-sm font-semibold">
                    {markedCount}/24 spotted
                  </p>
                </div>
                {!isViewOnly && (
                  <button
                    onClick={shareCard}
                    className="bg-mc-teal/10 hover:bg-mc-teal/20 border border-mc-teal/30 text-mc-teal hover:text-mc-teal-dark px-5 py-2.5 rounded-full transition-all flex items-center gap-2 text-base font-semibold"
                    title="Share card"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                )}
              </div>

              {/* Winner Banner */}
              {winner && (
                <div
                  className="rounded-xl p-3 mb-3 text-center animate-pulse"
                  style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(0,178,169,0.15))' }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="text-mc-gold" size={22} />
                    <span className="text-xl sm:text-2xl font-black text-mc-navy tracking-wide">
                      BINGO!
                    </span>
                    <Trophy className="text-mc-gold" size={22} />
                  </div>
                </div>
              )}

              {/* View-Only Notice */}
              {isViewOnly && (
                <p className="text-sm text-mc-teal mb-3 bg-mc-teal/5 rounded-full py-2 px-4 border border-mc-teal/20 text-center font-medium">
                  Viewing {teamName}'s card (read-only)
                </p>
              )}

              {/* BINGO Column Headers */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                {BINGO_LETTERS.map((letter) => (
                  <div
                    key={letter}
                    className="text-center text-lg sm:text-2xl font-black text-mc-teal py-0.5"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              {/* Bingo Grid */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {grid.map((item, index) => {
                  const isFreeSpace = index === 12;
                  const isMarked = marked[index];
                  const justMarked = lastMarkedIndex === index;

                  return (
                    <button
                      key={index}
                      onClick={() => toggleMark(index)}
                      disabled={isViewOnly || isFreeSpace}
                      className={`
                        relative w-full overflow-hidden
                        rounded-lg sm:rounded-xl border-2
                        transition-all duration-200
                        ${justMarked ? 'scale-95' : 'scale-100'}
                        ${
                          isFreeSpace
                            ? 'border-mc-teal/40 text-mc-navy'
                            : isMarked
                            ? 'border-mc-teal text-mc-navy shadow-sm'
                            : 'border-slate-200 hover:border-mc-teal/50 hover:shadow-md text-slate-700'
                        }
                        ${isViewOnly ? 'cursor-default' : isFreeSpace ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                      `}
                      style={{
                        aspectRatio: '1/1',
                        background: isFreeSpace
                          ? 'linear-gradient(135deg, rgba(0,178,169,0.12), rgba(120,190,32,0.12))'
                          : isMarked
                          ? 'linear-gradient(135deg, rgba(0,178,169,0.10), rgba(0,119,200,0.08))'
                          : 'white',
                      }}
                    >
                      {isMarked && !isFreeSpace && (
                        <CheckCircle2
                          className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-mc-teal"
                          size={14}
                        />
                      )}
                      <div className="absolute inset-0 p-1 sm:p-2 flex items-center justify-center text-center">
                        <div
                          className={`leading-tight font-medium ${
                            isFreeSpace
                              ? 'text-sm sm:text-base font-bold'
                              : 'text-[10px] sm:text-xs md:text-sm'
                          }`}
                        >
                          {isFreeSpace && (
                            <Snowflake
                              className="mx-auto mb-0.5 text-mc-teal"
                              size={18}
                            />
                          )}
                          {item.text}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* How to Play */}
            {!isViewOnly && (
              <div className="text-center text-white/70 text-xs sm:text-sm px-4 pb-4 drop-shadow">
                Tap squares as moments happen during the ceremony. Get 5 in a
                row (horizontal, vertical, or diagonal) to win!
              </div>
            )}
          </>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div
            className="fixed inset-0 bg-mc-navy-deep/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-mc-navy mb-2">
                Share Your Bingo Card
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Send this link to friends so they can see your card and what
                you've marked off.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 break-all text-sm text-mc-cyan font-mono">
                {shareUrl}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 font-semibold py-2.5 px-4 rounded-full transition-all ${
                    copied
                      ? 'bg-mc-lime/20 border border-mc-lime/40 text-green-700'
                      : 'mc-btn-primary'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 px-4 rounded-full transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-white/40 text-xs pb-4 mt-2 drop-shadow">
          Milano Cortina 2026 Opening Ceremony Bingo
        </div>
      </div>
    </div>
  );
}
