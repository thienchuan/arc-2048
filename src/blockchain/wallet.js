import { ARC_CHAIN_CONFIG, ARC_CHAIN_FOR_WALLET } from "./arcConfig";
import { formatUnits } from "viem";
import { toWalletChainParams } from "./networks";

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

export const switchToNetwork = async (network) => {
  const provider = getWalletProvider();
  const chainParams = toWalletChainParams(network);

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainParams.chainId }],
    });
  } catch (error) {
    if (error?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [chainParams],
      });

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainParams.chainId }],
      });
      return;
    }

    throw error;
  }
};

export const ensureNetwork = async (network) => {
  if (!network) {
    throw new Error("Network configuration is required.");
  }

  let currentChainId = await getCurrentChainId();
  if (currentChainId !== network.id) {
    await switchToNetwork(network);
    currentChainId = await getCurrentChainId();
  }

  if (currentChainId !== network.id) {
    throw new Error(`Wrong chain selected. Expected ${network.id}, got ${currentChainId}.`);
  }

  return currentChainId;
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
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_CHAIN_CONFIG.chainHex }],
      });
      return;
    }
    throw error;
  }
};

export const getNativeBalance = async (account) => {
  if (!account) {
    return 0n;
  }

  const provider = getWalletProvider();
  const balanceHex = await provider.request({
    method: "eth_getBalance",
    params: [account, "latest"],
  });

  return BigInt(balanceHex);
};

export const formatNativeBalance = (
  balance,
  decimals = 18,
  symbol = "",
  fractionDigits = 4
) => {
  const units = formatUnits(BigInt(balance || 0), decimals);
  const [wholePart, decimalPart = ""] = units.split(".");
  const shortenedDecimals = decimalPart.slice(0, fractionDigits).replace(/0+$/, "");
  const value = shortenedDecimals ? `${wholePart}.${shortenedDecimals}` : wholePart;

  return symbol ? `${value} ${symbol}` : value;
};

export const ensureArcNetwork = async () => {
  return ensureNetwork({
    id: ARC_CHAIN_CONFIG.chainId,
    name: ARC_CHAIN_CONFIG.chainName,
    rpcUrl: ARC_CHAIN_CONFIG.rpcUrl,
    blockExplorer: ARC_CHAIN_CONFIG.explorerUrl,
    currencyName: ARC_CHAIN_CONFIG.nativeCurrency.name,
    currencySymbol: ARC_CHAIN_CONFIG.nativeCurrency.symbol,
    currencyDecimals: ARC_CHAIN_CONFIG.nativeCurrency.decimals,
  });
};
