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

    mapping(address => uint256) public tokensOwned;



event Buy(uint256 amount, address buyer); 
event Claimed(uint256 amount, address buyer);


event Finalize(uint256 tokensSold, uint256 ethRaised);

constructor(
    Token _token, 
    uint256 _price, 
    uint256 _maxTokens

    ) {

    token = _token;
    price = _price;
    maxTokens = _maxTokens;
    owner = msg.sender;
}

modifier onlyOwner() {
    require(msg.sender == owner, 'only the owner can call this function');

    _; 
}


receive() external payable {
    uint256 amount = msg.value / price;
    buyTokens(amount * 1e18); 
}

function buyTokens(uint256 _amount) public payable {
    require(msg.value == (_amount / 1e18) * price); // to wei value
    require(token.balanceOf(address(this)) >= _amount, 'sorry we dont have that many tokens');

   // require(token.transfer(msg.sender, _amount));
    tokensOwned[msg.sender] = _amount;
    tokensSold += _amount;


    emit Buy(_amount, msg.sender);
}

function setPrice(uint256 _price) public onlyOwner {
    price = _price;
}

function claimTokens() external {
    uint256 _amount = tokensOwned[msg.sender];
    require(token.transfer(msg.sender, _amount));

    emit Claimed(_amount, msg.sender);
}

function finalize () public onlyOwner {

    // Send remaining ether to crowdsale creator
    require(msg.sender == owner);
  
    // Determine number of tokens left
    // uint256 remainingTokens = token.balanceOf(address(this));
    // token.transfer(owner, remainingTokens);
    require(token.transfer(owner, token.balanceOf(address(this))));

    // Send remaining tokens to same 

    uint256 value = address(this).balance;
    (bool sent, ) = owner.call{value: value}("");
    require(sent);

    emit Finalize(tokensSold, value);

}

}

