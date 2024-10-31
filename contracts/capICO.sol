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
    uint256 public tokensClaimed;
    uint256 public goal; 

    mapping(address => uint256) public tokensOwned; 

event Buy(uint256 amount, address buyer); 
event Claimed(uint256 amount, address beneficiary);
event Finalize(uint256 tokensSold, uint256 ethRaised);

constructor(
    Token _token, 
    uint256 _price, 
    uint256 _maxTokens, 
    uint256 _goal

    ) {

    token = _token;
    price = _price;
    maxTokens = _maxTokens;
    goal = _goal; 
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
        // Converting the price
    require(msg.value == (_amount / 1e18) * price);

        // Require that the contract has enough tokens
    require(token.balanceOf(address(this)) >= _amount);

        // Update users address with tokensOwned
    tokensOwned[msg.sender] = _amount;

        // Keep track of tokensSold
    tokensSold += _amount;

    emit Buy(_amount, msg.sender);
}

function setPrice(uint256 _price) public onlyOwner {
    price = _price;
}

function claimTokens(address beneficiary) public payable returns (uint256 _amount) {
        // Assign value to beneficiary
    require(beneficiary == msg.sender);
        // Access the mapping
    tokensOwned[msg.sender] = _amount; 
        // Transfer the tokens to the beneficiary
    require(token.transfer(msg.sender, _amount));
        // Keep track of tokensSold
    tokensSold += _amount;
        // Keep track of tokensClaimed
    tokensClaimed += _amount;

    emit Claimed(_amount, msg.sender);


}

function claimRefund(address refundedTo) public payable returns (uint256 _amount) {

    require(refundedTo == msg.sender);
    tokensOwned[msg.sender] = _amount;
            // Require that the contract has enough tokens
    require(token.balanceOf(address(this)) >= _amount);
    require(msg.value == (_amount / price) * 1e18);


}

function finalize () public onlyOwner {

        // Caller must be the owner (redundant w/ mod.)
    require(msg.sender == owner);
        // Determine tokens to be sent to owner

    require(token.transfer(owner, token.balanceOf(address(this))));

    uint256 value = address(this).balance;
    (bool sent, ) = owner.call{value: value}("");
    require(sent);

    emit Finalize(tokensSold, value);

}

}

