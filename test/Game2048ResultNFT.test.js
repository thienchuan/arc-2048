import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("Game2048ResultNFT", function () {
  async function deployFixture() {
    const [owner, player] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Game2048ResultNFT");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    return { contract, owner, player };
  }

  it("mints a result NFT successfully", async function () {
    const { contract, player } = await deployFixture();

    await contract.mintResult(player.address, 1024, 120, "game-1", 1710000000);

    expect(await contract.ownerOf(1)).to.equal(player.address);
    expect(await contract.isGameIdMinted("game-1")).to.equal(true);
  });

  it("emits ResultMinted with correct payload", async function () {
    const { contract, player } = await deployFixture();

    await expect(contract.mintResult(player.address, 2048, 222, "game-2", 1710000001))
      .to.emit(contract, "ResultMinted")
      .withArgs(player.address, 1, "game-2", 2048, 1710000001);
  });

  it("rejects duplicate gameId", async function () {
    const { contract, player } = await deployFixture();

    await contract.mintResult(player.address, 2048, 300, "game-dup", 1710000100);

    await expect(
      contract.mintResult(player.address, 3000, 450, "game-dup", 1710000111)
    )
      .to.be.revertedWithCustomError(contract, "DuplicateGameId")
      .withArgs("game-dup");
  });

  it("tokenURI metadata includes required fields", async function () {
    const { contract, player } = await deployFixture();
    const playedAt = 1710000200;

    await contract.mintResult(player.address, 4096, 600, "game-3", playedAt);
    const tokenURI = await contract.tokenURI(1);

    expect(tokenURI.startsWith("data:application/json;base64,")).to.equal(true);

    const raw = tokenURI.replace("data:application/json;base64,", "");
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    const metadata = JSON.parse(decoded);

    expect(metadata).to.have.property("name");
    expect(metadata).to.have.property("description");
    expect(metadata).to.have.property("image");
    expect(metadata.playerAddress.toLowerCase()).to.equal(player.address.toLowerCase());
    expect(metadata.score).to.equal(4096);
    expect(metadata.durationSeconds).to.equal(600);
    expect(metadata.gameId).to.equal("game-3");
    expect(metadata.playedAt).to.equal(playedAt);

    const traitTypes = metadata.attributes.map((attr) => attr.trait_type);
    expect(traitTypes).to.include.members(["Score", "Duration", "GameId", "PlayedAt"]);
  });
});
