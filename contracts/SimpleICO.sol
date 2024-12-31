// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleICO {
    uint256 public totalRaised;
    uint256 public constant GOAL = 100 ether;
    mapping(address => uint256) public contributions;

    function contribute() public payable {
        require(totalRaised < GOAL, "Goal already reached");
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
    }

    function withdraw() public {
        require(totalRaised >= GOAL, "Goal not reached yet");
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "No contributions");
        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getContribution(address contributor) public view returns (uint256) {
        return contributions[contributor];
    }

    function getGoalProgress() public view returns (uint256, uint256) {
        return (totalRaised, GOAL);
    }
}

