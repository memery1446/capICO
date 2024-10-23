//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";


contract capICO {
  
 
  string public name = "capICO";
  Token public token;

constructor(Token _token) {
    token = _token;
  }


}
