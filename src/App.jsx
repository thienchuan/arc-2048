import { useState, useEffect, useRef, useCallback } from "react";
import Board from "./components/Board";
import {
  initializeGrid,
  moveTiles,
  isGameOver,
  hasReached2048,
} from "./components/gameLogic";
import { IoMdRefresh } from "react-icons/io";
import GameOverPopup from "./components/GameOverPopup";
import { toUserFacingMintError, toUserFacingWalletError } from "./blockchain/errors";
import { checkGameIdMinted, mintResultNft } from "./blockchain/mintResultNft";
import {
  ARC_NETWORK,
  getNetworkById,
  getTxExplorerLinkByChainId,
  SUPPORTED_NETWORKS,
} from "./blockchain/networks";
import {
  connectWallet,
  ensureNetwork,
  formatNativeBalance,
  getCurrentAccount,
  getNativeBalance,
  getCurrentChainId,
  getWalletProvider,
} from "./blockchain/wallet";
import { createGameSession, getGameDurationSeconds } from "./utils/gameSession";

const INITIAL_MINT_STATE = {
  status: "idle",
  txHash: "",
  tokenId: "",
  error: "",
  chainId: null,
};

const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
  const [selectedNetworkId, setSelectedNetworkId] = useState(ARC_NETWORK.id);
  const [walletNativeBalance, setWalletNativeBalance] = useState("");
  const [walletMessage, setWalletMessage] = useState("");
  const [mintState, setMintState] = useState(INITIAL_MINT_STATE);
  const [mintedGameIds, setMintedGameIds] = useState({});
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const gameEnded = gameOver || gameWon;
  const selectedNetwork = getNetworkById(selectedNetworkId) || ARC_NETWORK;

  const runMove = useCallback((direction) => {
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
  }, [gameEnded, grid]);

  const handleKeyDown = useCallback((e) => {
    if (!e.key.startsWith("Arrow")) {
      return;
    }

    runMove(e.key.replace("Arrow", "").toLowerCase());
  }, [runMove]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  const handleSwipe = useCallback((direction) => {
    runMove(direction);
  }, [runMove]);

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
  }, [handleSwipe]);

  useEffect(() => {
    const syncWallet = async () => {
      try {
        const account = await getCurrentAccount();
        const chainId = await getCurrentChainId();
        setWalletAccount(account);
        setWalletChainId(chainId);

        if (getNetworkById(chainId)) {
          setSelectedNetworkId(chainId);
        }
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
      const parsedChainId = Number.parseInt(chainHex, 16);
      setWalletChainId(parsedChainId);
      if (getNetworkById(parsedChainId)) {
        setSelectedNetworkId(parsedChainId);
      }
      setWalletMessage("");
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  useEffect(() => {
    const refreshNativeBalance = async () => {
      if (!walletAccount) {
        setWalletNativeBalance("");
        return;
      }

      try {
        const balance = await getNativeBalance(walletAccount);
        const formattedBalance = formatNativeBalance(
          balance,
          selectedNetwork.currencyDecimals,
          selectedNetwork.currencySymbol
        );
        setWalletNativeBalance(formattedBalance);
      } catch {
        setWalletNativeBalance(`-- ${selectedNetwork.currencySymbol}`);
      }
    };

    refreshNativeBalance();
  }, [walletAccount, walletChainId, selectedNetworkId, selectedNetwork.currencyDecimals, selectedNetwork.currencySymbol]);

  const handleConnectWallet = async () => {
    try {
      setWalletMessage("");
      const account = await connectWallet();
      const chainId = await ensureNetwork(selectedNetwork);
      setWalletAccount(account);
      setWalletChainId(chainId);
    } catch (error) {
      setWalletMessage(toUserFacingWalletError(error));
    }
  };

  const handleNetworkChange = async (event) => {
    const nextNetworkId = Number(event.target.value);
    const nextNetwork = getNetworkById(nextNetworkId);
    if (!nextNetwork) {
      return;
    }

    const previousNetworkId = selectedNetworkId;
    setSelectedNetworkId(nextNetworkId);
    setWalletMessage("");

    if (!walletAccount) {
      return;
    }

    try {
      const chainId = await ensureNetwork(nextNetwork);
      setWalletChainId(chainId);
    } catch (error) {
      const fallbackNetworkId =
        walletChainId && getNetworkById(walletChainId) ? walletChainId : previousNetworkId;
      setSelectedNetworkId(fallbackNetworkId);
      setWalletMessage(toUserFacingWalletError(error));
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
      const chainId = await getCurrentChainId();
      setWalletChainId(chainId);
      if (getNetworkById(chainId)) {
        setSelectedNetworkId(chainId);
      }

      const currentAccount = await getCurrentAccount();
      if (!currentAccount) {
        throw new Error("Wallet is disconnected. Please connect wallet again.");
      }
      if (currentAccount.toLowerCase() !== walletAccount.toLowerCase()) {
        setWalletAccount(currentAccount);
      }

      const alreadyMinted = await checkGameIdMinted(gameSession.gameId, chainId);
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
        chainId,
        onTxSubmitted: (hash) => {
          setMintState({
            status: "pending_tx",
            txHash: hash,
            tokenId: "",
            error: "",
            chainId,
          });
        },
      });

      setMintedGameIds((prev) => ({ ...prev, [gameSession.gameId]: true }));
      setMintState({ status: "success", txHash, tokenId, error: "", chainId });
    } catch (error) {
      console.error("Mint result NFT failed:", error);
      setMintState({
        status: "failed",
        txHash: "",
        tokenId: "",
        error: toUserFacingMintError(error),
        chainId: null,
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

  const txExplorerLink = getTxExplorerLinkByChainId(
    mintState.txHash,
    mintState.chainId || walletChainId
  );
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
          <div className="flex mb-4 gap-3 flex-wrap items-center justify-center">
            <div className="text-xl font-semibold bg-gray-800 rounded-md text-white py-2 px-3 shadow-lg">
              Score: {score}
            </div>
            <div className="text-xl font-semibold bg-gray-800 rounded-md text-white py-2 px-3 shadow-lg">
              Best: {bestScore}
            </div>
            <div className="flex items-center gap-2 bg-gray-800 rounded-md py-2 px-3 shadow-lg">
              <label htmlFor="network-select" className="text-xs text-gray-300 font-semibold">
                Network
              </label>
              <select
                id="network-select"
                value={selectedNetworkId}
                onChange={handleNetworkChange}
                className="text-sm font-semibold rounded-md border border-slate-300 px-2 py-1"
                style={{ color: "#0f172a", backgroundColor: "#f1f5f9", WebkitTextFillColor: "#0f172a" }}
              >
                {SUPPORTED_NETWORKS.map((network) => (
                  <option
                    key={network.id}
                    value={network.id}
                    style={{ color: "#0f172a", backgroundColor: "#f8fafc", WebkitTextFillColor: "#0f172a" }}
                  >
                    {network.name}
                  </option>
                ))}
              </select>
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
          {walletAccount && (
            <div className="w-full max-w-md bg-gray-800 rounded-md px-4 py-3 mb-3 text-sm text-gray-100 shadow-lg">
              <p className="mb-1" title={walletAccount}>
                Address: {shortenAddress(walletAccount)}
              </p>
              <p className="mb-1">Native Balance: {walletNativeBalance || `0 ${selectedNetwork.currencySymbol}`}</p>
              <p className="text-xs text-gray-300">
                Active Chain: {selectedNetwork.name}
                {walletChainId ? ` (#${walletChainId})` : ""}
              </p>
            </div>
          )}
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
