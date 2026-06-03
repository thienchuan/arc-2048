import hre from "hardhat";

async function main() {
  const factory = await hre.ethers.getContractFactory("Game2048ResultNFT");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("Game2048ResultNFT deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
