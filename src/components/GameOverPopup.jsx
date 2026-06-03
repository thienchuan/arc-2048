import React from "react";

const STATUS_LABELS = {
  idle: "Idle",
  waiting_wallet_confirm: "Waiting for wallet confirmation...",
  pending_tx: "Transaction pending...",
  success: "Mint successful.",
  failed: "Mint failed.",
};

const GameOverPopup = ({
  title,
  score,
  durationSeconds,
  gameId,
  account,
  canMint,
  mintState,
  txExplorerLink,
  onConnectWallet,
  onMintResult,
  onNewGame,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 px-8 py-5 rounded shadow-lg flex flex-col items-center max-w-md w-[92%]">
        <h2 className="text-4xl font-bold mb-3 text-white">{title}</h2>
        <p className="text-sm text-gray-300 mb-1">Score: {score}</p>
        <p className="text-sm text-gray-300 mb-1">Duration: {durationSeconds}s</p>
        <p className="text-xs text-gray-400 break-all mb-4">Game ID: {gameId}</p>

        <div className="flex w-full gap-2">
          <button
            className="flex-1 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConnectWallet}
            disabled={Boolean(account)}
          >
            {account ? "Wallet Connected" : "Connect Wallet"}
          </button>
          <button
            className="flex-1 p-2 bg-blue-700 hover:bg-blue-600 text-white rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onMintResult}
            disabled={!canMint}
          >
            Mint Result NFT
          </button>
        </div>

        <div className="w-full mt-3 px-3 py-2 rounded bg-gray-900 text-sm text-gray-200">
          <p>Status: {STATUS_LABELS[mintState.status] || "Idle"}</p>
          {mintState.error && <p className="text-red-400 mt-1">{mintState.error}</p>}
          {mintState.txHash && (
            <p className="mt-1 break-all">Tx Hash: {mintState.txHash}</p>
          )}
          {mintState.tokenId && <p className="mt-1">Token ID: {mintState.tokenId}</p>}
          {txExplorerLink && (
            <a
              className="inline-block mt-2 text-blue-300 hover:text-blue-200 underline"
              href={txExplorerLink}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          )}
        </div>

        <button
          className="mt-4 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={onNewGame}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverPopup;
