const hasMessage = (error, target) => {
  const message = [
    error?.shortMessage,
    error?.message,
    error?.details,
    error?.cause?.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return message.includes(target.toLowerCase());
};

export const toUserFacingWalletError = (error) => {
  if (!error) return "Unknown wallet error.";

  if (error?.name === "WalletUnavailableError") {
    return "No wallet extension found. Please install MetaMask or another EVM wallet.";
  }

  if (error?.code === 4001) {
    return "Wallet request rejected by user.";
  }

  if (error?.code === 4902 || hasMessage(error, "wallet_addethereumchain")) {
    return "The selected network is not available in your wallet. Please add it and try again.";
  }

  if (hasMessage(error, "wallet_switchethereumchain")) {
    return "Unable to switch network in wallet. Please approve the network switch request.";
  }

  return error.shortMessage || error.message || "Wallet operation failed.";
};

export const toUserFacingMintError = (error) => {
  if (!error) return "Unknown error.";

  if (error?.name === "WalletUnavailableError") {
    return "No wallet extension found. Please install MetaMask or another EVM wallet.";
  }

  if (error?.code === 4001) {
    return "Transaction rejected by user.";
  }

  if (hasMessage(error, "Mint is not configured for this network yet.")) {
    return "Mint is not configured for this network yet.";
  }

  if (hasMessage(error, "DuplicateGameId") || hasMessage(error, "duplicate game id")) {
    return "This gameId has already been minted.";
  }

  if (hasMessage(error, "insufficient funds")) {
    return "Insufficient funds for gas on the current network.";
  }

  if (hasMessage(error, "timeout")) {
    return "RPC timeout. Please try again.";
  }

  const chainMismatchPatterns = [
    "wrong chain selected",
    "wallet_switchethereumchain",
    "chain id",
    "chain mismatch",
    "network switched",
  ];

  if (chainMismatchPatterns.some((pattern) => hasMessage(error, pattern))) {
    return "Wrong chain selected. Please switch to a supported network and try again.";
  }

  return error.shortMessage || error.message || "Mint failed.";
};
