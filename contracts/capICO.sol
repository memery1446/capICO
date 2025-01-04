// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CapICO is Ownable {
    using SafeMath for uint256;

    IERC20 public token;
    uint256 public tokenPrice;
    uint256 public hardCap;
    uint256 public totalRaised;
    bool public isActive;
    bool public cooldownEnabled;
    bool public vestingEnabled;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    uint256 public constant VESTING_CLIFF = 90 days;
    uint256 public constant VESTING_DURATION = 365 days;

    mapping(address => bool) public whitelist;
    mapping(address => uint256) public lastPurchaseTime;
    mapping(address => VestingSchedule) public vestingSchedules;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliff;
    }

    struct Tier {
        uint256 minPurchase;
        uint256 maxPurchase;
        uint256 discount;
    }

    Tier[] public tiers;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 tokens);
    event WhitelistUpdated(address[] users, bool status);
    event ICOStatusUpdated(bool isActive);
    event CooldownToggled(bool enabled);
    event VestingToggled(bool enabled);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 startTime, uint256 duration, uint256 cliff);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event TierAdded(uint256 minPurchase, uint256 maxPurchase, uint256 discount);

    constructor(IERC20 _token, uint256 _tokenPrice, uint256 _hardCap) {
        token = _token;
        tokenPrice = _tokenPrice;
        hardCap = _hardCap;
        isActive = true;
        vestingEnabled = true;
    }

    function buyTokens() public payable {
        require(isActive, "ICO is not active");
        require(whitelist[msg.sender], "Address is not whitelisted");
        require(totalRaised.add(msg.value) <= hardCap, "Hard cap reached");
        
        if (cooldownEnabled) {
            require(block.timestamp.sub(lastPurchaseTime[msg.sender]) >= COOLDOWN_PERIOD, "Cooldown period not over");
        }

        uint256 tokenAmount = calculateTokenAmount(msg.value);
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens in the contract");

        if (vestingEnabled) {
            createVestingSchedule(msg.sender, tokenAmount);
        } else {
            require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        }

        totalRaised = totalRaised.add(msg.value);
        lastPurchaseTime[msg.sender] = block.timestamp;

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    function calculateTokenAmount(uint256 _weiAmount) public view returns (uint256) {
        uint256 baseTokens = _weiAmount.mul(1e18).div(tokenPrice);
        uint256 bonusTokens = 0;

        for (uint256 i = 0; i < tiers.length; i++) {
            if (_weiAmount >= tiers[i].minPurchase && _weiAmount <= tiers[i].maxPurchase) {
                bonusTokens = baseTokens.mul(tiers[i].discount).div(100);
                break;
            }
        }

        return baseTokens.add(bonusTokens);
    }

    function createVestingSchedule(address beneficiary, uint256 _amount) internal {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        schedule.totalAmount = schedule.totalAmount.add(_amount);
        if (schedule.startTime == 0) {
            schedule.startTime = block.timestamp;
            schedule.duration = VESTING_DURATION;
            schedule.cliff = VESTING_CLIFF;
        }

        emit VestingScheduleCreated(beneficiary, _amount, schedule.startTime, schedule.duration, schedule.cliff);
    }

    function releaseVestedTokens() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(block.timestamp >= schedule.startTime.add(schedule.cliff), "Cliff period not over");

        uint256 vestedAmount;
        if (block.timestamp >= schedule.startTime.add(schedule.duration)) {
            vestedAmount = schedule.totalAmount;
        } else {
            vestedAmount = schedule.totalAmount.mul(block.timestamp.sub(schedule.startTime)).div(schedule.duration);
        }

        uint256 releasableAmount = vestedAmount.sub(schedule.releasedAmount);
        require(releasableAmount > 0, "No tokens to release");

        schedule.releasedAmount = schedule.releasedAmount.add(releasableAmount);
        require(token.transfer(msg.sender, releasableAmount), "Token transfer failed");

        emit TokensReleased(msg.sender, releasableAmount);
    }

    function updateWhitelist(address[] calldata _addresses, bool _status) public onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = _status;
        }
        emit WhitelistUpdated(_addresses, _status);
    }

    function toggleActive() public onlyOwner {
        isActive = !isActive;
        emit ICOStatusUpdated(isActive);
    }

    function toggleCooldown() public onlyOwner {
        cooldownEnabled = !cooldownEnabled;
        emit CooldownToggled(cooldownEnabled);
    }

    function toggleVesting() public onlyOwner {
        vestingEnabled = !vestingEnabled;
        emit VestingToggled(vestingEnabled);
    }

    function addTier(uint256 _minPurchase, uint256 _maxPurchase, uint256 _discount) public onlyOwner {
        require(_minPurchase < _maxPurchase, "Invalid tier range");
        require(_discount <= 100, "Invalid discount percentage");
        tiers.push(Tier(_minPurchase, _maxPurchase, _discount));
        emit TierAdded(_minPurchase, _maxPurchase, _discount);
    }

    function getTierCount() public view returns (uint256) {
        return tiers.length;
    }

    function getTier(uint256 _index) public view returns (uint256, uint256, uint256) {
        require(_index < tiers.length, "Invalid tier index");
        Tier memory tier = tiers[_index];
        return (tier.minPurchase, tier.maxPurchase, tier.discount);
    }

    function cooldownTimeLeft(address _address) public view returns (uint256) {
        if (!cooldownEnabled || block.timestamp.sub(lastPurchaseTime[_address]) >= COOLDOWN_PERIOD) {
            return 0;
        }
        return COOLDOWN_PERIOD.sub(block.timestamp.sub(lastPurchaseTime[_address]));
    }

    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {
        buyTokens();
    }
}

