//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";


contract capICO {
  
  Token public token;

constructor(Token _token) {
    token = _token;
  }
function buyTokens(uint256 _amount) public {
    token.transfer(msg.sender, _amount);
}

}
