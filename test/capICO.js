const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('CapICO', () => {
  let Token, CapICO, token, capico;  // Declare factories at the top level
  let deployer, user1, user2;
  let startTime, endTime;
  const day = 24 * 60 * 60;

  beforeEach(async function() {
    [deployer, user1, user2] = await ethers.getSigners();

    // Get contract factories
    Token = await ethers.getContractFactory('Token');
    CapICO = await ethers.getContractFactory('CapICO');

    const latestTime = await time.latest();
    startTime = latestTime + 1000;
    endTime = startTime + (7 * day);

    // Deploy Token
    token = await Token.deploy('Test Token', 'TEST', '1000000')
    await token.deployed();

    // Deploy CapICO
    capico = await CapICO.deploy(
      token.address,
      ether(1),
      ether(50),
      ether(200),
      ether(0.1),
      ether(100),
      startTime,
      endTime
    )
    await capico.deployed();

    // Transfer tokens to CapICO contract
    await token.transfer(capico.address, tokens(10000))
  });

  describe('Deployment', () => {
    it('sets immutable variables correctly', async () => {
      expect(await capico.token()).to.equal(token.address);
      expect(await capico.startTime()).to.equal(startTime);
      expect(await capico.endTime()).to.equal(endTime);
      expect(await capico.tokenPrice()).to.equal(ether(1));
      expect(await capico.softCap()).to.equal(ether(50));
      expect(await capico.hardCap()).to.equal(ether(200));
      expect(await capico.minInvestment()).to.equal(ether(0.1));
      expect(await capico.maxInvestment()).to.equal(ether(100));
    });

    it('initializes state variables correctly', async () => {
      expect(await capico.totalTokensSold()).to.equal(0);
      expect(await capico.totalRaised()).to.equal(0);
      expect(await capico.isFinalized()).to.equal(false);
      expect(await capico.whitelist(deployer.address)).to.equal(true);
    });
  });

describe('Token Purchase', () => {
  beforeEach(async () => {
    await capico.updateWhitelist([user1.address], true);
    await time.increaseTo(startTime + 10);
  });

  describe('Success cases', () => {
    it('allows whitelisted user to buy tokens', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      expect(await token.balanceOf(user1.address)).to.equal(tokens(5)); // 50% immediate
    });

    it('updates total tokens sold and raised amount', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      expect(await capico.totalTokensSold()).to.equal(tokens(10));
      expect(await capico.totalRaised()).to.equal(ether(10));
    });

    it('tracks investment correctly', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      expect(await capico.investments(user1.address)).to.equal(ether(10));
      expect(await capico.totalRaised()).to.equal(ether(10));
    });

    it('handles multiple purchases from same user', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      await time.increase(day + 1);
      await capico.connect(user1).buyTokens(tokens(20), { value: ether(20) });
      expect(await capico.investments(user1.address)).to.equal(ether(30));
      expect(await token.balanceOf(user1.address)).to.equal(tokens(15)); // 50% of total
    });
  });

  describe('Failure cases', () => {
    // Test for purchases before start time
    it('prevents purchase before start time', async () => {
      // Deploy a new contract with future start time
      const newStartTime = (await time.latest()) + 1000;
      const newEndTime = newStartTime + (7 * day);
      
      const newCapICO = await CapICO.deploy(
        token.address,
        ether(1),
        ether(50),
        ether(200),
        ether(0.1),
        ether(100),
        newStartTime,
        newEndTime
      );
      await newCapICO.deployed();
      
      // Whitelist user1 on new contract
      await newCapICO.updateWhitelist([user1.address], true);
      
      await expect(
        newCapICO.connect(user1).buyTokens(tokens(10), { value: ether(10) })
      ).to.be.revertedWith('ICO not active');
    });

    // Test for purchases after end time
    it('prevents purchase after end time', async () => {
      await time.increaseTo(endTime + 1);
      await expect(
        capico.connect(user1).buyTokens(tokens(10), { value: ether(10) })
      ).to.be.revertedWith('ICO not active');
    });

    it('prevents purchase from non-whitelisted address', async () => {
      await expect(
        capico.connect(user2).buyTokens(tokens(10), { value: ether(10) })
      ).to.be.revertedWith('Not whitelisted');
    });

    it('prevents purchase below minimum investment', async () => {
      await expect(
        capico.connect(user1).buyTokens(tokens(0.05), { value: ether(0.05) })
      ).to.be.revertedWith('Below min investment');
    });

    it('prevents purchase above maximum investment', async () => {
      await expect(
        capico.connect(user1).buyTokens(tokens(101), { value: ether(101) })
      ).to.be.revertedWith('Exceeds max investment');
    });

    it('prevents purchase with incorrect payment amount', async () => {
      await expect(
        capico.connect(user1).buyTokens(tokens(10), { value: ether(9) })
      ).to.be.revertedWith('Incorrect payment');
    });

    it('prevents purchase after hard cap is reached', async () => {
      // Get additional users
      const [,,user3, user4] = await ethers.getSigners();
      
      // Whitelist all users
      await capico.updateWhitelist([user1.address, user2.address, user3.address, user4.address], true);
      
      // Four purchases of 50 ETH each to reach 200 ETH (hard cap)
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await time.increase(day + 1);
      
      await capico.connect(user2).buyTokens(tokens(50), { value: ether(50) });
      await time.increase(day + 1);
      
      await capico.connect(user3).buyTokens(tokens(50), { value: ether(50) });
      await time.increase(day + 1);
      
      await capico.connect(user4).buyTokens(tokens(49), { value: ether(49) });
      await time.increase(day + 1);
      
      // This purchase would exceed the hard cap
      await expect(
        capico.connect(user1).buyTokens(tokens(2), { value: ether(2) })
      ).to.be.revertedWith('Hard cap reached');
    });
  });
});

  describe('Distribution Schedule', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 10);
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
    });

    it('schedules correct distribution amounts', async () => {
      const dist0 = await capico.distributions(user1.address, 0);
      const dist1 = await capico.distributions(user1.address, 1);
      
      expect(dist0.amount).to.equal(tokens(2.5)); // 25% of 10 tokens
      expect(dist1.amount).to.equal(tokens(2.5)); // 25% of 10 tokens
    });

    it('schedules correct release times', async () => {
      const purchaseTime = await time.latest();
      const dist0 = await capico.distributions(user1.address, 0);
      const dist1 = await capico.distributions(user1.address, 1);
      
      expect(dist0.releaseTime).to.equal(purchaseTime + (30 * day));
      expect(dist1.releaseTime).to.equal(purchaseTime + (60 * day));
    });

    it('allows claiming after release time', async () => {
      await time.increase(31 * day);
      await capico.connect(user1).claimDistribution(0);
      expect(await token.balanceOf(user1.address)).to.equal(tokens(7.5)); // 50% initial + 25% claimed
    });

    it('prevents claiming before release time', async () => {
      await time.increase(29 * day);
      await expect(
        capico.connect(user1).claimDistribution(0)
      ).to.be.revertedWith('Too early');
    });

    it('prevents claiming twice', async () => {
      await time.increase(31 * day);
      await capico.connect(user1).claimDistribution(0);
      await expect(
        capico.connect(user1).claimDistribution(0)
      ).to.be.revertedWith('Already claimed');
    });
  });

  describe('Refunds', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 10);
    });

    it('allows refund if soft cap not met', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      await time.increaseTo(endTime + 1);
      
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await capico.connect(user1).claimRefund();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      
      expect(balanceAfter.add(gasCost).sub(balanceBefore)).to.equal(ether(10));
    });

    it('prevents refund before ICO ends', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      await expect(
        capico.connect(user1).claimRefund()
      ).to.be.revertedWith('ICO not ended');
    });

    it('prevents refund if soft cap met', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await time.increaseTo(endTime + 1);
      await expect(
        capico.connect(user1).claimRefund()
      ).to.be.revertedWith('Soft cap reached');
    });

    it('prevents refund after finalization', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await time.increaseTo(endTime + 1);
      await capico.finalize();
      await expect(
        capico.connect(user1).claimRefund()
      ).to.be.revertedWith('ICO finalized');
    });
  });

  describe('Finalization', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 10);
    });

    it('allows finalization after end time if soft cap met', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await time.increaseTo(endTime + 1);
      await capico.finalize();
      expect(await capico.isFinalized()).to.be.true;
    });

    it('prevents finalization before end time', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await expect(
        capico.finalize()
      ).to.be.revertedWith('ICO not ended');
    });

    it('prevents finalization if soft cap not met', async () => {
      await time.increaseTo(endTime + 1);
      await expect(
        capico.finalize()
      ).to.be.revertedWith('Soft cap not reached');
    });

    it('transfers remaining tokens and ETH to owner', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await time.increaseTo(endTime + 1);
      
      const ownerBalanceBefore = await ethers.provider.getBalance(deployer.address);
      const tx = await capico.finalize();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const ownerBalanceAfter = await ethers.provider.getBalance(deployer.address);
      
      expect(ownerBalanceAfter.add(gasCost).sub(ownerBalanceBefore)).to.equal(ether(50));
      expect(await token.balanceOf(deployer.address)).to.be.gt(0);
    });
  });

describe('Emergency Functions', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 10);
    });

    it('allows owner to pause and unpause', async () => {
      const pauseTx = await capico.pause();
      await pauseTx.wait();
      expect(await capico.paused()).to.be.true;
      
      const unpauseTx = await capico.unpause();
      await unpauseTx.wait();
      expect(await capico.paused()).to.be.false;
    });

    it('prevents non-owner from pausing', async () => {
      await expect(
        capico.connect(user1).pause()
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('prevents purchases while paused', async () => {
      await capico.pause();
      await expect(
        capico.connect(user1).buyTokens(tokens(10), { value: ether(10) })
      ).to.be.revertedWith('Pausable: paused');
    });
  });

  describe('Receive Function', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 10);
    });

    it('allows direct ETH transfers and converts to correct token amount', async () => {
      await user1.sendTransaction({
        to: capico.address,
        value: ether(10)
      });

      expect(await token.balanceOf(user1.address)).to.equal(tokens(5)); // 50% immediate
      expect(await capico.totalTokensSold()).to.equal(tokens(10));
      expect(await capico.totalRaised()).to.equal(ether(10));
    });
  });
});