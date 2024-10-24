//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";


contract capICO {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

event Buy(uint256 amount, address buyer); 

constructor(Token _token, uint256 _price, uint256 _maxTokens) {
    token = _token;
    price = _price;
    maxTokens = _maxTokens;
    owner = msg.sender;
  }

receive() external payable {
    uint256 amount = msg.value / price;
    buyTokens(amount * 1e18); 

}

function buyTokens(uint256 _amount) public payable {
    require(msg.value == (_amount / 1e18) * price);
    require(token.balanceOf(address(this)) >= _amount, 'request rejected: too many tokens');
    require(token.transfer(msg.sender, _amount));

    tokensSold += _amount;

    emit Buy(_amount, msg.sender);
}

function finalize() public {
    // Send remaining ether to crowdsale creator

    // Determine number of tokens left
    uint256 remainingTokens = token.balanceOf(address(this));
    token.transfer(owner, remainingTokens);

    // Send remaining tokens to same 


}

}

