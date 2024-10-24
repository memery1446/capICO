//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";


contract capICO {
  Token public token;
  uint256 public price;

constructor(Token _token, uint256 _price) {
    token = _token;
    price = _price;
  }
function buyTokens(uint256 _amount) public payable {
    require(msg.value == (_amount / 1e18) * price);
    token.transfer(msg.sender, _amount);
}

}

