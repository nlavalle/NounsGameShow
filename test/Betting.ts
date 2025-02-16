import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("GameShowBetting", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBettingFixture() {
    const [owner, bettor1, bettor2] = await hre.ethers.getSigners();

    const GameShowBettingFactory = await hre.ethers.getContractFactory("GameShowBetting");
    const gameShowBetting = await GameShowBettingFactory.deploy();

    return { gameShowBetting, owner, bettor1, bettor2 }
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { gameShowBetting, owner } = await loadFixture(deployBettingFixture);

      expect(await gameShowBetting.owner()).to.equal(owner.address);
    });
  });

  describe("Setup", function () {
    it("Should create game", async function () {
      const { gameShowBetting } = await loadFixture(deployBettingFixture);

      expect(await gameShowBetting.numGames()).to.equal(0);
      await expect(gameShowBetting.createGame("Test Game 1"))
        .to.emit(gameShowBetting, "NewGame")
        .withArgs(0, "Test Game 1")
      expect(await gameShowBetting.numGames()).to.equal(1);
    });

    it("Should create bet options for a game", async function () {
      const { gameShowBetting } = await loadFixture(deployBettingFixture);

      await expect(gameShowBetting.createGame("Test Game 2"))
        .to.emit(gameShowBetting, "NewGame")
        .withArgs(0, "Test Game 2");
      await expect(gameShowBetting.addGameBetOption(0, "Option 1"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 0, "Option 1");
      await gameShowBetting.getGameBetOptions(0).then((result: any) => {
        expect(result[0].id, "Option Id eq").to.equal(0);
        expect(result[0].gameId, "Game Id eq").to.equal(0);
        expect(result[0].description, "Description eq").to.equal("Option 1");
      });
    });

    it("Should remove bet options for a game", async function () {
      const { gameShowBetting } = await loadFixture(deployBettingFixture);

      await expect(gameShowBetting.createGame("Test Game 2"))
        .to.emit(gameShowBetting, "NewGame")
        .withArgs(0, "Test Game 2");
      await expect(gameShowBetting.addGameBetOption(0, "Option 1"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 0, "Option 1");
      await gameShowBetting.getGameBetOptions(0).then((result: any) => {
        expect(result[0].id, "Option Id eq").to.equal(0);
        expect(result[0].gameId, "Game Id eq").to.equal(0);
        expect(result[0].description, "Description eq").to.equal("Option 1");
      });
      await expect(gameShowBetting.removeGameBetOption(0, 0))
        .to.emit(gameShowBetting, "RemoveGameBetOption")
        .withArgs(0, 0);
      await gameShowBetting.games(0).then((result: any) => {
        expect(result.betOptions).to.be.undefined;
      })
    });

  });
  describe("Betting", function () {
    it("Should place bet for game", async function () {
      const { gameShowBetting, owner } = await loadFixture(deployBettingFixture);

      await expect(gameShowBetting.createGame("Test Game 2"))
        .to.emit(gameShowBetting, "NewGame")
        .withArgs(0, "Test Game 2");
      await expect(gameShowBetting.addGameBetOption(0, "Option 1"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 0, "Option 1");
      await expect(gameShowBetting.placeBet(0, 0, { value: 50 }))
        .to.emit(gameShowBetting, "NewBet")
        .withArgs(0, 0);
      await gameShowBetting.getBet(0).then((result: any) => {
        expect(result.bettor).equals(owner.address);
        expect(result.amount).equals(50);
        expect(result.gameId).equals(0);
        expect(result.betOptionId).equals(0);
      })
    });

    it("Should close game with bets", async function () {
      const { gameShowBetting, owner } = await loadFixture(deployBettingFixture);

      await expect(gameShowBetting.createGame("Test Game 2"))
        .to.emit(gameShowBetting, "NewGame")
        .withArgs(0, "Test Game 2");
      await expect(gameShowBetting.addGameBetOption(0, "Option 1"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 0, "Option 1");
      await expect(gameShowBetting.addGameBetOption(0, "Option 2"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 1, "Option 2");
      await expect(gameShowBetting.placeBet(0, 0, { value: 50 }))
        .to.emit(gameShowBetting, "NewBet")
        .withArgs(0, 0);
      await gameShowBetting.getBet(0).then((result: any) => {
        expect(result.bettor).equals(owner.address);
        expect(result.amount).equals(50);
        expect(result.gameId).equals(0);
        expect(result.betOptionId).equals(0);
      })
      await expect(gameShowBetting.closeGame(0))
        .to.emit(gameShowBetting, "GameClosed")
        .withArgs(0);
      await gameShowBetting.games(0).then((result: any) => {
        expect(result.totalBetAmount).equals(50);
      });
    });

    it("Should declare winner", async function () {
      const { gameShowBetting, owner } = await loadFixture(deployBettingFixture);

      await expect(gameShowBetting.createGame("Test Game 2"))
        .to.emit(gameShowBetting, "NewGame")
        .withArgs(0, "Test Game 2");
      await expect(gameShowBetting.addGameBetOption(0, "Option 1"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 0, "Option 1");
      await expect(gameShowBetting.addGameBetOption(0, "Option 2"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 1, "Option 2");
      await expect(gameShowBetting.placeBet(0, 0, { value: 50 }))
        .to.emit(gameShowBetting, "NewBet")
        .withArgs(0, 0);
      await gameShowBetting.getBet(0).then((result: any) => {
        expect(result.bettor).equals(owner.address);
        expect(result.amount).equals(50);
        expect(result.gameId).equals(0);
        expect(result.betOptionId).equals(0);
      })
      await expect(gameShowBetting.closeGame(0))
        .to.emit(gameShowBetting, "GameClosed")
        .withArgs(0);
      await gameShowBetting.games(0).then((result: any) => {
        expect(result.totalBetAmount).equals(50);
      });
      await expect(gameShowBetting.declareWinners(0, 0))
        .to.emit(gameShowBetting, "WinnerDeclared")
        .withArgs(0, 0);
      await gameShowBetting.games(0).then((result: any) => {
        expect(result.state).equals(2);
      });
    });

    it("Should payout winners", async function () {
      const { gameShowBetting, owner, bettor1, bettor2 } = await loadFixture(deployBettingFixture);

      await expect(gameShowBetting.createGame("Test Game 2"))
        .to.emit(gameShowBetting, "NewGame")
        .withArgs(0, "Test Game 2");
      await expect(gameShowBetting.addGameBetOption(0, "Option 1"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 0, "Option 1");
      await expect(gameShowBetting.addGameBetOption(0, "Option 2"))
        .to.emit(gameShowBetting, "NewGameBetOption")
        .withArgs(0, 1, "Option 2");
      await expect(gameShowBetting.connect(bettor1).placeBet(0, 0, { value: 50 }))
        .to.emit(gameShowBetting, "NewBet")
        .withArgs(0, 0);
      await gameShowBetting.connect(bettor1).getBet(0).then((result: any) => {
        expect(result.bettor).equals(bettor1.address);
        expect(result.amount).equals(50);
        expect(result.gameId).equals(0);
        expect(result.betOptionId).equals(0);
      })
      await expect(gameShowBetting.connect(bettor2).placeBet(0, 1, { value: 25 }))
        .to.emit(gameShowBetting, "NewBet")
        .withArgs(0, 1);
      await gameShowBetting.connect(bettor2).getBet(0).then((result: any) => {
        expect(result.bettor).equals(bettor2.address);
        expect(result.amount).equals(25);
        expect(result.gameId).equals(0);
        expect(result.betOptionId).equals(1);
      })
      await expect(gameShowBetting.closeGame(0))
        .to.emit(gameShowBetting, "GameClosed")
        .withArgs(0);
      await gameShowBetting.games(0).then((result: any) => {
        expect(result.totalBetAmount).equals(75);
      });
      await expect(gameShowBetting.declareWinners(0, 0))
        .to.emit(gameShowBetting, "WinnerDeclared")
        .withArgs(0, 0);
      await gameShowBetting.games(0).then((result: any) => {
        expect(result.state).equals(2);
      });
      await expect(gameShowBetting.distributeWinnings(0))
        .to.emit(gameShowBetting, "WinnersPaidOut")
        .withArgs(0);
      await gameShowBetting.games(0).then((result: any) => {
        expect(result.state).equals(3);
      });
    });
  });
});
