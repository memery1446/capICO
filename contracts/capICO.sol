// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CapICO is Ownable {
    using SafeMath for uint256;

    IERC20 public token;
    uint256 public baseTokenPrice;
    uint256 public hardCap;
    uint256 public totalRaised;
    uint256 public icoStartTime;
    bool public isActive;
    bool public cooldownEnabled;
    bool public vestingEnabled;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    uint256 public constant VESTING_CLIFF = 90 days;
    uint256 public constant VESTING_DURATION = 365 days;
    uint256 public constant LOCKUP_DURATION = 180 days;
    uint256 public constant REFERRAL_BONUS_PERCENTAGE = 5;
    uint256 public constant MAX_PRICE_INCREASE_PERCENTAGE = 50;

    mapping(address => bool) public whitelist;
    mapping(address => uint256) public lastPurchaseTime;
    mapping(address => VestingSchedule) public vestingSchedules;
    mapping(address => uint256) public lockedTokens;
    mapping(address => address) public referrers;
    mapping(address => uint256) public referralBonuses;

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
    event ReferralBonusClaimed(address indexed referrer, uint256 amount);
    event TokensLocked(address indexed buyer, uint256 amount);
    event TokensUnlocked(address indexed buyer, uint256 amount);

    constructor(IERC20 _token, uint256 _baseTokenPrice, uint256 _hardCap) {
        token = _token;
        baseTokenPrice = _baseTokenPrice;
        hardCap = _hardCap;
        isActive = true;
        vestingEnabled = true;
        icoStartTime = block.timestamp;
    }

    function buyTokens() public payable {
        require(isActive, "ICO is not active");
        require(whitelist[msg.sender], "Address is not whitelisted");
        require(totalRaised.add(msg.value) <= hardCap, "Hard cap reached");
        
        if (cooldownEnabled) {
            require(block.timestamp.sub(lastPurchaseTime[msg.sender]) >= COOLDOWN_PERIOD, "Cooldown period not over");
        }

        uint256 tokenPrice = getCurrentTokenPrice();
        uint256 tokenAmount = calculateTokenAmount(msg.value, tokenPrice);
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens in the contract");

        uint256 lockedAmount = tokenAmount.mul(20).div(100); // 20% of tokens are locked
        uint256 unlockedAmount = tokenAmount.sub(lockedAmount);

        if (vestingEnabled) {
            createVestingSchedule(msg.sender, unlockedAmount);
        } else {
            require(token.transfer(msg.sender, unlockedAmount), "Token transfer failed");
        }

        lockedTokens[msg.sender] = lockedTokens[msg.sender].add(lockedAmount);

        totalRaised = totalRaised.add(msg.value);
        lastPurchaseTime[msg.sender] = block.timestamp;

        // Handle referral bonus
        if (referrers[msg.sender] != address(0)) {
            uint256 referralBonus = tokenAmount.mul(REFERRAL_BONUS_PERCENTAGE).div(100);
            referralBonuses[referrers[msg.sender]] = referralBonuses[referrers[msg.sender]].add(referralBonus);
        }

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
        emit TokensLocked(msg.sender, lockedAmount);
    }

    function getCurrentTokenPrice() public view returns (uint256) {
        uint256 elapsedTime = block.timestamp.sub(icoStartTime);
        uint256 priceIncrease = baseTokenPrice.mul(MAX_PRICE_INCREASE_PERCENTAGE).div(100);
        uint256 gradualIncrease = priceIncrease.mul(elapsedTime).div(30 days); // Linear increase over 30 days
        return baseTokenPrice.add(gradualIncrease);
    }

    function calculateTokenAmount(uint256 _weiAmount, uint256 _tokenPrice) public view returns (uint256) {
        uint256 baseTokens = _weiAmount.mul(1e18).div(_tokenPrice);
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

    function unlockTokens() external {
        require(block.timestamp >= icoStartTime.add(LOCKUP_DURATION), "Lockup period not over");
        uint256 amountToUnlock = lockedTokens[msg.sender];
        require(amountToUnlock > 0, "No tokens to unlock");

        lockedTokens[msg.sender] = 0;
        require(token.transfer(msg.sender, amountToUnlock), "Token transfer failed");

        emit TokensUnlocked(msg.sender, amountToUnlock);
    }

    function claimReferralBonus() external {
        uint256 bonus = referralBonuses[msg.sender];
        require(bonus > 0, "No referral bonus to claim");

        referralBonuses[msg.sender] = 0;
        require(token.transfer(msg.sender, bonus), "Token transfer failed");

        emit ReferralBonusClaimed(msg.sender, bonus);
    }

    function setReferrer(address _referrer) external {
        require(referrers[msg.sender] == address(0), "Referrer already set");
        require(_referrer != msg.sender, "Cannot refer yourself");
        referrers[msg.sender] = _referrer;
    }

    function updateWhitelist(address[] calldata _addresses, bool _status) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = _status;
        }
        emit WhitelistUpdated(_addresses, _status);
    }

    function toggleActive() external onlyOwner {
        isActive = !isActive;
        emit ICOStatusUpdated(isActive);
    }

    function toggleCooldown() external onlyOwner {
        cooldownEnabled = !cooldownEnabled;
        emit CooldownToggled(cooldownEnabled);
    }

    function toggleVesting() external onlyOwner {
        vestingEnabled = !vestingEnabled;
        emit VestingToggled(vestingEnabled);
    }

    function addTier(uint256 _minPurchase, uint256 _maxPurchase, uint256 _discount) external onlyOwner {
        require(_minPurchase < _maxPurchase, "Invalid tier range");
        require(_discount <= 100, "Invalid discount percentage");
        tiers.push(Tier(_minPurchase, _maxPurchase, _discount));
        emit TierAdded(_minPurchase, _maxPurchase, _discount);
    }

    function getTierCount() external view returns (uint256) {
        return tiers.length;
    }

    function getTier(uint256 _index) external view returns (uint256, uint256, uint256) {
        require(_index < tiers.length, "Invalid tier index");
        Tier memory tier = tiers[_index];
        return (tier.minPurchase, tier.maxPurchase, tier.discount);
    }

    function cooldownTimeLeft(address _address) external view returns (uint256) {
        if (!cooldownEnabled || block.timestamp.sub(lastPurchaseTime[_address]) >= COOLDOWN_PERIOD) {
            return 0;
        }
        return COOLDOWN_PERIOD.sub(block.timestamp.sub(lastPurchaseTime[_address]));
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {
        buyTokens();
    }
}

