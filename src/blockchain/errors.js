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

export const toUserFacingMintError = (error) => {
  if (!error) return "Unknown error.";

  if (error?.code === 4001) {
    return "Transaction rejected by user.";
  }

  if (hasMessage(error, "DuplicateGameId") || hasMessage(error, "duplicate game id")) {
    return "This gameId has already been minted.";
  }

  if (hasMessage(error, "insufficient funds")) {
    return "Insufficient USDC for gas on Arc network.";
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
    return "Wrong chain selected. Please switch to Arc Testnet (chainId 5042002).";
  }

  return error.shortMessage || error.message || "Mint failed.";
};
