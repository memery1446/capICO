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

      beforeEach(async () => {
        // Get signers
        [deployer, user1, user2] = await ethers.getSigners();

        // Deploy Token
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Test Token', 'TEST', '1000000')

        // Deploy CapICO
        const CapICO = await ethers.getContractFactory('CapICO')
        capico = await CapICO.deploy(
          token.address,
          ether(100),  // softCap
          ether(0.1),  // minInvestment
          ether(50)    // maxInvestment - increased to allow larger test purchases
        )

        // Transfer tokens to CapICO contract
        await token.transfer(capico.address, tokens(1000000))

        // Get current block timestamp
        const latestTime = await time.latest();
        startTime = latestTime + 100;
        endTime = startTime + day;
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
      });

    describe('Token Purchase', () => {
      beforeEach(async () => {
        await capico.addTier(
          ether(1),           // price
          tokens(1000),       // maxTokens
          startTime,          // startTime
          endTime            // endTime
        );
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

    describe('Distribution schedule', () => {
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
  });

  describe('Refunds', () => {
    beforeEach(async () => {
      await capico.addTier(
        ether(1),           // price
        tokens(1000),       // maxTokens
        startTime,          // startTime
        endTime            // endTime
      );
      await capico.updateWhitelist([user1.address, user2.address], true);
      await time.increaseTo(startTime + 1);
    });

    describe('Success cases', () => {
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
    });

    describe('Failure cases', () => {
      it('prevents refund before ICO ends', async () => {
        await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
        await expect(
          capico.connect(user1).claimRefund()
        ).to.be.revertedWith('ICO not ended');
      });

      it('prevents refund if soft cap met', async () => {
        // Buy enough tokens to meet soft cap
        await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
        await capico.connect(user2).buyTokens(tokens(50), { value: ether(50) });
        
        await time.increaseTo(endTime + 1);
        
        await expect(
          capico.connect(user1).claimRefund()
        ).to.be.revertedWith('Soft cap reached');
      });

      it('prevents refund for non-investors', async () => {
        await time.increaseTo(endTime + 1);
        await expect(
          capico.connect(user2).claimRefund()
        ).to.be.revertedWith('No investment');
      });
    });
  });

  describe('Emergency Functions', () => {
    beforeEach(async () => {
      await capico.addTier(
        ether(1),
        tokens(1000),
        startTime,
        endTime
      );
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 1);
    });

    it('allows owner to pause', async () => {
      await capico.pause();
      expect(await capico.paused()).to.be.true;
    });

    it('prevents purchases while paused', async () => {
      await capico.pause();
      await expect(
        capico.connect(user1).buyTokens(tokens(10), { value: ether(10) })
      ).to.be.revertedWith('Pausable: paused');
    });
  });

  describe('Finalization', () => {
    beforeEach(async () => {
      await capico.addTier(
        ether(1),
        tokens(1000),
        startTime,
        endTime
      );
      await capico.updateWhitelist([user1.address, user2.address], true);
      await time.increaseTo(startTime + 1);
    });

    it('allows finalization after end time if soft cap met', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await capico.connect(user2).buyTokens(tokens(50), { value: ether(50) });
      await time.increaseTo(endTime + 1);
      await capico.finalize();
      expect(await capico.isFinalized()).to.be.true;
    });

    it('prevents finalization if soft cap not met', async () => {
      await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
      await time.increaseTo(endTime + 1);
      await expect(
        capico.finalize()
      ).to.be.revertedWith('Soft cap not reached');
    });
  });

  describe('Token Distribution', () => {
  beforeEach(async () => {
    await capico.addTier(
      ether(1),
      tokens(1000),
      startTime,
      endTime
    );
    await capico.updateWhitelist([user1.address], true);
    await time.increaseTo(startTime + 1);
  });

  it('allows claiming distribution after release time', async () => {
    await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
    await time.increase(30 * day + 1);
    
    await capico.connect(user1).claimDistribution(0);
    expect(await token.balanceOf(user1.address)).to.equal(tokens(7.5)); // Initial 50% + first 25%
  });

  it('prevents claiming distribution before release time', async () => {
    await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
    await expect(
      capico.connect(user1).claimDistribution(0)
    ).to.be.revertedWith('Too early');
  });

  it('prevents claiming distribution twice', async () => {
    await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
    await time.increase(30 * day + 1);
    await capico.connect(user1).claimDistribution(0);
    await expect(
      capico.connect(user1).claimDistribution(0)
    ).to.be.revertedWith('Already claimed');
  });
});

describe('Tier Management', () => {
  it('prevents adding tier with invalid times', async () => {
    await expect(
      capico.addTier(ether(1), tokens(1000), endTime, startTime)
    ).to.be.revertedWith('Invalid end time');
  });

  it('prevents adding overlapping tiers', async () => {
    const futureStart = (await time.latest()) + day;
    await capico.addTier(ether(1), tokens(1000), futureStart, futureStart + day);
    await expect(
      capico.addTier(ether(1), tokens(1000), futureStart - 1, futureStart + day + 1)
    ).to.be.revertedWith('Overlapping tiers');
  });

  it('prevents advancing tier before current ends', async () => {
    await capico.addTier(ether(1), tokens(1000), startTime, endTime);
    await capico.addTier(ether(2), tokens(1000), endTime + 1, endTime + day);
    await expect(
      capico.advanceTier()
    ).to.be.revertedWith('Current tier not ended');
  });
});

describe('Receive Function', () => {
  beforeEach(async () => {
    await capico.addTier(ether(1), tokens(1000), startTime, endTime);
    await capico.updateWhitelist([user1.address], true);
    await time.increaseTo(startTime + 1);
  });

  it('handles direct ETH transfers correctly', async () => {
    await user1.sendTransaction({
      to: capico.address,
      value: ether(10)
    });
    
    expect(await token.balanceOf(user1.address)).to.equal(tokens(5)); // 50% immediate
    expect(await capico.totalTokensSold()).to.equal(tokens(10));
  });
});
});
