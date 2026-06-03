import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkById } from "./networks";
import { checkGameIdMinted, mintResultNft } from "./mintResultNft";
import { getWalletProvider } from "./wallet";
import {
  createPublicClient,
  createWalletClient,
  parseEventLogs,
} from "viem";

vi.mock("./wallet", () => ({
  getWalletProvider: vi.fn(),
}));

vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  custom: vi.fn((provider) => provider),
  defineChain: vi.fn((chain) => chain),
  http: vi.fn((url) => ({ url })),
  parseEventLogs: vi.fn(),
}));

describe("mintResultNft multi-network flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mints on the current wallet chain and returns chain-aware mint metadata", async () => {
    const baseNetwork = getNetworkById(8453);
    const originalAddress = baseNetwork.nftContractAddress;
    baseNetwork.nftContractAddress = "0x1111111111111111111111111111111111111111";

    const provider = {
      request: vi.fn().mockResolvedValue("0x2105"),
    };
    getWalletProvider.mockReturnValue(provider);

    const writeContract = vi.fn().mockResolvedValue("0xtesthash");
    createWalletClient.mockReturnValue({
      getAddresses: vi.fn().mockResolvedValue(["0x123"]),
      writeContract,
    });

    createPublicClient.mockReturnValue({
      waitForTransactionReceipt: vi.fn().mockResolvedValue({ logs: [{ data: "0x" }] }),
    });
    parseEventLogs.mockReturnValue([{ args: { tokenId: 7n } }]);

    try {
      const onTxSubmitted = vi.fn();
      const result = await mintResultNft({
        account: "0x123",
        score: 512,
        durationSeconds: 30,
        gameId: "game-1",
        playedAt: 1730000000,
        onTxSubmitted,
      });

      expect(writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          chain: expect.objectContaining({ id: 8453 }),
          address: "0x1111111111111111111111111111111111111111",
        })
      );
      expect(onTxSubmitted).toHaveBeenCalledWith("0xtesthash");
      expect(result).toEqual({
        txHash: "0xtesthash",
        tokenId: "7",
        chainId: 8453,
      });
    } finally {
      baseNetwork.nftContractAddress = originalAddress;
    }
  });

  it("fails with a clear business error when current chain has no mint contract configured", async () => {
    const provider = {
      request: vi.fn().mockResolvedValue("0xaa36a7"),
    };
    getWalletProvider.mockReturnValue(provider);

    await expect(checkGameIdMinted("game-missing-contract")).rejects.toThrow(
      "Mint is not configured for this network yet."
    );
  });
});
