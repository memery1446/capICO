const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { BigNumber } = ethers;

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('CapICO', () => {
  let token, capico;
  let deployer, user1, user2;
  let startTime, endTime;
  const day = 24 * 60 * 60;

  beforeEach(async function() {
    // Get signers
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy Token
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Test Token', 'TEST', '1000000')

    // Get current block timestamp for tier times
    const latestTime = await time.latest();
    startTime = latestTime + 100;
    endTime = startTime + (3 * day);

    // Deploy CapICO with initial tiers
    const CapICO = await ethers.getContractFactory('CapICO')
    capico = await CapICO.deploy(
      token.address,
      ether(100),  // softCap
      ether(0.1),  // minInvestment
      ether(50),   // maxInvestment
      [ether(1), ether(2)],  // prices for two tiers
      [tokens(100), tokens(100)],  // maxTokens for two tiers
      [startTime, endTime + 1],  // startTimes
      [endTime, endTime + day]   // endTimes
    )

    // Transfer tokens to CapICO contract
    await token.transfer(capico.address, tokens(200))
  });

  describe('Deployment', () => {
    it('has correct token address', async () => {
      expect(await capico.token()).to.equal(token.address)
    })

    it('has correct soft cap', async () => {
      expect(await capico.softCap()).to.equal(ether(100))
    })

    it('has correct investment limits', async () => {
      expect(await capico.minInvestment()).to.equal(ether(0.1))
      expect(await capico.maxInvestment()).to.equal(ether(50))
    })

    it('initializes tiers correctly', async () => {
      const tier0 = await capico.tiers(0)
      expect(tier0.price).to.equal(ether(1))
      expect(tier0.maxTokens).to.equal(tokens(100))
      expect(tier0.startTime).to.equal(startTime)
      expect(tier0.endTime).to.equal(endTime)

      const tier1 = await capico.tiers(1)
      expect(tier1.price).to.equal(ether(2))
      expect(tier1.maxTokens).to.equal(tokens(100))
      expect(tier1.startTime).to.equal(endTime + 1)
      expect(tier1.endTime).to.equal(endTime + day)
    })
  });

  describe('Token Purchase', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 1);
    });

    describe('Success cases', () => {
      it('allows whitelisted user to buy tokens', async () => {
        await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
        expect(await token.balanceOf(user1.address)).to.equal(tokens(5)); // 50% immediate
      });

      it('updates total tokens sold', async () => {
        await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
        expect(await capico.totalTokensSold()).to.equal(tokens(10));
      });

      it('updates tier token count', async () => {
        await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
        const tier = await capico.tiers(0);
        expect(tier.tokensSold).to.equal(tokens(10));
      });
    });

    describe('Failure cases', () => {
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

      it('prevents purchase with incorrect payment amount', async () => {
        await expect(
          capico.connect(user1).buyTokens(tokens(10), { value: ether(9) })
        ).to.be.revertedWith('Incorrect payment');
      });
    });
  });

  describe('Distribution schedule', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 1);
    });

    it('creates correct distribution schedule', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      
      const distribution1 = await capico.distributions(user1.address, 0);
      const distribution2 = await capico.distributions(user1.address, 1);
      
      expect(distribution1.amount).to.equal(tokens(2.5)); // 25%
      expect(distribution2.amount).to.equal(tokens(2.5)); // 25%
      expect(distribution1.claimed).to.be.false;
      expect(distribution2.claimed).to.be.false;
    });

    it('schedules correct release times', async () => {
      const beforePurchase = await time.latest();
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      
      const distribution1 = await capico.distributions(user1.address, 0);
      const distribution2 = await capico.distributions(user1.address, 1);
      
      expect(distribution1.releaseTime).to.be.closeTo(
        BigNumber.from(beforePurchase).add(30 * day),
        2
      );
      
      expect(distribution2.releaseTime).to.be.closeTo(
        BigNumber.from(beforePurchase).add(60 * day),
        2
      );
    });
  });

  describe('Tier Management', () => {
    it('allows advancing to next tier after current tier ends', async () => {
      await time.increaseTo(endTime + 1);
      await capico.advanceTier();
      expect(await capico.currentTier()).to.equal(1);
    });

    it('prevents advancing tier before current ends', async () => {
      await expect(
        capico.advanceTier()
      ).to.be.revertedWith('Current tier not ended');
    });
  });

  describe('Emergency Functions', () => {
    it('allows owner to pause', async () => {
      await capico.pause();
      expect(await capico.paused()).to.be.true;
    });

    it('prevents purchases while paused', async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 1);
      await capico.pause();
      await expect(
        capico.connect(user1).buyTokens(tokens(10), { value: ether(10) })
      ).to.be.revertedWith('Pausable: paused');
    });
  });

  describe('Refunds', () => {
    beforeEach(async () => {
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 1);
    });

    it('allows refund if soft cap not met', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      await time.increaseTo(endTime + day + 1); // After all tiers end
      
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await capico.connect(user1).claimRefund();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      
      expect(balanceAfter.add(gasCost).sub(balanceBefore)).to.equal(ether(10));
    });
  });
});
