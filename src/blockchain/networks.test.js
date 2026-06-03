import { describe, expect, it } from "vitest";
import {
  getMintContractAddressByChainId,
  getNetworkById,
  getTxExplorerLinkByChainId,
} from "./networks";

describe("network mint configuration", () => {
  it("resolves mint contract address from network config by chainId", () => {
    expect(getMintContractAddressByChainId(5042002)).toBe(
      "0x1c0f5a1628337270D20EeE7aAeBb63Bdf0254CFa"
    );
  });

  it("throws a clear business error when network has no nft contract address", () => {
    expect(() => getMintContractAddressByChainId(11155111)).toThrow(
      "Mint is not configured for this network yet."
    );
  });

  it("builds transaction explorer link from the chain that minted", () => {
    const txHash = "0xabc123";
    const baseNetwork = getNetworkById(8453);

    const link = getTxExplorerLinkByChainId(txHash, 8453);

    expect(link).toBe(
      `${baseNetwork.blockExplorer.replace(/\/$/, "")}/tx/${txHash}`
    );
  });
});
