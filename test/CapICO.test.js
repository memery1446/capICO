const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CapICO", function () {
  let CapICO, capICO, ICOToken, icoToken, owner, addr1, addr2, addr3;
  const TOKEN_NAME = "ICO Token";
  const TOKEN_SYMBOL = "ICOT";
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000"); // 1 million tokens
  const BASE_TOKEN_PRICE = ethers.utils.parseEther("0.001");
  const HARD_CAP = ethers.utils.parseEther("100");

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    ICOToken = await ethers.getContractFactory("ICOToken");
    icoToken = await ICOToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
    await icoToken.deployed();

    CapICO = await ethers.getContractFactory("CapICO");
    capICO = await CapICO.deploy(icoToken.address, BASE_TOKEN_PRICE, HARD_CAP);
    await capICO.deployed();

    await icoToken.transfer(capICO.address, INITIAL_SUPPLY);
    await capICO.updateWhitelist([addr1.address, addr2.address, addr3.address], true);
  });

  it("Should set the right owner", async function () {
    expect(await capICO.owner()).to.equal(owner.address);
  });

  it("Should set the correct base token price", async function () {
    expect(await capICO.baseTokenPrice()).to.equal(BASE_TOKEN_PRICE);
  });

  it("Should set the correct hard cap", async function () {
    expect(await capICO.hardCap()).to.equal(HARD_CAP);
  });

  it("Should allow whitelisted address to buy tokens", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.emit(capICO, "TokensPurchased")
      .to.emit(capICO, "TokensLocked");
  });

  it("Should not allow non-whitelisted address to buy tokens", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.updateWhitelist([addr1.address], false);
    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.be.revertedWith("Address is not whitelisted");
  });

  it("Should enforce hard cap", async function () {
    const buyAmount = HARD_CAP.add(1);
    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.be.revertedWith("Hard cap reached");
  });

  it("Should implement dynamic pricing", async function () {
    const initialPrice = await capICO.getCurrentTokenPrice();
    const initialTolerance = BASE_TOKEN_PRICE.div(1000000); // 0.0001% tolerance
    expect(initialPrice).to.be.closeTo(BASE_TOKEN_PRICE, initialTolerance);

    // Advance time by 15 days
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const midPrice = await capICO.getCurrentTokenPrice();
    expect(midPrice).to.be.gt(initialPrice);

    // Advance time by another 15 days
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const finalPrice = await capICO.getCurrentTokenPrice();
    expect(finalPrice).to.be.gt(midPrice);
  
    // Check that the price doesn't exceed the maximum increase (50% above base price)
    const maxPrice = BASE_TOKEN_PRICE.mul(150).div(100);
    const finalTolerance = maxPrice.div(1000000); // 0.0001% tolerance
    expect(finalPrice).to.be.closeTo(maxPrice, finalTolerance);

    // Check that the final price is within 0.0001% of the expected price
    const expectedFinalPrice = BASE_TOKEN_PRICE.mul(150).div(100);
    expect(finalPrice).to.be.closeTo(expectedFinalPrice, finalTolerance);
  });

  it("Should handle referrals correctly", async function () {
    await capICO.connect(addr2).setReferrer(addr1.address);
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.connect(addr2).buyTokens({ value: buyAmount });

    const referralBonus = await capICO.referralBonuses(addr1.address);
    expect(referralBonus).to.be.gt(0);

    await expect(capICO.connect(addr1).claimReferralBonus())
      .to.emit(capICO, "ReferralBonusClaimed")
      .withArgs(addr1.address, referralBonus);

    const newReferralBonus = await capICO.referralBonuses(addr1.address);
    expect(newReferralBonus).to.equal(0);
  });

  it("Should lock up tokens correctly", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.connect(addr1).buyTokens({ value: buyAmount });

    const lockedTokens = await capICO.lockedTokens(addr1.address);
    expect(lockedTokens).to.be.gt(0);

    await expect(capICO.connect(addr1).unlockTokens())
      .to.be.revertedWith("Lockup period not over");

    // Advance time by 180 days
    await ethers.provider.send("evm_increaseTime", [180 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(capICO.connect(addr1).unlockTokens())
      .to.emit(capICO, "TokensUnlocked")
      .withArgs(addr1.address, lockedTokens);

    const newLockedTokens = await capICO.lockedTokens(addr1.address);
    expect(newLockedTokens).to.equal(0);
  });

  it("Should handle vesting correctly", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.connect(addr1).buyTokens({ value: buyAmount });

    await expect(capICO.connect(addr1).releaseVestedTokens())
      .to.be.revertedWith("Cliff period not over");

    // Advance time by 90 days (cliff period)
    await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(capICO.connect(addr1).releaseVestedTokens())
      .to.emit(capICO, "TokensReleased");

    // Advance time by 275 days (full vesting period)
    await ethers.provider.send("evm_increaseTime", [275 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(capICO.connect(addr1).releaseVestedTokens())
      .to.emit(capICO, "TokensReleased");

    const vestingSchedule = await capICO.vestingSchedules(addr1.address);
    expect(vestingSchedule.releasedAmount).to.equal(vestingSchedule.totalAmount);
  });

  it("Should allow owner to withdraw funds", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.connect(addr1).buyTokens({ value: buyAmount });

    const initialBalance = await ethers.provider.getBalance(owner.address);
    await capICO.withdrawFunds();
    const finalBalance = await ethers.provider.getBalance(owner.address);

    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("Should allow owner to toggle ICO status", async function () {
    expect(await capICO.isActive()).to.be.true;

    await expect(capICO.toggleActive())
      .to.emit(capICO, "ICOStatusUpdated")
      .withArgs(false);

    expect(await capICO.isActive()).to.be.false;

    await expect(capICO.toggleActive())
      .to.emit(capICO, "ICOStatusUpdated")
      .withArgs(true);

    expect(await capICO.isActive()).to.be.true;
  });

  it("Should allow owner to toggle cooldown", async function () {
    expect(await capICO.cooldownEnabled()).to.be.false;

    await expect(capICO.toggleCooldown())
      .to.emit(capICO, "CooldownToggled")
      .withArgs(true);

    expect(await capICO.cooldownEnabled()).to.be.true;

    await expect(capICO.toggleCooldown())
      .to.emit(capICO, "CooldownToggled")
      .withArgs(false);

    expect(await capICO.cooldownEnabled()).to.be.false;
  });

  it("Should enforce cooldown period when enabled", async function () {
    await capICO.toggleCooldown();
    const buyAmount = ethers.utils.parseEther("0.5");

    await capICO.connect(addr1).buyTokens({ value: buyAmount });

    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.be.revertedWith("Cooldown period not over");

    // Advance time by 1 hour (cooldown period)
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");

    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.not.be.reverted;
  });

  it("Should allow owner to add tiers", async function () {
    await expect(capICO.addTier(
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("5"),
      5
    )).to.emit(capICO, "TierAdded")
      .withArgs(ethers.utils.parseEther("1"), ethers.utils.parseEther("5"), 5);

    const tier = await capICO.getTier(0);
    expect(tier[0]).to.equal(ethers.utils.parseEther("1"));
    expect(tier[1]).to.equal(ethers.utils.parseEther("5"));
    expect(tier[2]).to.equal(5);
  });

  it("Should apply correct discount based on tier", async function () {
    await capICO.addTier(
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("5"),
      10
    );

    const buyAmount = ethers.utils.parseEther("2");
    const baseTokens = buyAmount.mul(ethers.utils.parseEther("1")).div(BASE_TOKEN_PRICE);
    const expectedTokens = baseTokens.add(baseTokens.mul(10).div(100));

    const tx = await capICO.connect(addr1).buyTokens({ value: buyAmount });
    const receipt = await tx.wait();

    const tokensPurchasedEvent = receipt.events?.find(e => e.event === "TokensPurchased");
    expect(tokensPurchasedEvent).to.not.be.undefined;

    const [buyer, amount, tokens] = tokensPurchasedEvent.args;
    expect(buyer).to.equal(addr1.address);
    expect(amount).to.equal(buyAmount);

    // Allow for a small tolerance (0.1%) in the token amount
    const tolerance = expectedTokens.div(1000); // 0.1% tolerance
    expect(tokens).to.be.closeTo(expectedTokens, tolerance);
  });
});

