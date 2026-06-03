import { defineChain } from "viem";

const CHAIN_ID = Number(import.meta.env.VITE_ARC_CHAIN_ID || 5042002);
const CHAIN_HEX = `0x${CHAIN_ID.toString(16)}`;

const DEFAULT_RPC_URL = "https://rpc.testnet.arc.network";
const DEFAULT_RPC_WS_URL = "wss://rpc.testnet.arc.network";

export const ARC_CHAIN_CONFIG = {
  chainId: CHAIN_ID,
  chainHex: CHAIN_HEX,
  chainName: import.meta.env.VITE_ARC_CHAIN_NAME || "Arc Testnet",
  rpcUrl: import.meta.env.VITE_ARC_RPC_URL || DEFAULT_RPC_URL,
  rpcWsUrl: import.meta.env.VITE_ARC_RPC_WS_URL || DEFAULT_RPC_WS_URL,
  explorerUrl: import.meta.env.VITE_ARC_EXPLORER_URL || "https://testnet.arcscan.app",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
};

export const ARC_CHAIN_FOR_WALLET = {
  chainId: ARC_CHAIN_CONFIG.chainHex,
  chainName: ARC_CHAIN_CONFIG.chainName,
  nativeCurrency: ARC_CHAIN_CONFIG.nativeCurrency,
  rpcUrls: [ARC_CHAIN_CONFIG.rpcUrl],
  blockExplorerUrls: [ARC_CHAIN_CONFIG.explorerUrl],
};

export const ARC_VIEM_CHAIN = defineChain({
  id: ARC_CHAIN_CONFIG.chainId,
  name: ARC_CHAIN_CONFIG.chainName,
  nativeCurrency: ARC_CHAIN_CONFIG.nativeCurrency,
  rpcUrls: {
    default: {
      http: [ARC_CHAIN_CONFIG.rpcUrl],
      webSocket: [ARC_CHAIN_CONFIG.rpcWsUrl],
    },
    public: {
      http: [ARC_CHAIN_CONFIG.rpcUrl],
      webSocket: [ARC_CHAIN_CONFIG.rpcWsUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: ARC_CHAIN_CONFIG.explorerUrl,
    },
  },
  testnet: true,
});

export const getTxExplorerLink = (txHash) => {
  if (!txHash) return "";
  return `${ARC_CHAIN_CONFIG.explorerUrl.replace(/\/$/, "")}/tx/${txHash}`;
};
