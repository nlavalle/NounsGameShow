// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract GameShowBetting is ERC20, AccessControl {
    address payable public owner;
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    enum GameState {
        OPEN,
        CLOSED,
        WAITING_FOR_PAYOUT,
        WINNERS_PAID
    }

    struct Bet {
        address bettor;
        uint256 gameId;
        uint256 betOptionId;
        uint amount;
    }

    struct BetOption {
        uint256 id;
        uint256 gameId;
        string description;
        uint totalBetAmount;
        bool wonOption;
    }

    struct Game {
        uint256 id;
        string description;
        bool isOpen;
        GameState state;
        BetOption[] betOptions;
        uint256 totalBetAmount;
        uint256 winningBetOption;
        mapping(address => bool) betPlaced;
        mapping(address => Bet) betPlacedOption;
        mapping(uint256 => address[]) betsByOptionId;
    }

    mapping(uint256 => Game) public games;
    uint256 public numGames;

    event NewGame(uint256 gameId, string description);
    event NewGameBetOption(
        uint256 gameId,
        uint256 betOptionId,
        string description
    );
    event RemoveGameBetOption(uint256 gameId, uint256 betOptionId);
    event NewBet(uint256 gameId, uint256 betOption);
    event GameClosed(uint256 gameId);
    event WinnerDeclared(uint256 gameId, uint256 betOptionId);
    event WinnersPaidOut(uint256 gameId);

    constructor() ERC20("Nouns Game Show", "NGS") {
        numGames = 0;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        owner = payable(msg.sender);
        _mint(msg.sender, 10000);
    }

    function createGame(
        string memory _description
    ) public onlyRole(MANAGER_ROLE) {
        Game storage newGame = games[numGames];
        newGame.id = numGames;
        newGame.description = _description;
        newGame.isOpen = true;
        newGame.state = GameState.OPEN;

        console.log(
            "New game now open: %s - %s",
            newGame.id,
            newGame.description
        );
        numGames++;
        emit NewGame(newGame.id, newGame.description);
    }

    function addGameBetOption(
        uint256 _gameId,
        string memory _description
    ) public onlyRole(MANAGER_ROLE) {
        require(games[_gameId].state == GameState.OPEN, "Game is not open");
        uint betOptionLength = games[_gameId].betOptions.length;
        BetOption memory newBetOption = BetOption(
            betOptionLength,
            _gameId,
            _description,
            0,
            false
        );
        games[_gameId].betOptions.push(newBetOption);
        betOptionLength++;
        console.log(
            "New option added for game: %s - %s",
            newBetOption.id,
            newBetOption.description
        );
        emit NewGameBetOption(
            newBetOption.gameId,
            newBetOption.id,
            newBetOption.description
        );
    }

    function removeGameBetOption(
        uint256 _gameId,
        uint256 betOptionId
    ) public onlyRole(MANAGER_ROLE) {
        require(_gameId >= 0 && _gameId <= numGames, "Invalid game ID");
        require(games[_gameId].state == GameState.OPEN, "Game is not open");
        require(
            betOptionId >= 0 && games[_gameId].betOptions.length >= betOptionId,
            "Bet Option Id doesn't exist in options"
        );
        console.log(
            "Game: %s - Deleting option %s - %s",
            _gameId,
            betOptionId,
            games[_gameId].betOptions[betOptionId].description
        );
        delete games[_gameId].betOptions[betOptionId];
        emit RemoveGameBetOption(_gameId, betOptionId);
    }

    function getGameBetOptions(
        uint256 _gameId
    ) external view returns (BetOption[] memory) {
        require(_gameId >= 0 && _gameId <= numGames, "Invalid game ID");
        return games[_gameId].betOptions;
    }

    function placeBet(uint256 _gameId, uint256 _betOption) public payable {
        require(_gameId >= 0 && _gameId <= numGames, "Invalid game ID");
        require(msg.value > 0, "Must send an amount greater than zero");
        Game storage game = games[_gameId];
        require(game.isOpen, "Game is not open");
        game.betPlaced[msg.sender] = true;
        Bet storage newBet = game.betPlacedOption[msg.sender];
        newBet.bettor = payable(msg.sender);
        newBet.betOptionId = _betOption;
        newBet.gameId = _gameId;
        newBet.amount = msg.value;
        game.betsByOptionId[_betOption].push(msg.sender);
        game.betOptions[_betOption].totalBetAmount += msg.value;
        emit NewBet(_gameId, _betOption);
    }

    function hasPlacedBet(uint256 _gameId) external view returns (bool) {
        require(_gameId >= 0 && _gameId <= numGames, "Invalid game ID");
        return games[_gameId].betPlaced[msg.sender];
    }

    function getBet(uint256 _gameId) external view returns (Bet memory) {
        require(_gameId >= 0 && _gameId <= numGames, "Invalid game ID");
        require(
            games[_gameId].betPlaced[msg.sender],
            "User didn't place bet on game ID"
        );
        return games[_gameId].betPlacedOption[msg.sender];
    }

    function closeGame(uint256 _gameId) public onlyRole(MANAGER_ROLE) {
        require(_gameId < numGames, "Invalid game ID");
        Game storage game = games[_gameId];
        require(game.isOpen, "Game is already closed");
        game.isOpen = false;
        uint256 totalFunds = 0;
        for (uint256 i = 0; i < game.betOptions.length; i++) {
            BetOption storage betOption = game.betOptions[i];
            totalFunds += betOption.totalBetAmount;
        }
        game.totalBetAmount = totalFunds;
        // payable(owner).transfer(totalFunds);
        game.state = GameState.CLOSED;
        emit GameClosed(_gameId);
    }

    // function removeBet(uint256 _gameId) public {
    //     require(_gameId < numGames, "Invalid game ID");
    //     Game storage game = games[_gameId];
    //     require(game.isOpen, "Game is not open");
    //     uint256[] storage betsForGame = game.bets;
    //     for (uint256 i = 0; i < betsForGame.length; i++) {
    //         Bet storage bet = bets[_gameId][i];
    //         if (bet.user == msg.sender) {
    //             payable(msg.sender).transfer(bet.amount);
    //             betsForGame[i] = betsForGame[betsForGame.length - 1];
    //             betsForGame.pop();
    //             emit BetStateChanged(_gameId, bet.betOption, BetState.CANCELLED);
    //             delete bets[_gameId][i];
    //             break;
    //         }
    //     }
    // }

    function declareWinners(
        uint256 _gameId,
        uint256 _winningBetOption
    ) public onlyRole(MANAGER_ROLE) {
        require(
            games[_gameId].state == GameState.CLOSED,
            "Game is not yet closed"
        );
        require(
            games[_gameId].betOptions.length >= _winningBetOption,
            "Winning bet option doesn't exist for game"
        );

        // Validate we don't already have a winner
        for (uint i = 0; i < games[_gameId].betOptions.length; i++) {
            require(
                games[_gameId].betOptions[i].wonOption == false,
                "Winner already declared"
            );
        }

        games[_gameId].betOptions[_winningBetOption].wonOption = true;

        // Update game state to "WAITING_FOR_WINNERS"
        games[_gameId].state = GameState.WAITING_FOR_PAYOUT;
        emit WinnerDeclared(_gameId, _winningBetOption);
    }

    function distributeWinnings(uint256 _gameId) public onlyRole(MANAGER_ROLE) {
        require(
            games[_gameId].state == GameState.WAITING_FOR_PAYOUT,
            "Game is not waiting for winners"
        );
        uint winnerCount = 0;
        uint256 winningBetOption = 0;
        for (uint i = 0; i < games[_gameId].betOptions.length; i++) {
            if (games[_gameId].betOptions[i].wonOption == true) {
                winningBetOption = i;
                winnerCount++;
            }
        }

        require(winnerCount == 1, "Not one winner");

        address[] storage winningAddresses = games[_gameId].betsByOptionId[
            winningBetOption
        ];
        uint256 totalFunds = games[_gameId].totalBetAmount;
        uint256 numWinningBets = winningAddresses.length;
        require(numWinningBets > 0, "No Winners");
        uint256 winningsPerBet = totalFunds / numWinningBets;

        for (uint i = 0; i < winningAddresses.length; i++) {
            address winnerAddress = winningAddresses[i];
            payable(winnerAddress).transfer(winningsPerBet);
        }

        // Update game state to "WINNERS_DECLARED"
        games[_gameId].state = GameState.WINNERS_PAID;
        emit WinnersPaidOut(_gameId);
    }
}
