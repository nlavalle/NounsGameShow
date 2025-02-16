//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// This is the main building block for smart contracts.
contract NounsGameShowToken is ERC20, AccessControl {
    uint tokenPrice = 1 gwei;
    address payable public owner;

    constructor() ERC20("Nouns Game Show", "NGS") {
        owner = payable(msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        mint(msg.sender, 10000);
    }

    function mint(address to, uint amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function TopUp() public payable {
        require(msg.value >= tokenPrice, "Not enough money to buy");
        uint tokenToTransfer = msg.value / tokenPrice;
        uint remainderWei = msg.value - tokenToTransfer * tokenPrice;
        _mint(msg.sender, tokenToTransfer);
        payable(msg.sender).transfer(remainderWei);
    }

    function Withdraw(uint value) public payable {
        require(value <= balanceOf(msg.sender), "Not enough token");
        uint withdrawWei = (value * tokenPrice * 98) / 100;
        _burn(msg.sender, value);
        payable(msg.sender).transfer(withdrawWei);
    }
}