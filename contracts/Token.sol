//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public constant decimals = 18;  // Made constant since it never changes
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value)  // Removed pointer syntax
        public
        returns (bool success)
    {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        _transfer(msg.sender, to, value);
        return true;
    }
    
    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal {
        require(to != address(0), "Cannot transfer to zero address");
        require(value <= balanceOf[from], "Insufficient balance");
        
        unchecked {
            balanceOf[from] = balanceOf[from] - value;
            balanceOf[to] = balanceOf[to] + value;
        }
        
        emit Transfer(from, to, value);
    }
    
    function approve(address spender, uint256 value)  // Removed pointer syntax
        public
        returns(bool success)
    {
        require(spender != address(0), "Cannot approve zero address");
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(
        address from,
        address to,
        uint256 value
    )
        public
        returns (bool success)
    {
        require(value <= balanceOf[from], "Insufficient balance");
        require(value <= allowance[from][msg.sender], "Insufficient allowance");
        
        allowance[from][msg.sender] = allowance[from][msg.sender] - value;
        _transfer(from, to, value);
        return true;
    }
}
