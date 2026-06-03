import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GameOverPopup from "./GameOverPopup";

describe("GameOverPopup mint flow", () => {
  it("supports game over -> connect wallet -> mint -> success details", async () => {
    const user = userEvent.setup();
    const onConnectWallet = vi.fn();
    const onMintResult = vi.fn();
    const onNewGame = vi.fn();

    const { rerender } = render(
      <GameOverPopup
        title="Game Over"
        score={2048}
        durationSeconds={87}
        gameId="game-abc"
        account=""
        canMint={false}
        mintState={{ status: "idle", txHash: "", tokenId: "", error: "" }}
        onConnectWallet={onConnectWallet}
        onMintResult={onMintResult}
        onNewGame={onNewGame}
      />
    );

    await user.click(screen.getByRole("button", { name: "Connect Wallet" }));
    expect(onConnectWallet).toHaveBeenCalledTimes(1);

    rerender(
      <GameOverPopup
        title="Game Over"
        score={2048}
        durationSeconds={87}
        gameId="game-abc"
        account="0x123"
        canMint={true}
        mintState={{ status: "idle", txHash: "", tokenId: "", error: "" }}
        onConnectWallet={onConnectWallet}
        onMintResult={onMintResult}
        onNewGame={onNewGame}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mint Result NFT" }));
    expect(onMintResult).toHaveBeenCalledTimes(1);

    rerender(
      <GameOverPopup
        title="Game Over"
        score={2048}
        durationSeconds={87}
        gameId="game-abc"
        account="0x123"
        canMint={false}
        mintState={{
          status: "success",
          txHash: "0xhash123",
          tokenId: "1",
          error: "",
        }}
        txExplorerLink="https://testnet.arcscan.app/tx/0xhash123"
        onConnectWallet={onConnectWallet}
        onMintResult={onMintResult}
        onNewGame={onNewGame}
      />
    );

    expect(screen.getByText(/Status:\s+Mint successful\./)).toBeInTheDocument();
    expect(screen.getByText(/Tx Hash:\s+0xhash123/)).toBeInTheDocument();
    expect(screen.getByText(/Token ID:\s+1/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View transaction" })).toBeInTheDocument();
  });
});
