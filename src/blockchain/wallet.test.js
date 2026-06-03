import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ensureNetwork,
  formatNativeBalance,
  getNativeBalance,
  switchToNetwork,
} from "./wallet";

describe("wallet helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("formats native balance with symbol and fixed precision", () => {
    expect(formatNativeBalance(1234567890000000000n, 18, "ETH")).toBe("1.2345 ETH");
    expect(formatNativeBalance(1000000000000000000n, 18, "ARC")).toBe("1 ARC");
  });

  it("gets native balance using eth_getBalance", async () => {
    const request = vi.fn().mockResolvedValue("0x16345785d8a0000");
    window.ethereum = { request };

    const balance = await getNativeBalance("0xabc");

    expect(balance).toBe(100000000000000000n);
    expect(request).toHaveBeenCalledWith({
      method: "eth_getBalance",
      params: ["0xabc", "latest"],
    });
  });

  it("switches to a known network", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    window.ethereum = { request };

    await switchToNetwork({
      id: 8453,
      name: "Base",
      rpcUrl: "https://mainnet.base.org",
      blockExplorer: "https://basescan.org",
      currencyName: "Ether",
      currencySymbol: "ETH",
      currencyDecimals: 18,
    });

    expect(request).toHaveBeenCalledWith({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    });
  });

  it("adds then switches when wallet does not have the network", async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce({ code: 4902 })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    window.ethereum = { request };

    await switchToNetwork({
      id: 80002,
      name: "Polygon Amoy",
      rpcUrl: "https://rpc-amoy.polygon.technology",
      blockExplorer: "https://amoy.polygonscan.com",
      currencyName: "MATIC",
      currencySymbol: "MATIC",
      currencyDecimals: 18,
    });

    expect(request).toHaveBeenNthCalledWith(1, {
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13882" }],
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x13882",
          chainName: "Polygon Amoy",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          rpcUrls: ["https://rpc-amoy.polygon.technology"],
          blockExplorerUrls: ["https://amoy.polygonscan.com"],
        },
      ],
    });
    expect(request).toHaveBeenNthCalledWith(3, {
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13882" }],
    });
  });

  it("ensures selected network by switching if needed", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce("0x2105")
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce("0x13882");

    window.ethereum = { request };

    const chainId = await ensureNetwork({
      id: 80002,
      name: "Polygon Amoy",
      rpcUrl: "https://rpc-amoy.polygon.technology",
      blockExplorer: "https://amoy.polygonscan.com",
      currencyName: "MATIC",
      currencySymbol: "MATIC",
      currencyDecimals: 18,
    });

    expect(chainId).toBe(80002);
    expect(request).toHaveBeenNthCalledWith(1, { method: "eth_chainId" });
    expect(request).toHaveBeenNthCalledWith(2, {
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13882" }],
    });
    expect(request).toHaveBeenNthCalledWith(3, { method: "eth_chainId" });
  });
});
