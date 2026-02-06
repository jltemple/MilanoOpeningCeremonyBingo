import React, { useState, useEffect } from 'react';
import { Share2, Trophy, RotateCcw } from 'lucide-react';

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
  { id: 43, text: "Pope or Vatican reference" }
];

export default function OlympicBingo() {
  const [teamName, setTeamName] = useState('');
  const [grid, setGrid] = useState([]);
  const [marked, setMarked] = useState(new Array(25).fill(false));
  const [isGenerated, setIsGenerated] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [winner, setWinner] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    const urlGrid = params.get('grid');
    const urlMarked = params.get('marked');

    if (urlName && urlGrid && urlMarked) {
      // Load from URL
      setTeamName(urlName);
      const gridIds = urlGrid.split(',').map(Number);
      const gridItems = gridIds.map(id => {
        if (id === 0) return { id: 0, text: "FREE SPACE" };
        return BINGO_ITEMS.find(item => item.id === id);
      });
      setGrid(gridItems);
      setMarked(urlMarked.split(',').map(v => v === '1'));
      setIsGenerated(true);
      setIsViewOnly(true);
    }
  }, []);

  useEffect(() => {
    if (marked.length === 25) {
      checkWin();
    }
  }, [marked]);

  const generateCard = () => {
    if (isGenerated) return;
    
    // Shuffle and pick 24 items (center is free space)
    const shuffled = [...BINGO_ITEMS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 24);
    
    // Insert free space at position 12 (center)
    const gridWithFree = [
      ...selected.slice(0, 12),
      { id: 0, text: "FREE SPACE" },
      ...selected.slice(12)
    ];
    
    setGrid(gridWithFree);
    const newMarked = new Array(25).fill(false);
    newMarked[12] = true; // Mark center as free
    setMarked(newMarked);
    setIsGenerated(true);
  };

  const toggleMark = (index) => {
    if (isViewOnly || index === 12) return; // Can't mark in view mode or free space
    const newMarked = [...marked];
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);
  };

  const checkWin = () => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (marked.slice(i * 5, i * 5 + 5).every(v => v)) {
        setWinner(true);
        return;
      }
    }
    
    // Check columns
    for (let i = 0; i < 5; i++) {
      if ([0, 1, 2, 3, 4].every(j => marked[i + j * 5])) {
        setWinner(true);
        return;
      }
    }
    
    // Check diagonals
    if ([0, 6, 12, 18, 24].every(i => marked[i])) {
      setWinner(true);
      return;
    }
    if ([4, 8, 12, 16, 20].every(i => marked[i])) {
      setWinner(true);
      return;
    }
    
    setWinner(false);
  };

  const shareCard = () => {
    const gridIds = grid.map(item => item.id).join(',');
    const markedBinary = marked.map(v => v ? '1' : '0').join(',');
    const url = `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(teamName)}&grid=${gridIds}&marked=${markedBinary}`;
    
    setShareUrl(url);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Copied to clipboard!');
      setShowShareModal(false);
    });
  };

  const reset = () => {
    if (confirm('Start over with a new card? This cannot be undone.')) {
      setGrid([]);
      setMarked(new Array(25).fill(false));
      setIsGenerated(false);
      setIsViewOnly(false);
      setWinner(false);
      setTeamName('');
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            🏔️ Milan-Cortina 2026 Opening Ceremony Bingo
          </h1>
        </div>

        {!isGenerated && (
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 mb-4 sm:mb-6 border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800">Generate Your Bingo Card</h2>
            <input
              type="text"
              placeholder="Enter your team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-3 border-2 border-slate-300 rounded-lg mb-4 text-base sm:text-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
            />
            <button
              onClick={generateCard}
              disabled={!teamName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-base sm:text-lg transition-colors shadow-sm"
            >
              Generate My Card
            </button>
            <p className="text-xs sm:text-sm text-slate-600 mt-3">
              ⚠️ Once generated, your card is locked. No regenerating!
            </p>
          </div>
        )}

        {isGenerated && (
          <>
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {isViewOnly ? `${teamName}'s Card` : `Team: ${teamName}`}
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  {!isViewOnly && (
                    <button
                      onClick={shareCard}
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
                    >
                      <Share2 size={18} />
                      Share
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="flex-1 sm:flex-none bg-slate-500 hover:bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>
              </div>
              
              {winner && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-center shadow-sm">
                  <Trophy className="inline-block text-amber-600 mr-2" size={24} />
                  <span className="text-xl sm:text-2xl font-bold text-amber-900">BINGO! 🎉</span>
                </div>
              )}

              {isViewOnly && (
                <p className="text-sm text-indigo-600 mb-3 sm:mb-4 bg-indigo-50 rounded-lg p-2 border border-indigo-200">👁️ Viewing {teamName}'s card (read-only)</p>
              )}

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {grid.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => toggleMark(index)}
                    disabled={isViewOnly}
                    className={`
                      relative w-full overflow-hidden
                      rounded-lg border-2
                      transition-all duration-200
                      ${marked[index] 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md text-slate-700'
                      }
                      ${index === 12 ? 'bg-amber-100 border-amber-400 font-semibold text-amber-900' : ''}
                      ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}
                    `}
                    style={{ aspectRatio: '1/1' }}
                  >
                    <div className="absolute inset-0 p-2 flex items-center justify-center text-center">
                      <div className={`leading-tight font-medium ${index === 12 ? 'text-base sm:text-lg font-bold' : 'text-[11px] sm:text-xs md:text-sm'}`}>
                        {item.text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowShareModal(false)}>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Share Your Bingo Card</h3>
              <p className="text-sm text-slate-600 mb-4">
                Copy this link and send it to your friends. They'll see your exact card and what you've marked.
              </p>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 break-all text-sm text-slate-700 font-mono">
                {shareUrl}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
