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
    mapping(address => bool) public whitelist;
    bool public isActive = true;
    bool public cooldownEnabled = false;
    bool public vestingEnabled = true;
    mapping(address => uint256) public lastPurchaseTime;
    uint256 public constant COOLDOWN_DURATION = 1 hours;

    // Vesting
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliff;
    }
    mapping(address => VestingSchedule) public vestingSchedules;

    // Tiers
    struct Tier {
        uint256 minPurchase;
        uint256 maxPurchase;
        uint256 discount;
    }
    Tier[] public tiers;

    event TokensPurchased(address buyer, uint256 amount);
    event WhitelistUpdated(address user, bool status);
    event ICOStatusUpdated(bool isActive);
    event CooldownToggled(bool enabled);
    event VestingToggled(bool enabled);
    event VestingScheduleCreated(address beneficiary, uint256 amount, uint256 startTime, uint256 duration, uint256 cliff);
    event TokensReleased(address beneficiary, uint256 amount);
    event TierAdded(uint256 minPurchase, uint256 maxPurchase, uint256 discount);

    constructor(
        address _token,
        uint256 _tokenPrice,
        uint256 _hardCap
    ) {
        token = IERC20(_token);
        tokenPrice = _tokenPrice;
        hardCap = _hardCap;
        whitelist[msg.sender] = true; // Whitelist deployer
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

function buyTokens() external payable {
    require(isActive, "ICO not active");
    require(whitelist[msg.sender], "Not whitelisted");
    require(msg.value > 0, "Invalid amount");
    require(totalRaised.add(msg.value) <= hardCap, "Hard cap reached");

    if (cooldownEnabled) {
        require(block.timestamp >= lastPurchaseTime[msg.sender].add(COOLDOWN_DURATION), "Cooldown period not over");
    }

    uint256 tokenAmount = calculateTokenAmount(msg.value);
    totalRaised = totalRaised.add(msg.value);

    if (vestingEnabled) {
        createVestingSchedule(msg.sender, tokenAmount);
    } else {
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
    }

    lastPurchaseTime[msg.sender] = block.timestamp;
    emit TokensPurchased(msg.sender, tokenAmount);
}





    function calculateTokenAmount(uint256 ethAmount) internal view returns (uint256) {
        uint256 baseAmount = ethAmount.mul(10**18).div(tokenPrice);
        uint256 discountedAmount = baseAmount;

        for (uint256 i = 0; i < tiers.length; i++) {
            if (ethAmount >= tiers[i].minPurchase && ethAmount <= tiers[i].maxPurchase) {
                discountedAmount = baseAmount.mul(100 + tiers[i].discount).div(100);
                break;
            }
        }

        return discountedAmount;
    }

function createVestingSchedule(address beneficiary, uint256 amount) internal {
    VestingSchedule storage schedule = vestingSchedules[beneficiary];
    if (schedule.totalAmount == 0) {
        schedule.startTime = block.timestamp;
        schedule.duration = 365 days; // 1 year vesting period
        schedule.cliff = 90 days; // 3 months cliff
    }
    schedule.totalAmount = schedule.totalAmount.add(amount);

    emit VestingScheduleCreated(beneficiary, amount, schedule.startTime, schedule.duration, schedule.cliff);
}

    function releaseVestedTokens() external {
        require(vestingEnabled, "Vesting is not enabled");
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(block.timestamp >= schedule.startTime.add(schedule.cliff), "Cliff period not over");

        uint256 vestedAmount = calculateVestedAmount(schedule);
        uint256 releasableAmount = vestedAmount.sub(schedule.releasedAmount);
        require(releasableAmount > 0, "No tokens to release");

        schedule.releasedAmount = schedule.releasedAmount.add(releasableAmount);
        require(token.transfer(msg.sender, releasableAmount), "Token transfer failed");

        emit TokensReleased(msg.sender, releasableAmount);
    }

    function calculateVestedAmount(VestingSchedule memory schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime.add(schedule.cliff)) {
            return 0;
        } else if (block.timestamp >= schedule.startTime.add(schedule.duration)) {
            return schedule.totalAmount;
        } else {
            return schedule.totalAmount.mul(block.timestamp.sub(schedule.startTime)).div(schedule.duration);
        }
    }

    function updateWhitelist(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }

    function cooldownTimeLeft(address user) external view returns (uint256) {
        if (!cooldownEnabled) {
            return 0;
        }
        uint256 timeSinceLastPurchase = block.timestamp.sub(lastPurchaseTime[user]);
        if (timeSinceLastPurchase >= COOLDOWN_DURATION) {
            return 0;
        }
        return COOLDOWN_DURATION.sub(timeSinceLastPurchase);
    }

    function addTier(uint256 minPurchase, uint256 maxPurchase, uint256 discount) external onlyOwner {
        tiers.push(Tier({
            minPurchase: minPurchase,
            maxPurchase: maxPurchase,
            discount: discount
        }));
        emit TierAdded(minPurchase, maxPurchase, discount);
    }

    function getTierCount() external view returns (uint256) {
        return tiers.length;
    }

    function getTier(uint256 index) external view returns (uint256, uint256, uint256) {
        require(index < tiers.length, "Invalid tier index");
        Tier memory tier = tiers[index];
        return (tier.minPurchase, tier.maxPurchase, tier.discount);
    }
}

