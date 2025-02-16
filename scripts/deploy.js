// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const Token = await ethers.getContractFactory("NounsGameShowToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  let tokenAddress = await token.getAddress();

  console.log("Token address:", tokenAddress);

  const GameShow = await ethers.getContractFactory("GameShowBetting");
  const gameShow = await GameShow.deploy();
  await gameShow.waitForDeployment();
  let gameAddress = await gameShow.getAddress();

  console.log("Game address:", gameAddress);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(tokenAddress);
}

function saveFrontendFiles(address) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("NounsGameShowToken");

  fs.writeFileSync(
    path.join(contractsDir, "NounsGameShowToken.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );

  const GameShowArtifact = artifacts.readArtifactSync("GameShowBetting");

  fs.writeFileSync(
    path.join(contractsDir, "GameShowBetting.json"),
    JSON.stringify(GameShowArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });