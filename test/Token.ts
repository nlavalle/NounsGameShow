import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("NounsGameShowToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBettingFixture() {
    const [owner, bettor1, bettor2] = await hre.ethers.getSigners();

    const NounsGameShowTokenFactory = await hre.ethers.getContractFactory("NounsGameShowToken");
    const nounsGameShowToken = await NounsGameShowTokenFactory.deploy();

    return { nounsGameShowToken, owner, bettor1, bettor2 }
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { nounsGameShowToken, owner } = await loadFixture(deployBettingFixture);

      expect(await nounsGameShowToken.name()).to.equal("Nouns Game Show");
      expect(await nounsGameShowToken.symbol()).to.equal("NGS");
      expect(await nounsGameShowToken.owner()).to.equal(owner.address);
    });
  });
});
