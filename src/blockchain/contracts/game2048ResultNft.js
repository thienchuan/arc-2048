export const GAME_2048_RESULT_NFT_ADDRESS =
  import.meta.env.VITE_2048_NFT_CONTRACT_ADDRESS || "";

export const GAME_2048_RESULT_NFT_ABI = [
  {
    type: "event",
    name: "ResultMinted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "gameId", type: "string", indexed: false },
      { name: "score", type: "uint256", indexed: false },
      { name: "playedAt", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "function",
    name: "mintResult",
    stateMutability: "nonpayable",
    inputs: [
      { name: "player", type: "address" },
      { name: "score", type: "uint256" },
      { name: "durationSeconds", type: "uint256" },
      { name: "gameId", type: "string" },
      { name: "playedAt", type: "uint256" }
    ],
    outputs: [{ name: "tokenId", type: "uint256" }]
  },
  {
    type: "function",
    name: "isGameIdMinted",
    stateMutability: "view",
    inputs: [{ name: "gameId", type: "string" }],
    outputs: [{ name: "", type: "bool" }]
  }
];
