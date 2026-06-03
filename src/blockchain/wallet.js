import { ARC_CHAIN_CONFIG, ARC_CHAIN_FOR_WALLET } from "./arcConfig";

export class WalletUnavailableError extends Error {
  constructor() {
    super("No EVM wallet found. Please install MetaMask or another EVM wallet.");
    this.name = "WalletUnavailableError";
  }
}

export const getWalletProvider = () => {
  if (!window.ethereum) {
    throw new WalletUnavailableError();
  }
  return window.ethereum;
};

export const getCurrentAccount = async () => {
  const provider = getWalletProvider();
  const accounts = await provider.request({ method: "eth_accounts" });
  return accounts[0] || "";
};

export const getCurrentChainId = async () => {
  const provider = getWalletProvider();
  const chainHex = await provider.request({ method: "eth_chainId" });
  return Number.parseInt(chainHex, 16);
};

export const connectWallet = async () => {
  const provider = getWalletProvider();
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  return accounts[0] || "";
};

export const switchToArcNetwork = async () => {
  const provider = getWalletProvider();
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN_CONFIG.chainHex }],
    });
  } catch (error) {
    if (error?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [ARC_CHAIN_FOR_WALLET],
      });
      return;
    }
    throw error;
  }
};

export const ensureArcNetwork = async () => {
  let currentChainId = await getCurrentChainId();
  if (currentChainId !== ARC_CHAIN_CONFIG.chainId) {
    await switchToArcNetwork();
    currentChainId = await getCurrentChainId();
  }

  if (currentChainId !== ARC_CHAIN_CONFIG.chainId) {
    throw new Error(
      `Wrong chain selected. Expected ${ARC_CHAIN_CONFIG.chainId}, got ${currentChainId}.`
    );
  }

  return currentChainId;
};
