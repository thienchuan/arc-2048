import React, { useState, useEffect, useRef } from "react";
import Board from "./components/Board";
import {
  initializeGrid,
  moveTiles,
  isGameOver,
  hasReached2048,
} from "./components/gameLogic";
import { IoMdRefresh } from "react-icons/io";
import GameOverPopup from "./components/GameOverPopup";
import { getTxExplorerLink } from "./blockchain/arcConfig";
import { toUserFacingMintError } from "./blockchain/errors";
import { checkGameIdMinted, mintResultNft } from "./blockchain/mintResultNft";
import {
  connectWallet,
  ensureArcNetwork,
  getCurrentAccount,
  getCurrentChainId,
  getWalletProvider,
} from "./blockchain/wallet";
import { createGameSession, getGameDurationSeconds } from "./utils/gameSession";

const INITIAL_MINT_STATE = {
  status: "idle",
  txHash: "",
  tokenId: "",
  error: "",
};

const App = () => {
  const [grid, setGrid] = useState(initializeGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    () => localStorage.getItem("bestScore") || 0
  );
  const [newTiles, setNewTiles] = useState([]);
  const [mergedTiles, setMergedTiles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSession, setGameSession] = useState(() => createGameSession());
  const [walletAccount, setWalletAccount] = useState("");
  const [walletChainId, setWalletChainId] = useState(null);
  const [walletMessage, setWalletMessage] = useState("");
  const [mintState, setMintState] = useState(INITIAL_MINT_STATE);
  const [mintedGameIds, setMintedGameIds] = useState({});
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const gameEnded = gameOver || gameWon;

  const runMove = (direction) => {
    if (gameEnded) {
      return;
    }

    const { newGrid, newScore, newTiles, mergedTiles } = moveTiles(grid, direction);

    if (newGrid) {
      setGrid(newGrid);
      setScore((prevScore) => prevScore + newScore);
      setNewTiles(newTiles);
      setMergedTiles(mergedTiles);
      if (isGameOver(newGrid)) {
        setGameOver(true);
      }
      if (hasReached2048(newGrid)) {
        setGameWon(true);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!e.key.startsWith("Arrow")) {
      return;
    }

    runMove(e.key.replace("Arrow", "").toLowerCase());
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid, gameEnded]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bestScore", score);
    }
  }, [score, bestScore]);

  const handleNewGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setNewTiles([]);
    setMergedTiles([]);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
    setGameSession(createGameSession());
    setMintState(INITIAL_MINT_STATE);
    setWalletMessage("");
  };

  const handleSwipe = (direction) => {
    runMove(direction);
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!touchStartX.current || !touchStartY.current) {
        return;
      }

      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;

      const deltaX = touchStartX.current - touchEndX;
      const deltaY = touchStartY.current - touchEndY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          handleSwipe("left");
        } else {
          handleSwipe("right");
        }
      } else {
        if (deltaY > 0) {
          handleSwipe("up");
        } else {
          handleSwipe("down");
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [grid, gameEnded]);

  useEffect(() => {
    const syncWallet = async () => {
      try {
        const account = await getCurrentAccount();
        const chainId = await getCurrentChainId();
        setWalletAccount(account);
        setWalletChainId(chainId);
      } catch {
        // Wallet may not be installed yet.
      }
    };

    syncWallet();
  }, []);

  useEffect(() => {
    let provider;
    try {
      provider = getWalletProvider();
    } catch {
      return;
    }

    const handleAccountsChanged = (accounts) => {
      setWalletAccount(accounts[0] || "");
      setWalletMessage("");
    };

    const handleChainChanged = (chainHex) => {
      setWalletChainId(Number.parseInt(chainHex, 16));
      setWalletMessage("");
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      setWalletMessage("");
      const account = await connectWallet();
      const chainId = await ensureArcNetwork();
      setWalletAccount(account);
      setWalletChainId(chainId);
    } catch (error) {
      setWalletMessage(toUserFacingMintError(error));
    }
  };

  const handleMintResult = async () => {
    if (!gameEnded) return;
    if (!walletAccount) {
      setMintState({ ...INITIAL_MINT_STATE, status: "failed", error: "Please connect wallet first." });
      return;
    }
    if (score <= 0) {
      setMintState({ ...INITIAL_MINT_STATE, status: "failed", error: "Invalid score. Score must be greater than 0." });
      return;
    }
    if (mintedGameIds[gameSession.gameId]) {
      setMintState({ ...INITIAL_MINT_STATE, status: "failed", error: "This gameId has already been minted." });
      return;
    }

    try {
      setMintState({ ...INITIAL_MINT_STATE, status: "waiting_wallet_confirm" });
      const chainId = await ensureArcNetwork();
      setWalletChainId(chainId);

      const currentAccount = await getCurrentAccount();
      if (!currentAccount) {
        throw new Error("Wallet is disconnected. Please connect wallet again.");
      }
      if (currentAccount.toLowerCase() !== walletAccount.toLowerCase()) {
        setWalletAccount(currentAccount);
      }

      const alreadyMinted = await checkGameIdMinted(gameSession.gameId);
      if (alreadyMinted) {
        throw new Error("DuplicateGameId");
      }

      const playedAt = Math.floor(Date.now() / 1000);
      const durationSeconds = getGameDurationSeconds(gameSession.startedAt);

      const { txHash, tokenId } = await mintResultNft({
        account: currentAccount,
        score,
        durationSeconds,
        gameId: gameSession.gameId,
        playedAt,
        onTxSubmitted: (hash) => {
          setMintState({
            status: "pending_tx",
            txHash: hash,
            tokenId: "",
            error: "",
          });
        },
      });

      setMintedGameIds((prev) => ({ ...prev, [gameSession.gameId]: true }));
      setMintState({ status: "success", txHash, tokenId, error: "" });
    } catch (error) {
      console.error("Mint result NFT failed:", error);
      setMintState({
        status: "failed",
        txHash: "",
        tokenId: "",
        error: toUserFacingMintError(error),
      });
    }
  };

  const canMint =
    gameEnded &&
    score > 0 &&
    Boolean(walletAccount) &&
    !mintedGameIds[gameSession.gameId] &&
    mintState.status !== "waiting_wallet_confirm" &&
    mintState.status !== "pending_tx";

  const txExplorerLink = getTxExplorerLink(mintState.txHash);
  const durationSeconds = getGameDurationSeconds(gameSession.startedAt);
  const popupTitle = gameWon ? "You Won!" : "Game Over";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      {!gameStarted ? (
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
            2048
          </h1>
          <button
            className="text-2xl font-semibold bg-gray-800 hover:bg-gray-700 rounded-md text-white py-2 px-4 transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleNewGame}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
            2048
          </h1>
          <div className="flex mb-4 space-x-4 items-center justify-between">
            <div className="text-xl font-semibold bg-gray-800 rounded-md text-white py-2 px-3 shadow-lg">
              Score: {score}
            </div>
            <div className="text-xl font-semibold bg-gray-800 rounded-md text-white py-2 px-3 shadow-lg">
              Best: {bestScore}
            </div>
            <button
              className="text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md text-white py-2 px-3 transition duration-300 ease-in-out"
              onClick={handleConnectWallet}
            >
              {walletAccount ? "Wallet Connected" : "Connect Wallet"}
            </button>
            <button
              className="text-2xl font-semibold bg-gray-800 hover:bg-gray-700 rounded-md text-white py-2 px-3 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={handleNewGame}
            >
              <IoMdRefresh />
            </button>
          </div>
          {walletMessage && (
            <p className="text-sm text-amber-300 mb-3">{walletMessage}</p>
          )}
          <Board grid={grid} newTiles={newTiles} mergedTiles={mergedTiles} />
          {gameEnded && (
            <GameOverPopup
              title={popupTitle}
              score={score}
              durationSeconds={durationSeconds}
              gameId={gameSession.gameId}
              account={walletAccount}
              canMint={canMint}
              mintState={mintState}
              txExplorerLink={txExplorerLink}
              onConnectWallet={handleConnectWallet}
              onMintResult={handleMintResult}
              onNewGame={handleNewGame}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
