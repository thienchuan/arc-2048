import { createPublicClient, createWalletClient, custom, http, parseEventLogs } from "viem";
import { ARC_CHAIN_CONFIG, ARC_VIEM_CHAIN } from "./arcConfig";
import {
  GAME_2048_RESULT_NFT_ABI,
  GAME_2048_RESULT_NFT_ADDRESS,
} from "./contracts/game2048ResultNft";
import { getWalletProvider } from "./wallet";

const requireContractAddress = () => {
  if (!GAME_2048_RESULT_NFT_ADDRESS) {
    throw new Error("Missing VITE_2048_NFT_CONTRACT_ADDRESS environment variable.");
  }
  return GAME_2048_RESULT_NFT_ADDRESS;
};

const createClients = () => {
  const provider = getWalletProvider();
  const publicClient = createPublicClient({
    chain: ARC_VIEM_CHAIN,
    transport: http(ARC_CHAIN_CONFIG.rpcUrl, {
      timeout: 15000,
      retryCount: 1,
    }),
  });

  const walletClient = createWalletClient({
    chain: ARC_VIEM_CHAIN,
    transport: custom(provider),
  });

  return { publicClient, walletClient };
};

export const checkGameIdMinted = async (gameId) => {
  const address = requireContractAddress();
  const { publicClient } = createClients();
  return publicClient.readContract({
    address,
    abi: GAME_2048_RESULT_NFT_ABI,
    functionName: "isGameIdMinted",
    args: [gameId],
  });
};

export const mintResultNft = async ({
  account,
  score,
  durationSeconds,
  gameId,
  playedAt,
  onTxSubmitted,
}) => {
  const address = requireContractAddress();
  const { walletClient, publicClient } = createClients();

  const [connectedAccount] = await walletClient.getAddresses();
  if (!connectedAccount || connectedAccount.toLowerCase() !== account.toLowerCase()) {
    throw new Error("Connected wallet account mismatch.");
  }

  const txHash = await walletClient.writeContract({
    chain: ARC_VIEM_CHAIN,
    address,
    abi: GAME_2048_RESULT_NFT_ABI,
    functionName: "mintResult",
    args: [account, BigInt(score), BigInt(durationSeconds), gameId, BigInt(playedAt)],
    account,
  });

  if (typeof onTxSubmitted === "function") {
    onTxSubmitted(txHash);
  }

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    timeout: 120000,
    pollingInterval: 1500,
  });

  const resultEvents = parseEventLogs({
    abi: GAME_2048_RESULT_NFT_ABI,
    eventName: "ResultMinted",
    logs: receipt.logs,
  });

  const tokenId = resultEvents[0]?.args?.tokenId?.toString() || "";
  return { txHash, tokenId };
};
