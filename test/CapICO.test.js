const { ethers } = require("hardhat");

let chai;
let expect;

describe("CapICO", function () {
  let CapICO, capICO, ICOToken, icoToken, owner, addr1, addr2;
  const TOKEN_NAME = "ICO Token";
  const TOKEN_SYMBOL = "ICOT";
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000"); // 1 million tokens
  const TOKEN_PRICE = ethers.utils.parseEther("0.001");
  const HARD_CAP = ethers.utils.parseEther("100");

  before(async function () {
    chai = await import('chai');
    expect = chai.expect;
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
  });

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    ICOToken = await ethers.getContractFactory("ICOToken");
    icoToken = await ICOToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
    await icoToken.deployed();

    CapICO = await ethers.getContractFactory("CapICO");
    capICO = await CapICO.deploy(icoToken.address, TOKEN_PRICE, HARD_CAP);
    await capICO.deployed();

    await icoToken.transfer(capICO.address, INITIAL_SUPPLY);
    await capICO.updateWhitelist([addr1.address, addr2.address], true);
  });

  it("Should set the right owner", async function () {
    expect(await capICO.owner()).to.equal(owner.address);
  });

  it("Should set the correct token price", async function () {
    const tokenPrice = await capICO.tokenPrice();
    expect(tokenPrice.toString()).to.equal(TOKEN_PRICE.toString());
  });

  it("Should set the correct hard cap", async function () {
    const hardCap = await capICO.hardCap();
    expect(hardCap.toString()).to.equal(HARD_CAP.toString());
  });

  it("Should allow owner to update whitelist", async function () {
    const tx = await capICO.updateWhitelist([addr1.address], true);
    await expect(tx)
      .to.emit(capICO, "WhitelistUpdated")
      .withArgs([addr1.address], true);
    expect(await capICO.whitelist(addr1.address)).to.be.true;
  });

  it("Should allow whitelisted address to buy tokens", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    const expectedTokens = buyAmount.mul(ethers.utils.parseEther("1")).div(TOKEN_PRICE);

    const tx = await capICO.connect(addr1).buyTokens({ value: buyAmount });
    await expect(tx)
      .to.emit(capICO, "TokensPurchased")
      .withArgs(addr1.address, buyAmount, expectedTokens);

    const vestingSchedule = await capICO.vestingSchedules(addr1.address);
    expect(vestingSchedule.totalAmount.toString()).to.equal(expectedTokens.toString());
  });

  it("Should not allow non-whitelisted address to buy tokens", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.updateWhitelist([addr1.address], false);

    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.be.rejectedWith("Address is not whitelisted");
  });

  it("Should enforce hard cap", async function () {
    const buyAmount = HARD_CAP.add(1);
    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.be.rejectedWith("Hard cap reached");
  });

  it("Should allow owner to toggle ICO status", async function () {
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
    await expect(capICO.toggleCooldown())
      .to.emit(capICO, "CooldownToggled")
      .withArgs(true);
    expect(await capICO.cooldownEnabled()).to.be.true;

    await expect(capICO.toggleCooldown())
      .to.emit(capICO, "CooldownToggled")
      .withArgs(false);
    expect(await capICO.cooldownEnabled()).to.be.false;
  });

  it("Should enforce cooldown period", async function () {
    await capICO.toggleCooldown();
    const buyAmount = ethers.utils.parseEther("1");

    await capICO.connect(addr1).buyTokens({ value: buyAmount });
    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.be.rejectedWith("Cooldown period not over");

    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");

    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.not.be.rejected;
  });

  it("Should allow owner to add tiers", async function () {
    await expect(capICO.addTier(
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("5"),
      5
    )).to.emit(capICO, "TierAdded")
      .withArgs(ethers.utils.parseEther("1"), ethers.utils.parseEther("5"), 5);

    const tier = await capICO.getTier(0);
    expect(tier[0].toString()).to.equal(ethers.utils.parseEther("1").toString());
    expect(tier[1].toString()).to.equal(ethers.utils.parseEther("5").toString());
    expect(tier[2].toString()).to.equal("5");
  });

  it("Should apply correct discount based on tier", async function () {
    await capICO.addTier(
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("5"),
      10
    );

    const buyAmount = ethers.utils.parseEther("2");
    const baseTokens = buyAmount.mul(ethers.utils.parseEther("1")).div(TOKEN_PRICE);
    const expectedTokens = baseTokens.add(baseTokens.mul(10).div(100));

    await expect(capICO.connect(addr1).buyTokens({ value: buyAmount }))
      .to.emit(capICO, "TokensPurchased")
      .withArgs(addr1.address, buyAmount, expectedTokens);
  });

  it("Should handle vesting correctly", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.connect(addr1).buyTokens({ value: buyAmount });

    await expect(capICO.connect(addr1).releaseVestedTokens())
      .to.be.revertedWith("Cliff period not over");

    // Move time to just after the cliff period
    await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine");

    // Calculate expected vested amount
    const totalVestingDuration = 365 * 24 * 60 * 60; // 365 days in seconds
    const timeElapsed = 90 * 24 * 60 * 60 + 1; // 90 days + 1 second
    const expectedVestedPercentage = timeElapsed / totalVestingDuration;
    const totalTokens = ethers.utils.parseEther("1000"); // 1 ETH buys 1000 tokens at 0.001 ETH per token
    const expectedVestedAmount = totalTokens.mul(Math.floor(expectedVestedPercentage * 1e6)).div(1e6);

    await expect(capICO.connect(addr1).releaseVestedTokens())
      .to.emit(capICO, "TokensReleased");

    const vestingSchedule = await capICO.vestingSchedules(addr1.address);
    const tolerance = ethers.utils.parseEther("0.1"); // 0.1 token tolerance
    expect(vestingSchedule.releasedAmount).to.be.closeTo(expectedVestedAmount, tolerance);

    // Move time to the end of the vesting period
    await ethers.provider.send("evm_increaseTime", [275 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(capICO.connect(addr1).releaseVestedTokens())
      .to.emit(capICO, "TokensReleased");

    const finalVestingSchedule = await capICO.vestingSchedules(addr1.address);
    const expectedTotalReleased = totalTokens;
    expect(finalVestingSchedule.releasedAmount).to.be.closeTo(expectedTotalReleased, tolerance);
  });

  it("Should allow owner to withdraw funds", async function () {
    const buyAmount = ethers.utils.parseEther("1");
    await capICO.connect(addr1).buyTokens({ value: buyAmount });

    const initialBalance = await ethers.provider.getBalance(owner.address);
    await capICO.withdrawFunds();
    const finalBalance = await ethers.provider.getBalance(owner.address);

    const difference = finalBalance.sub(initialBalance);
    expect(difference).to.be.closeTo(buyAmount, ethers.utils.parseEther("0.001"));
  });
});

