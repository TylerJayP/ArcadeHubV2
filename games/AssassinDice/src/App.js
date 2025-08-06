import React, { useState, useEffect, useCallback } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Play, Sword, Shield, X } from 'lucide-react';

const DiceIcon = ({ value, isRolling }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const IconComponent = icons[value - 1];
  return (
      <div className={`inline-block transition-transform duration-200 ${isRolling ? 'animate-spin' : ''}`}>
        <IconComponent size={40} />
      </div>
  );
};

const ArcadeAssassinGame = () => {
  const [gameState, setGameState] = useState('waitingToStart');
  const [gameResult, setGameResult] = useState(null);

  // Developer mode and training data (hidden from main experience)
  const [developerMode, setDeveloperMode] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [pendingDecisions, setPendingDecisions] = useState(new Map());
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [trainingStats, setTrainingStats] = useState({
    totalDecisions: 0,
    aiWins: 0,
    humanWins: 0,
    averageScore: 0,
    learningDecisions: 0,
    ruleBasedDecisions: 0
  });

  // Game state
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState([1, 1, 1, 1, 1, 1]);
  const [keptDice, setKeptDice] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
  const [diceKeptThisRoll, setDiceKeptThisRoll] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  const [attackMode, setAttackMode] = useState(null);
  const [attackDice, setAttackDice] = useState([]);

  const generateGameId = () => `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Training functions (only active in developer mode)
  const loadTrainingDataFromFile = useCallback(async () => {
    try {
      const response = await window.fs.readFile('decisionlog.json', { encoding: 'utf8' });
      const fileData = JSON.parse(response);
      if (developerMode) console.log(`📁 Loaded ${fileData.length} decisions from JSON file`);
      return fileData;
    } catch (error) {
      if (developerMode) console.log('📁 Could not load from JSON file, trying localStorage...', error.message);
      try {
        if (developerMode) console.log('💾 No training data available in this environment');
        return [];
      } catch (e) {
        if (developerMode) console.log('💾 No training data available');
        return [];
      }
    }
  }, [developerMode]);

  const analyzeTrainingData = async () => {
    const data = await loadTrainingDataFromFile();
    const analysis = {
      totalDecisions: data.length,
      winningDecisions: data.filter(d => d.gameWon).length,
      losingDecisions: data.filter(d => d.gameWon === false).length,
      averagePointsPerDecision: data.length > 0 ? data.reduce((sum, d) => sum + (d.pointsGained || 0), 0) / data.length : 0,
      earlyGameDecisions: data.filter(d => d.playerScore < 15).length,
      midGameDecisions: data.filter(d => d.playerScore >= 15 && d.playerScore < 25).length,
      lateGameDecisions: data.filter(d => d.playerScore >= 25).length,
      attackModeDecisions: data.filter(d => d.gameMode === 'attack').length,
      aiDecisions: data.filter(d => d.isAI).length,
      humanDecisions: data.filter(d => !d.isAI).length
    };
    if (developerMode) console.log('📊 Training Data Analysis:', analysis);
    return analysis;
  };

  const logDecision = (decisionData) => {
    if (!developerMode) return null;

    const decision = {
      ...decisionData,
      gameId: gameId,
      timestamp: new Date().toISOString(),
      turnNumber: Math.floor(gameLog.length / 4) + 1
    };
    setTrainingData(prev => [...prev, decision]);
    if (developerMode) console.log('🎲 Decision Logged:', decision);
    return decision.id || decision.timestamp;
  };

  const updateDecisionOutcome = (decisionId, outcome) => {
    if (!developerMode) return;

    setTrainingData(prev => prev.map(decision =>
        decision.timestamp === decisionId || decision.id === decisionId
            ? { ...decision, ...outcome }
            : decision
    ));
  };

  const exportTrainingData = () => {
    const dataToExport = JSON.stringify(trainingData, null, 2);
    if (developerMode) console.log('📊 Training Data Export:', dataToExport);

    try {
      if (developerMode) console.log(`💾 Would save ${trainingData.length} decisions to localStorage`);
      alert(`Training data exported to console! Check browser dev tools for JSON data.`);
    } catch (e) {
      if (developerMode) console.warn('Failed to save to localStorage:', e);
    }
    return dataToExport;
  };

  const logDiceKeepingDecision = (playerName, diceState, keptIndices, isAI = false) => {
    if (!developerMode) return null;

    const currentPlayer = players[currentPlayerIndex];
    const currentScore = calculateScore();
    const diceCount = 6;

    const decisionData = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      playerId: playerName,
      isAI: isAI,
      playerScore: currentPlayer?.score || 0,
      currentTurnScore: currentScore,
      opponentScores: players.filter((_, i) => i !== currentPlayerIndex).map(p => p.score),
      activeOpponents: players.filter(p => p.isActive).length - 1,
      gameMode: attackMode ? 'attack' : 'normal',
      attackTarget: attackMode?.target || null,
      diceRolled: dice.slice(0, diceCount),
      alreadyKeptDice: attackMode ? attackDice : keptDice,
      availableDiceIndices: dice.slice(0, diceCount).map((_, i) => i).filter(i =>
          !(attackMode ? attackDice.includes(i) : keptDice.includes(i))
      ),
      diceKeptIndices: Array.isArray(keptIndices) ? keptIndices : [keptIndices],
      diceKeptValues: Array.isArray(keptIndices)
          ? keptIndices.map(i => dice[i])
          : [dice[keptIndices]],
      pointsGained: Array.isArray(keptIndices)
          ? keptIndices.reduce((sum, i) => sum + dice[i], 0)
          : dice[keptIndices],
      turnFinalScore: null,
      gameWon: null,
      decisionQuality: null
    };

    const decisionId = logDecision(decisionData);
    if (developerMode && decisionId) {
      setPendingDecisions(prev => new Map(prev.set(decisionId, {
        playerId: playerName,
        turnStartTime: Date.now()
      })));
    }
    return decisionId;
  };

  const updateTurnOutcome = (finalTurnScore) => {
    if (!developerMode) return;

    const currentPlayer = players[currentPlayerIndex];
    pendingDecisions.forEach((pending, decisionId) => {
      if (pending.playerId === currentPlayer.name) {
        updateDecisionOutcome(decisionId, { turnFinalScore: finalTurnScore });
      }
    });
  };

  const updateGameOutcome = (winnerId) => {
    if (!developerMode) return;

    trainingData.forEach(decision => {
      updateDecisionOutcome(decision.id || decision.timestamp, {
        gameWon: decision.playerId === winnerId
      });
    });

    setGamesPlayed(prev => prev + 1);
    setTrainingStats(prev => ({
      ...prev,
      totalDecisions: trainingData.length,
      aiWins: winnerId !== 'PLAYER' ? prev.aiWins + 1 : prev.aiWins,
      humanWins: winnerId === 'PLAYER' ? prev.humanWins + 1 : prev.humanWins
    }));

    if (developerMode) {
      console.log('🏁 Game Complete - Exporting Training Data');
      exportTrainingData();
    }
  };

  // Game functions
  const playSound = (frequency, duration, type = 'sine') => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const startGameSession = () => {
    const newPlayers = [
      { id: 0, name: 'PLAYER', score: 30, isAI: false, isActive: true },
      { id: 1, name: 'AI OPPONENT', score: 30, isAI: true, isActive: true }
    ];

    const newGameId = generateGameId();
    setGameId(newGameId);
    setTrainingData([]);
    setPendingDecisions(new Map());
    if (developerMode) console.log(`🎲 New Game Started: ${newGameId}`);

    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setGameState('playing');
    setGameLog(['GAME STARTED! Player vs AI']);
    setGameResult(null);
    setDice([1, 1, 1, 1, 1, 1]);
    setKeptDice([]);
    setHasRolledThisTurn(false);
    setDiceKeptThisRoll(0);
    setAttackMode(null);
    setAttackDice([]);
  };

  const endGameSession = (result) => {
    setGameResult(result);
    setGameState('showingResult');

    if (result === 'win') {
      playSound(600, 0.5, 'square');
    } else {
      playSound(150, 1, 'sawtooth');
    }

    setTimeout(() => {
      setGameState('waitingToStart');
    }, 5000);
  };

  const calculateScore = () => {
    if (attackMode) {
      return attackDice.reduce((sum, index) => sum + dice[index], 0);
    }
    return keptDice.reduce((sum, index) => sum + dice[index], 0);
  };

  const rollDice = () => {
    const currentPlayer = players[currentPlayerIndex];
    const diceCount = 6;
    const keptCount = attackMode ? attackDice.length : keptDice.length;
    const remainingDice = diceCount - keptCount;

    if (hasRolledThisTurn && diceKeptThisRoll === 0) {
      return;
    }
    if (remainingDice <= 0) return;

    setIsRolling(true);
    setHasRolledThisTurn(true);
    setDiceKeptThisRoll(0);
    playSound(200, 0.1);

    setTimeout(() => {
      const newDice = dice.map((die, index) => {
        const isKept = attackMode ? attackDice.includes(index) : keptDice.includes(index);
        return isKept ? die : Math.floor(Math.random() * 6) + 1;
      });
      setDice(newDice);
      setIsRolling(false);
    }, 500);
  };

  const keepDie = (index) => {
    const currentPlayer = players[currentPlayerIndex];

    if (attackMode) {
      if (dice[index] === attackMode.target) {
        const wasKept = attackDice.includes(index);
        if (wasKept) {
          setAttackDice(attackDice.filter(i => i !== index));
          setDiceKeptThisRoll(Math.max(0, diceKeptThisRoll - 1));
        } else {
          setAttackDice([...attackDice, index]);
          setDiceKeptThisRoll(diceKeptThisRoll + 1);
          if (!currentPlayer.isAI) {
            logDiceKeepingDecision(currentPlayer.name, dice, index, false);
          }
        }
      }
    } else {
      const wasKept = keptDice.includes(index);
      if (wasKept) {
        setKeptDice(keptDice.filter(i => i !== index));
        setDiceKeptThisRoll(Math.max(0, diceKeptThisRoll - 1));
      } else {
        setKeptDice([...keptDice, index]);
        setDiceKeptThisRoll(diceKeptThisRoll + 1);
        if (!currentPlayer.isAI) {
          logDiceKeepingDecision(currentPlayer.name, dice, index, false);
        }
      }
    }
  };

  const nextPlayer = (playerList = players) => {
    let nextIndex = currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % playerList.length;
    } while (!playerList[nextIndex].isActive);

    setCurrentPlayerIndex(nextIndex);
    setDice([1, 1, 1, 1, 1, 1]);
    setKeptDice([]);
    setHasRolledThisTurn(false);
    setDiceKeptThisRoll(0);
    setAttackMode(null);
    setAttackDice([]);
  };

  const finalizeTurn = (newPlayers, logMessage) => {
    const currentPlayer = players[currentPlayerIndex];
    const finalTurnScore = calculateScore();
    updateTurnOutcome(finalTurnScore);

    setPlayers(newPlayers);
    setGameLog(prev => [...prev, logMessage]);

    const activePlayers = newPlayers.filter(p => p.isActive);
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      const isPlayerWin = winner.id === 0;
      const winMessage = `${winner.name} is the last survivor and wins!`;
      setGameLog(prev => [...prev, winMessage]);
      updateGameOutcome(winner.name);

      setTimeout(() => {
        endGameSession(isPlayerWin ? 'win' : 'lose');
      }, 2000);
      return;
    }
    nextPlayer(newPlayers);
  };

  const endTurn = () => {
    const currentPlayer = players[currentPlayerIndex];
    const currentScore = calculateScore();
    let newPlayers = [...players];
    let logMessage;

    if (currentScore === 30) {
      logMessage = `${currentPlayer.name} scores exactly 30 - SAFE! No damage taken.`;
    } else if (currentScore < 30) {
      const damage = 30 - currentScore;
      newPlayers[currentPlayerIndex].score = Math.max(0, newPlayers[currentPlayerIndex].score - damage);
      logMessage = `${currentPlayer.name} scores ${currentScore}, loses ${damage} health (${newPlayers[currentPlayerIndex].score} remaining)`;

      if (newPlayers[currentPlayerIndex].score <= 0) {
        newPlayers[currentPlayerIndex].isActive = false;
        logMessage += ` - ELIMINATED!`;
        playSound(150, 0.5);
      }
    } else {
      logMessage = `${currentPlayer.name} scores ${currentScore} and survives! Can enter attack mode.`;
    }

    setPlayers(newPlayers);
    setGameLog(prev => [...prev, logMessage]);

    const activePlayers = newPlayers.filter(p => p.isActive);
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      const isPlayerWin = winner.id === 0;
      const winMessage = `${winner.name} is the last survivor and wins!`;
      setGameLog(prev => [...prev, winMessage]);
      updateGameOutcome(winner.name);

      setTimeout(() => {
        endGameSession(isPlayerWin ? 'win' : 'lose');
      }, 2000);
      return;
    }

    nextPlayer(newPlayers);
  };

  const enterAttackMode = () => {
    const currentPlayer = players[currentPlayerIndex];
    const totalScore = calculateScore();
    const difference = totalScore - 30;

    if (difference > 0) {
      const logMessage = `${currentPlayer.name} enters attack mode hunting for ${difference}'s`;
      setAttackMode({ target: difference });
      setAttackDice([]);
      setKeptDice([]);
      setDiceKeptThisRoll(0);
      setHasRolledThisTurn(false);
      setGameLog(prev => [...prev, logMessage]);
      playSound(300, 0.3, 'square');
    }
  };

  const endAttack = () => {
    const currentPlayer = players[currentPlayerIndex];
    const damageDealt = attackDice.reduce((sum, index) => sum + dice[index], 0);
    let newPlayers = [...players];
    let logMessage = `${currentPlayer.name} dealt ${damageDealt} damage`;

    if (damageDealt > 0) {
      let remainingDamage = damageDealt;
      let targetIndex = currentPlayerIndex;

      while (remainingDamage > 0 && newPlayers.filter(p => p.isActive).length > 1) {
        targetIndex = (targetIndex + 1) % newPlayers.length;

        if (newPlayers[targetIndex].isActive) {
          const damageToDeal = Math.min(remainingDamage, newPlayers[targetIndex].score);
          newPlayers[targetIndex].score -= damageToDeal;
          remainingDamage -= damageToDeal;
          logMessage += ` to ${newPlayers[targetIndex].name}`;

          if (newPlayers[targetIndex].score <= 0) {
            newPlayers[targetIndex].isActive = false;
            logMessage += ` - ELIMINATED!`;
          }
        }
      }
    } else {
      logMessage += ` - attack failed!`;
    }
    finalizeTurn(newPlayers, logMessage);
  };

  // Simple AI (no training system in demo mode)
  const executeSimpleAI = useCallback(() => {
    if (gameState !== 'playing' || !players[currentPlayerIndex]?.isAI) return;

    const currentPlayer = players[currentPlayerIndex];
    const diceCount = 6;
    const currentScore = calculateScore();
    const aiDelay = 800;
    const aiDecisionDelay = 1200;

    // Rule-based AI decisions
    if (hasRolledThisTurn && diceKeptThisRoll === 0) {
      if (attackMode) {
        // Attack mode: Keep dice matching target
        const availableAttackIndices = dice
            .slice(0, diceCount)
            .map((die, i) => die === attackMode.target && !attackDice.includes(i) ? i : -1)
            .filter(i => i !== -1);

        if (availableAttackIndices.length > 0) {
          const numToKeep = Math.min(availableAttackIndices.length, Math.random() < 0.7 ? 1 : 2);
          const dicesToKeep = availableAttackIndices.slice(0, numToKeep);
          setAttackDice(prev => [...prev, ...dicesToKeep]);
          setDiceKeptThisRoll(dicesToKeep.length);
          logDiceKeepingDecision(currentPlayer.name, dice, dicesToKeep, true);
        } else {
          setTimeout(endAttack, aiDelay);
        }
      } else {
        // Normal mode: Keep good dice
        const availableDice = dice
            .slice(0, diceCount)
            .map((die, i) => keptDice.includes(i) ? null : { value: die, index: i })
            .filter(item => item !== null);

        let dicesToKeep = [];

        // Simple strategy: Keep dice based on current score needs
        if (currentScore < 15) {
          // Early game: Keep dice 3+
          dicesToKeep = availableDice.filter(d => d.value >= 3);
          if (dicesToKeep.length === 0) {
            dicesToKeep = availableDice.sort((a, b) => b.value - a.value).slice(0, 3);
          }
        } else if (currentScore < 25) {
          // Mid game: Keep dice 2+
          dicesToKeep = availableDice.filter(d => d.value >= 2);
          if (dicesToKeep.length === 0) {
            dicesToKeep = availableDice.sort((a, b) => b.value - a.value).slice(0, 2);
          }
        } else {
          // Late game: Be more strategic
          const needed = 30 - currentScore;
          const exactMatch = availableDice.find(d => d.value === needed);
          if (exactMatch) {
            dicesToKeep = [exactMatch];
          } else {
            const safeDice = availableDice.filter(d => d.value < needed);
            if (safeDice.length > 0) {
              dicesToKeep = safeDice.sort((a, b) => b.value - a.value);
            } else {
              dicesToKeep = [availableDice.sort((a, b) => a.value - b.value)[0]];
            }
          }
        }

        if (dicesToKeep.length > 0) {
          const indicesToKeep = dicesToKeep.map(d => d.index);
          setKeptDice(prev => [...prev, ...indicesToKeep]);
          setDiceKeptThisRoll(dicesToKeep.length);
          logDiceKeepingDecision(currentPlayer.name, dice, indicesToKeep, true);
        } else {
          setTimeout(endTurn, aiDelay);
        }
      }
      return;
    }

    // Decide next action after keeping dice
    if (hasRolledThisTurn && diceKeptThisRoll > 0) {
      if (attackMode) {
        const keptAttackDice = attackDice.length;
        const remainingDice = diceCount - keptAttackDice;
        if (remainingDice > 0 && (keptAttackDice < 2 || Math.random() < 0.5)) {
          setTimeout(rollDice, aiDecisionDelay);
        } else {
          setTimeout(endAttack, aiDelay);
        }
      } else {
        if (currentScore > 30) {
          setTimeout(enterAttackMode, aiDelay);
        } else if (currentScore === 30) {
          setTimeout(endTurn, aiDelay);
        } else {
          const totalKept = keptDice.length;
          const remainingDice = diceCount - totalKept;
          let shouldRollAgain = false;

          if (remainingDice > 0) {
            if (currentScore < 15) {
              shouldRollAgain = Math.random() < 0.7;
            } else if (currentScore < 22) {
              shouldRollAgain = remainingDice >= 1 && Math.random() < 0.6;
            } else if (currentScore < 27) {
              shouldRollAgain = remainingDice >= 2 && Math.random() < 0.4;
            } else {
              shouldRollAgain = remainingDice >= 3 && Math.random() < 0.3;
            }
          }

          if (shouldRollAgain) {
            setTimeout(rollDice, aiDecisionDelay);
          } else {
            setTimeout(endTurn, aiDelay);
          }
        }
      }
      return;
    }

    // Start of turn: Always roll first
    if (!hasRolledThisTurn) {
      setTimeout(rollDice, aiDelay);
    }
  }, [gameState, players, currentPlayerIndex, dice, keptDice, attackDice, hasRolledThisTurn, diceKeptThisRoll, attackMode, calculateScore, rollDice, endTurn, enterAttackMode, endAttack]);

  useEffect(() => {
    if (gameState === 'playing' && players[currentPlayerIndex]?.isAI) {
      const timer = setTimeout(executeSimpleAI, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentPlayerIndex, players, executeSimpleAI]);

  // Main Menu
  if (gameState === 'waitingToStart') {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
          <div className="text-center space-y-8 p-8 max-w-4xl">
            <div className="relative">
              <div className="text-8xl font-bold text-red-500 animate-pulse drop-shadow-2xl">🎲 ASSASSIN</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                DICE GAME
              </div>
            </div>
            <div className="text-xl text-gray-300">Battle against a challenging AI opponent!</div>

            {/* Game Rules Summary */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-600 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">🎯 How to Play</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="text-green-400">✅ <strong>Score 30:</strong> Safe! No damage</div>
                  <div className="text-red-400">❌ <strong>Under 30:</strong> Lose (30 - score) health</div>
                </div>
                <div className="space-y-2">
                  <div className="text-orange-400">⚔️ <strong>Over 30:</strong> Attack mode!</div>
                  <div className="text-blue-400">🏆 <strong>Goal:</strong> Last player standing wins</div>
                </div>
              </div>
            </div>

            {/* Developer Mode Panel (Hidden by default) */}
            {developerMode && (
                <div className="bg-gray-800 border-2 border-yellow-400 p-6 rounded-lg max-w-4xl mx-auto">
                  <div className="text-yellow-400 font-bold text-2xl mb-4">🔧 DEVELOPER AI TRAINING PANEL</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="text-blue-400 font-bold mb-3 text-lg">📊 Training Stats</h4>
                      <div className="space-y-2">
                        <div className="text-lg">Games Played: <span className="text-green-400 font-bold">{gamesPlayed}</span></div>
                        <div className="text-lg">Decisions Logged: <span className="text-green-400 font-bold">{trainingStats.totalDecisions}</span></div>
                        <div className="text-lg">AI Wins: <span className="text-red-400 font-bold">{trainingStats.aiWins}</span></div>
                        <div className="text-lg">Human Wins: <span className="text-blue-400 font-bold">{trainingStats.humanWins}</span></div>
                        <div className="text-lg">Win Rate: <span className="text-yellow-400 font-bold">
                      {gamesPlayed > 0 ? Math.round((trainingStats.humanWins / gamesPlayed) * 100) : 0}%
                    </span></div>
                      </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="text-purple-400 font-bold mb-3 text-lg">🧠 AI Learning Stats</h4>
                      <div className="space-y-2">
                        <div className="text-lg">Learning Decisions: <span className="text-green-400 font-bold">{trainingStats.learningDecisions}</span></div>
                        <div className="text-lg">Rule-Based Decisions: <span className="text-orange-400 font-bold">{trainingStats.ruleBasedDecisions}</span></div>
                        <div className="text-lg">Learning Rate: <span className="text-purple-400 font-bold">
                      {(trainingStats.learningDecisions + trainingStats.ruleBasedDecisions) > 0
                          ? Math.round((trainingStats.learningDecisions / (trainingStats.learningDecisions + trainingStats.ruleBasedDecisions)) * 100)
                          : 0}%
                    </span></div>
                        <div className="text-sm text-gray-300 mt-2">
                          {trainingStats.learningDecisions > 10
                              ? "🧠 AI is actively learning!"
                              : trainingStats.learningDecisions > 0
                                  ? "🤖 AI starting to learn..."
                                  : "📚 AI needs more training data"
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={analyzeTrainingData}
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded font-bold"
                    >
                      📈 ANALYZE DATA
                    </button>
                    <button
                        onClick={exportTrainingData}
                        className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded font-bold"
                    >
                      📤 EXPORT JSON
                    </button>
                    <button
                        onClick={() => {
                          if (window.confirm('Are you sure? This will clear all training data!')) {
                            setTrainingData([]);
                            setGamesPlayed(0);
                            setTrainingStats({
                              totalDecisions: 0,
                              aiWins: 0,
                              humanWins: 0,
                              averageScore: 0,
                              learningDecisions: 0,
                              ruleBasedDecisions: 0
                            });
                            if (developerMode) console.log('🗑️ Training data cleared');
                            alert('Training data cleared!');
                          }
                        }}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded font-bold"
                    >
                      🗑️ CLEAR DATA
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <div className="text-center">
                      <button
                          onClick={async () => {
                            const data = await analyzeTrainingData();
                            alert(`🧠 AI Training Summary:\n• ${data.totalDecisions} decisions available\n• ${data.winningDecisions} winning moves\n• ${Math.round(data.averagePointsPerDecision)} avg points per decision\n• ${data.aiDecisions} AI decisions vs ${data.humanDecisions} human decisions\n• Learning Rate: ${Math.round((trainingStats.learningDecisions / (trainingStats.learningDecisions + trainingStats.ruleBasedDecisions)) * 100) || 0}%`);
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg"
                      >
                        🧠 AI LEARNING ANALYSIS
                      </button>
                      <div className="mt-3 text-sm text-gray-400">
                        Play games to train the AI - it learns from each decision!
                      </div>
                    </div>
                  </div>
                </div>
            )}

            <button
                onClick={startGameSession}
                className="text-3xl font-bold px-12 py-6 rounded-xl transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 animate-pulse shadow-2xl border-2 border-green-400"
            >
              🎮 START GAME
            </button>

            {/* Developer Options Toggle */}
            {!developerMode && (
                <div className="pt-8">
                  <button
                      onClick={() => setDeveloperMode(true)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Developer Options
                  </button>
                </div>
            )}

            {/* Close Developer Mode */}
            {developerMode && (
                <div className="pt-4">
                  <button
                      onClick={() => setDeveloperMode(false)}
                      className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    ← Close Developer Mode
                  </button>
                </div>
            )}
          </div>
        </div>
    );
  }

  // Game Over Screen
  if (gameState === 'showingResult') {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
          <div className="text-center space-y-8 p-8">
            {gameResult === 'win' ? (
                <>
                  <div className="text-8xl animate-bounce drop-shadow-2xl">🏆</div>
                  <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
                    VICTORY!
                  </div>
                  <div className="text-3xl text-green-400">You defeated the AI!</div>
                </>
            ) : (
                <>
                  <div className="text-8xl animate-pulse drop-shadow-2xl">💀</div>
                  <div className="text-6xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-lg">
                    GAME OVER
                  </div>
                  <div className="text-3xl text-gray-400">The AI was victorious this time!</div>
                </>
            )}
            <div className="text-xl text-gray-300 bg-gray-800 bg-opacity-50 rounded-lg p-4">
              Play again to test your skills!
            </div>
          </div>
        </div>
    );
  }

  // Game Playing Screen
  if (gameState === 'playing') {
    const currentPlayer = players[currentPlayerIndex];
    const currentScore = calculateScore();
    const diceCount = 6;
    const keptCount = attackMode ? attackDice.length : keptDice.length;
    const remainingDice = diceCount - keptCount;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-4">
          <div className="bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-xl mb-4 flex justify-between items-center shadow-2xl border border-red-600">
            <div className="text-4xl font-bold flex items-center gap-3">
              <span className="text-red-400">🎲</span>
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                ASSASSIN
              </span>
            </div>
            <div className="flex items-center gap-6 text-xl">
              <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to quit this game and return to the main menu?')) {
                      setGameState('waitingToStart');
                      setPlayers([]);
                      setCurrentPlayerIndex(0);
                      setDice([1, 1, 1, 1, 1, 1]);
                      setKeptDice([]);
                      setHasRolledThisTurn(false);
                      setDiceKeptThisRoll(0);
                      setAttackMode(null);
                      setAttackDice([]);
                      setGameLog([]);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg"
              >
                🏠 QUIT GAME
              </button>
            </div>
          </div>

          {/* Developer Mode Panel in Game (Hidden by default) */}
          {developerMode && (
              <div className="bg-gray-800 border-2 border-yellow-400 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-yellow-400 font-bold text-lg">🔧 AI LEARNING MONITOR</div>
                  <button
                      onClick={() => setDeveloperMode(false)}
                      className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-3 rounded">
                    <h4 className="text-blue-400 font-bold mb-2">📊 Game Stats</h4>
                    <div className="space-y-1 text-sm">
                      <div>Games: <span className="text-green-400">{gamesPlayed}</span></div>
                      <div>Decisions: <span className="text-green-400">{trainingStats.totalDecisions}</span></div>
                      <div>AI Wins: <span className="text-red-400">{trainingStats.aiWins}</span></div>
                      <div>Human Wins: <span className="text-blue-400">{trainingStats.humanWins}</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-3 rounded">
                    <h4 className="text-purple-400 font-bold mb-2">🧠 AI Learning</h4>
                    <div className="space-y-1 text-sm">
                      <div>Learning: <span className="text-purple-400">{trainingStats.learningDecisions}</span></div>
                      <div>Rules: <span className="text-orange-400">{trainingStats.ruleBasedDecisions}</span></div>
                      <div>Learn Rate: <span className="text-yellow-400">
                    {Math.round((trainingStats.learningDecisions / (trainingStats.learningDecisions + trainingStats.ruleBasedDecisions)) * 100) || 0}%
                  </span></div>
                      <div className="text-xs text-gray-300">
                        {trainingStats.learningDecisions > 10 ? "🧠 Active" : "📚 Training"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-3 rounded">
                    <h4 className="text-green-400 font-bold mb-2">💾 Actions</h4>
                    <div className="space-y-2">
                      <button
                          onClick={exportTrainingData}
                          className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                      >
                        📤 Export
                      </button>
                      <button
                          onClick={analyzeTrainingData}
                          className="w-full px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                      >
                        📊 Analyze
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            {players.map((player, index) => (
                <div
                    key={player.id}
                    className={`p-8 rounded-xl border-2 transition-all duration-300 shadow-lg ${
                        index === currentPlayerIndex
                            ? 'border-yellow-400 bg-gradient-to-br from-yellow-900 to-yellow-800 bg-opacity-50 scale-105 shadow-yellow-400/20'
                            : player.isActive
                                ? 'border-gray-500 bg-gradient-to-br from-gray-800 to-gray-900'
                                : 'border-red-500 bg-gradient-to-br from-red-900 to-red-800 bg-opacity-30 opacity-60'
                    }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${player.id === 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {player.name} {player.isAI && '🧠'}
                    </div>
                    <div className="text-5xl font-bold mb-2">{player.score}</div>
                    <div className="text-lg text-gray-300">
                      {player.isActive ? '❤️ HEALTH' : '💀 ELIMINATED'}
                    </div>
                    {index === currentPlayerIndex && (
                        <div className="mt-2 text-yellow-400 font-bold animate-pulse">
                          ⚡ ACTIVE TURN
                        </div>
                    )}
                  </div>
                </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl mb-6 shadow-2xl border border-gray-600">
            <div className="flex justify-between items-center mb-6">
              <div className="text-3xl font-bold">
                {attackMode ? (
                    <span className="text-red-400 flex items-center gap-3">
                  <Sword size={32} className="animate-pulse" />
                  ATTACK MODE - Hunt {attackMode.target}'s
                </span>
                ) : (
                    <span className="text-blue-400 flex items-center gap-3">
                  <Shield size={32} />
                      {currentPlayer?.name}'s Turn {currentPlayer?.isAI && '🧠'}
                </span>
                )}
              </div>
              <div className="text-2xl bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold">
                Score: {currentScore}
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-6 gap-6">
                {dice.slice(0, diceCount).map((die, index) => {
                  const isKept = attackMode ? attackDice.includes(index) : keptDice.includes(index);
                  const canKeep = attackMode ? die === attackMode.target : true;

                  return (
                      <button
                          key={index}
                          onClick={() => keepDie(index)}
                          disabled={!canKeep || currentPlayer?.isAI}
                          className={`w-24 h-24 rounded-xl border-3 flex items-center justify-center transition-all duration-300 text-4xl shadow-lg ${
                              isKept
                                  ? 'border-green-400 bg-gradient-to-br from-green-900 to-green-800 bg-opacity-50 scale-110 shadow-green-400/30'
                                  : canKeep && !currentPlayer?.isAI
                                      ? 'border-gray-400 bg-gradient-to-br from-gray-700 to-gray-800 hover:border-white hover:scale-110 cursor-pointer hover:shadow-white/20'
                                      : 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50 cursor-not-allowed'
                          }`}
                      >
                        <DiceIcon value={die} isRolling={isRolling} />
                      </button>
                  );
                })}
              </div>
            </div>

            {!currentPlayer?.isAI && (
                <div className="flex justify-center gap-6">
                  <button
                      onClick={rollDice}
                      disabled={remainingDice <= 0 || isRolling}
                      className={`px-10 py-5 text-2xl font-bold rounded-xl transition-all duration-300 shadow-lg ${
                          remainingDice > 0 && !isRolling
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-blue-500/20'
                              : 'bg-gradient-to-r from-gray-600 to-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <Play size={28} className="inline mr-3" />
                    ROLL ({remainingDice} dice)
                  </button>

                  {attackMode ? (
                      <button
                          onClick={endAttack}
                          disabled={!hasRolledThisTurn}
                          className={`px-10 py-5 text-2xl font-bold rounded-xl transition-all duration-300 shadow-lg ${
                              hasRolledThisTurn
                                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105 shadow-red-500/20'
                                  : 'bg-gradient-to-r from-gray-600 to-gray-700 opacity-50 cursor-not-allowed'
                          }`}
                      >
                        <Sword size={28} className="inline mr-3" />
                        ATTACK
                      </button>
                  ) : (
                      <div className="flex gap-4">
                        {currentScore > 30 && (
                            <button
                                onClick={enterAttackMode}
                                className="px-10 py-5 text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-orange-500/20"
                            >
                              <Sword size={28} className="inline mr-3" />
                              ATTACK MODE
                            </button>
                        )}
                        <button
                            onClick={endTurn}
                            disabled={!hasRolledThisTurn}
                            className={`px-10 py-5 text-2xl font-bold rounded-xl transition-all duration-300 shadow-lg ${
                                hasRolledThisTurn
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 shadow-green-500/20'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-700 opacity-50 cursor-not-allowed'
                            }`}
                        >
                          <Shield size={28} className="inline mr-3" />
                          END TURN
                        </button>
                      </div>
                  )}
                </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-600">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
              📜 Game Log
            </h3>
            <div className="max-h-40 overflow-y-auto text-base space-y-2">
              {gameLog.slice(-8).map((log, index) => (
                  <div key={index} className="text-gray-300 p-2 bg-gray-700 bg-opacity-50 rounded">{log}</div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return null;
};

export default ArcadeAssassinGame;
