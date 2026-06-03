const SUPPORTED_NETWORKS_BASE = [
  {
    id: 5042002,
    name: "Arc - Testnet",
    network: "arcTestnet",
    rpcUrl: "https://rpc.testnet.arc.network",
    blockExplorer: "https://testnet.arcscan.app",
    currencyName: "ARC",
    currencySymbol: "ARC",
    currencyDecimals: 18,
    nftContractAddress: "0x1c0f5a1628337270D20EeE7aAeBb63Bdf0254CFa",
    testnet: true,
  },
  {
    id: 11155420,
    name: "Optimism Sepolia",
    network: "optimismSepolia",
    rpcUrl: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    currencyName: "Sepolia Ether",
    currencySymbol: "ETH",
    currencyDecimals: 18,
    nftContractAddress: "0x804FC259e0c738882D62245996CCe0Bbd3634b6f",
    testnet: true,
  },
  {
    id: 11155111,
    name: "Sepolia",
    network: "sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    currencyName: "Sepolia Ether",
    currencySymbol: "ETH",
    currencyDecimals: 18,
    nftContractAddress: "0xF9bf82bfb8bBa3f41FAc0301c2eFaF483f1391C4",
    testnet: true,
  },
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    network: "arbitrumSepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    currencyName: "Sepolia Ether",
    currencySymbol: "ETH",
    currencyDecimals: 18,
    nftContractAddress: "",
    testnet: true,
  },
  {
    id: 84532,
    name: "Base Sepolia",
    network: "baseSepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    currencyName: "Sepolia Ether",
    currencySymbol: "ETH",
    currencyDecimals: 18,
    nftContractAddress: "0xDf0e260593f5d073Cf87299E8925412E26E07b4B",
    testnet: true,
  },
  {
    id: 80002,
    name: "Polygon Amoy",
    network: "polygonAmoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    blockExplorer: "https://amoy.polygonscan.com",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    currencyDecimals: 18,
    nftContractAddress: "0xEdB581AEBBad5553c24898E2F64F790e17927326",
    testnet: true,
  },
  {
    id: 42161,
    name: "Arbitrum One",
    network: "arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    currencyName: "Ether",
    currencySymbol: "ETH",
    currencyDecimals: 18,
    nftContractAddress: "0x95Fa1AE910eA3A234F8fEd7F41bA7e2A6A365EA8",
    testnet: false,
  },
  {
    id: 8453,
    name: "Base",
    network: "base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    currencyName: "Ether",
    currencySymbol: "ETH",
    currencyDecimals: 18,
    nftContractAddress: "0x5B6A855D9346D1b8c9aB531bAb4728949fAB13C7",
    testnet: false,
  },
  {
    id: 137,
    name: "Polygon",
    network: "polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    currencyDecimals: 18,
    nftContractAddress: "",
    testnet: false,
  },
  {
    id: 10,
    name: "Optimism",
    network: "optimism",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    currencyName: "Ether",
    currencySymbol: "ETH",
    currencyDecimals: 18,
    nftContractAddress: "0x95b8b2c35525aF17dA88DC74665ee0787d3D16D0",
    testnet: false,
  },
];

const MINT_NOT_CONFIGURED_ERROR = "Mint is not configured for this network yet.";

export const ARC_CHAIN_ID = Number(import.meta.env.VITE_ARC_CHAIN_ID || 5042002);

const getArcNetworkWithEnvOverrides = () => {
  const arcFromList = SUPPORTED_NETWORKS_BASE.find((network) => network.id === 5042002);
  if (!arcFromList) {
    throw new Error("Arc Testnet configuration is missing.");
  }

  return {
    ...arcFromList,
    id: ARC_CHAIN_ID,
    name: import.meta.env.VITE_ARC_CHAIN_NAME || arcFromList.name,
    rpcUrl: import.meta.env.VITE_ARC_RPC_URL || arcFromList.rpcUrl,
    blockExplorer: import.meta.env.VITE_ARC_EXPLORER_URL || arcFromList.blockExplorer,
  };
};

const ARC_NETWORK_WITH_ENV = getArcNetworkWithEnvOverrides();

export const SUPPORTED_NETWORKS = SUPPORTED_NETWORKS_BASE.map((network) =>
  network.id === 5042002 ? ARC_NETWORK_WITH_ENV : network
);

export const getNetworkById = (networkId) =>
  SUPPORTED_NETWORKS.find((network) => network.id === Number(networkId));

export const getMintContractAddressByChainId = (chainId) => {
  const network = getNetworkById(chainId);

  if (!network?.nftContractAddress) {
    throw new Error(MINT_NOT_CONFIGURED_ERROR);
  }

  return network.nftContractAddress;
};

export const getTxExplorerLinkByChainId = (txHash, chainId) => {
  if (!txHash) return "";

  const network = getNetworkById(chainId);
  if (!network?.blockExplorer) return "";

  return `${network.blockExplorer.replace(/\/$/, "")}/tx/${txHash}`;
};

export const ARC_NETWORK = getNetworkById(ARC_CHAIN_ID) || ARC_NETWORK_WITH_ENV;

export const toWalletChainParams = (network) => ({
  chainId: `0x${Number(network.id).toString(16)}`,
  chainName: network.name,
  nativeCurrency: {
    name: network.currencyName,
    symbol: network.currencySymbol,
    decimals: network.currencyDecimals,
  },
  rpcUrls: [network.rpcUrl],
  blockExplorerUrls: [network.blockExplorer],
});
