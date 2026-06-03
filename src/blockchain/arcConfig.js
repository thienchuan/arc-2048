import { defineChain } from "viem";
import { ARC_NETWORK } from "./networks";

const CHAIN_ID = ARC_NETWORK.id;
const CHAIN_HEX = `0x${CHAIN_ID.toString(16)}`;

const DEFAULT_RPC_WS_URL = `wss://${ARC_NETWORK.rpcUrl.replace(/^https?:\/\//, "")}`;

export const ARC_CHAIN_CONFIG = {
  chainId: CHAIN_ID,
  chainHex: CHAIN_HEX,
  chainName: ARC_NETWORK.name,
  rpcUrl: ARC_NETWORK.rpcUrl,
  rpcWsUrl: import.meta.env.VITE_ARC_RPC_WS_URL || DEFAULT_RPC_WS_URL,
  explorerUrl: ARC_NETWORK.blockExplorer,
  nativeCurrency: {
    name: ARC_NETWORK.currencyName,
    symbol: ARC_NETWORK.currencySymbol,
    decimals: ARC_NETWORK.currencyDecimals,
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
  testnet: ARC_NETWORK.testnet,
});

export const getTxExplorerLink = (txHash) => {
  if (!txHash) return "";
  return `${ARC_CHAIN_CONFIG.explorerUrl.replace(/\/$/, "")}/tx/${txHash}`;
};
