const assert = require('assert');
const { ethers } = require("hardhat");

describe("CapICO", function () {
  let CapICO;
  let capICO;
  let ICOToken;
  let icoToken;
  let owner;
  let addr1;
  let addr2;
  const TOKEN_NAME = "ICO Token";
  const TOKEN_SYMBOL = "ICOT";
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000"); // 1 million tokens
  const TOKEN_PRICE = ethers.utils.parseEther("0.001");
  const HARD_CAP = ethers.utils.parseEther("100");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy ICOToken
    ICOToken = await ethers.getContractFactory("ICOToken");
    icoToken = await ICOToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
    await icoToken.deployed();

    // Deploy CapICO
    CapICO = await ethers.getContractFactory("CapICO");
    capICO = await CapICO.deploy(
      icoToken.address,
      TOKEN_PRICE,
      HARD_CAP
    );
    await capICO.deployed();

    // Transfer tokens to CapICO contract
    await icoToken.transfer(capICO.address, INITIAL_SUPPLY);

    // Whitelist addr1 and addr2
    await capICO.updateWhitelist([addr1.address, addr2.address], true);
  });

  it("Should set the right owner", async function () {
    assert.equal(await capICO.owner(), owner.address, "Owner should be set correctly");
  });

  it("Should set the correct token price", async function () {
    const setTokenPrice = await capICO.tokenPrice();
    assert.equal(setTokenPrice.toString(), TOKEN_PRICE.toString(), "Token price should be set correctly");
  });

  it("Should set the correct hard cap", async function () {
    const setHardCap = await capICO.hardCap();
    assert.equal(setHardCap.toString(), HARD_CAP.toString(), "Hard cap should be set correctly");
  });

  it("Should allow owner to update whitelist", async function () {
    await capICO.updateWhitelist([addr1.address], true);
    const isWhitelisted = await capICO.whitelist(addr1.address);
    assert.equal(isWhitelisted, true, "Address should be whitelisted");
  });

  it("Should create vesting schedule when whitelisted address buys tokens", async function () {
    const buyAmount = ethers.utils.parseEther("1"); // Buy 1 ETH worth of tokens
    const expectedTokens = buyAmount.mul(ethers.utils.parseEther("1")).div(TOKEN_PRICE);

    await capICO.connect(addr1).buyTokens({ value: buyAmount });

    const vestingSchedule = await capICO.vestingSchedules(addr1.address);
    
    assert.notEqual(vestingSchedule.totalAmount.toString(), '0', "Vesting schedule should be created");
    assert.equal(vestingSchedule.totalAmount.toString(), expectedTokens.toString(), "Vesting schedule should have correct token amount");

    const totalRaised = await capICO.totalRaised();
    assert.equal(totalRaised.toString(), buyAmount.toString(), "Total raised should be updated correctly");
  });

  describe("Cooldown Functionality", function () {
    it("Should allow owner to toggle cooldown", async function () {
      await capICO.toggleCooldown();
      assert.equal(await capICO.cooldownEnabled(), true, "Cooldown should be enabled");

      await capICO.toggleCooldown();
      assert.equal(await capICO.cooldownEnabled(), false, "Cooldown should be disabled");
    });

    it("Should allow purchases when cooldown is disabled", async function () {
      await capICO.toggleCooldown(); // Ensure cooldown is disabled
      const buyAmount = ethers.utils.parseEther("0.1");

      await capICO.connect(addr1).buyTokens({ value: buyAmount });
      const vestingSchedule = await capICO.vestingSchedules(addr1.address);
      assert.notEqual(vestingSchedule.totalAmount.toString(), '0', "Vesting schedule should be created");
    });

    it("Should enforce cooldown period", async function () {
      await capICO.toggleCooldown(); // Enable cooldown
      const buyAmount = ethers.utils.parseEther("0.1");

      // First purchase should succeed
      await capICO.connect(addr2).buyTokens({ value: buyAmount });

      // Second purchase should fail due to cooldown
      await assert.rejects(
        async () => {
          await capICO.connect(addr2).buyTokens({ value: buyAmount });
        },
        {
          message: /Cooldown period not over/
        },
        "Should not allow purchase during cooldown period"
      );

      // Advance time by 1 hour (cooldown duration)
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      // Purchase should now succeed
      await capICO.connect(addr2).buyTokens({ value: buyAmount });
      const vestingSchedule = await capICO.vestingSchedules(addr2.address);
      assert.notEqual(vestingSchedule.totalAmount.toString(), '0', "Vesting schedule should be created after cooldown");
    });

    it("Should return correct cooldown time left", async function () {
      const cooldownDuration = 3600; // 1 hour in seconds
      await capICO.toggleCooldown(); // Ensure cooldown is enabled
      const buyAmount = ethers.utils.parseEther("0.1");

      await capICO.connect(addr1).buyTokens({ value: buyAmount });

      const timeLeftBefore = await capICO.cooldownTimeLeft(addr1.address);
      assert(timeLeftBefore > 0 && timeLeftBefore <= cooldownDuration, "Cooldown time left should be positive and less than or equal to cooldown duration");

      // Advance time by 30 minutes
      await ethers.provider.send("evm_increaseTime", [1800]);
      await ethers.provider.send("evm_mine");

      const timeLeftAfter = await capICO.cooldownTimeLeft(addr1.address);
      assert(timeLeftAfter > 0 && timeLeftAfter < timeLeftBefore, "Cooldown time left should decrease");

      // Advance time to end of cooldown
      await ethers.provider.send("evm_increaseTime", [1800]);
      await ethers.provider.send("evm_mine");

      const timeLeftEnd = await capICO.cooldownTimeLeft(addr1.address);
      assert.equal(timeLeftEnd, 0, "Cooldown time left should be 0 after cooldown period");
    });
  });

  describe("Tier System", function () {
    it("Should allow owner to add tiers", async function () {
      await capICO.addTier(
        ethers.utils.parseEther("1"),  // minPurchase
        ethers.utils.parseEther("5"),  // maxPurchase
        5  // 5% discount
      );

      await capICO.addTier(
        ethers.utils.parseEther("5"),  // minPurchase
        ethers.utils.parseEther("10"), // maxPurchase
        10 // 10% discount
      );

      const tierCount = await capICO.getTierCount();
      assert.equal(tierCount, 2, "Should have added 2 tiers");

      const tier1 = await capICO.getTier(0);
      assert.equal(tier1[0].toString(), ethers.utils.parseEther("1").toString(), "Tier 1 min purchase should be correct");
      assert.equal(tier1[1].toString(), ethers.utils.parseEther("5").toString(), "Tier 1 max purchase should be correct");
      assert.equal(tier1[2], 5, "Tier 1 discount should be correct");

      const tier2 = await capICO.getTier(1);
      assert.equal(tier2[0].toString(), ethers.utils.parseEther("5").toString(), "Tier 2 min purchase should be correct");
      assert.equal(tier2[1].toString(), ethers.utils.parseEther("10").toString(), "Tier 2 max purchase should be correct");
      assert.equal(tier2[2], 10, "Tier 2 discount should be correct");
    });

    it("Should apply correct discount based on purchase amount", async function () {
      // Add tiers
      await capICO.addTier(ethers.utils.parseEther("1"), ethers.utils.parseEther("5"), 5);
      await capICO.addTier(ethers.utils.parseEther("5"), ethers.utils.parseEther("10"), 10);

      // Purchase within Tier 1
      const buyAmount1 = ethers.utils.parseEther("2");
      await capICO.connect(addr1).buyTokens({ value: buyAmount1 });
      const vestingSchedule1 = await capICO.vestingSchedules(addr1.address);
      const expectedTokens1 = buyAmount1.mul(ethers.utils.parseEther("1")).div(TOKEN_PRICE).mul(105).div(100);
      assert.equal(vestingSchedule1.totalAmount.toString(), expectedTokens1.toString(), "Should receive correct discounted amount for Tier 1");

      // Purchase within Tier 2
      const buyAmount2 = ethers.utils.parseEther("7");
      await capICO.connect(addr2).buyTokens({ value: buyAmount2 });
      const vestingSchedule2 = await capICO.vestingSchedules(addr2.address);
      const expectedTokens2 = buyAmount2.mul(ethers.utils.parseEther("1")).div(TOKEN_PRICE).mul(110).div(100);
      assert.equal(vestingSchedule2.totalAmount.toString(), expectedTokens2.toString(), "Should receive correct discounted amount for Tier 2");

      // Purchase below any tier
      const buyAmount3 = ethers.utils.parseEther("0.5");
      await capICO.connect(addr1).buyTokens({ value: buyAmount3 });
      const vestingSchedule3 = await capICO.vestingSchedules(addr1.address);
      const expectedTokens3 = vestingSchedule1.totalAmount.add(buyAmount3.mul(ethers.utils.parseEther("1")).div(TOKEN_PRICE));
      assert.equal(vestingSchedule3.totalAmount.toString(), expectedTokens3.toString(), "Should receive correct amount without discount");
    });
  });

  describe("Vesting and Token Release", function () {
    const buyAmount = ethers.utils.parseEther("1"); // Buy 1 ETH worth of tokens

    beforeEach(async function () {
      // Ensure vesting is enabled (it should be enabled by default)
      if (!(await capICO.vestingEnabled())) {
        await capICO.toggleVesting();
      }
      
      // Purchase tokens to create vesting schedule
      await capICO.connect(addr1).buyTokens({ value: buyAmount });
    });

    it("Should not allow token release before cliff period", async function () {
      await assert.rejects(
        capICO.connect(addr1).releaseVestedTokens(),
        /Cliff period not over/,
        "Should not allow token release before cliff period"
      );
    });

    it("Should allow token release after cliff period", async function () {
      // Advance time by 91 days (1 day after cliff)
      await ethers.provider.send("evm_increaseTime", [91 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await icoToken.balanceOf(addr1.address);
      await capICO.connect(addr1).releaseVestedTokens();
      const finalBalance = await icoToken.balanceOf(addr1.address);

      assert(finalBalance.gt(initialBalance), "Token balance should increase after release");
    });

    it("Should allow partial token releases over time", async function () {
      // Advance time by 6 months (half of vesting period)
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await icoToken.balanceOf(addr1.address);
      await capICO.connect(addr1).releaseVestedTokens();
      const midBalance = await icoToken.balanceOf(addr1.address);

      assert(midBalance.gt(initialBalance), "Token balance should increase after first release");

      // Advance time to end of vesting period
      await ethers.provider.send("evm_increaseTime", [183 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await capICO.connect(addr1).releaseVestedTokens();
      const finalBalance = await icoToken.balanceOf(addr1.address);

      assert(finalBalance.gt(midBalance), "Token balance should increase after second release");
      
      const expectedTotal = buyAmount.mul(ethers.utils.parseEther("1")).div(TOKEN_PRICE);
      assert.equal(finalBalance.toString(), expectedTotal.toString(), "All tokens should be released by the end of vesting period");
    });

    it("Should not allow release of more tokens than vested", async function () {
      // Advance time to end of vesting period
      await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Release all vested tokens
      await capICO.connect(addr1).releaseVestedTokens();

      // Try to release again
      await assert.rejects(
        capICO.connect(addr1).releaseVestedTokens(),
        /No tokens to release/,
        "Should not allow release of more tokens than vested"
      );
    });
  });
});

