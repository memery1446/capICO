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

  // Main setup that runs before all tests
  beforeEach(async function() {
    [deployer, user1, user2] = await ethers.getSigners();

    const latestTime = await time.latest();
    startTime = latestTime + 1000;
    endTime = startTime + (7 * day);

    // Deploy Token
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Test Token', 'TEST', '1000000')
    await token.deployed();

    // Deploy CapICO
    const CapICO = await ethers.getContractFactory('CapICO')
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

  describe('Refunds', () => {
    beforeEach(async () => {
      // Re-get contracts to ensure fresh state
      const capicoInstance = await ethers.getContractFactory('CapICO')
      capico = await capicoInstance.deploy(
        token.address,
        ether(1),
        ether(50),
        ether(200),
        ether(0.1),
        ether(100),
        startTime,
        endTime
      );
      await capico.deployed();
      await token.transfer(capico.address, tokens(10000));
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

    it('prevents refund if soft cap met', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await time.increaseTo(endTime + 1);
      await expect(
        capico.connect(user1).claimRefund()
      ).to.be.revertedWith('Soft cap reached');
    });
  });

  describe('Finalization', () => {
    beforeEach(async () => {
      // Re-get contracts to ensure fresh state
      const capicoInstance = await ethers.getContractFactory('CapICO')
      capico = await capicoInstance.deploy(
        token.address,
        ether(1),
        ether(50),
        ether(200),
        ether(0.1),
        ether(100),
        startTime,
        endTime
      );
      await capico.deployed();
      await token.transfer(capico.address, tokens(10000));
      await capico.updateWhitelist([user1.address], true);
      await time.increaseTo(startTime + 10);
    });

    it('allows finalization after end time if soft cap met', async () => {
      await capico.connect(user1).buyTokens(tokens(50), { value: ether(50) });
      await time.increaseTo(endTime + 1);
      await capico.finalize();
      expect(await capico.isFinalized()).to.be.true;
    });

    it('prevents finalization if soft cap not met', async () => {
      await time.increaseTo(endTime + 1);
      await expect(
        capico.finalize()
      ).to.be.revertedWith('Soft cap not reached');
    });
  });


  // More advanced testing 

  describe('ICO Timing and Status', () => {
  beforeEach(async () => {
    // Re-deploy for clean state
    const capicoInstance = await ethers.getContractFactory('CapICO')
    capico = await capicoInstance.deploy(
      token.address,
      ether(1),
      ether(50),
      ether(200),
      ether(0.1),
      ether(100),
      startTime,
      endTime
    );
    await capico.deployed();
  });

  it('returns correct ICO status before start', async () => {
    const status = await capico.getICOStatus();
    expect(status.isActive).to.be.false;
    expect(status.hasStarted).to.be.false;
    expect(status.hasEnded).to.be.false;
  });

  it('returns correct ICO status during active period', async () => {
    await time.increaseTo(startTime + 10);
    const status = await capico.getICOStatus();
    expect(status.isActive).to.be.true;
    expect(status.hasStarted).to.be.true;
    expect(status.hasEnded).to.be.false;
  });

  it('returns correct ICO status after end', async () => {
    await time.increaseTo(endTime + 1);
    const status = await capico.getICOStatus();
    expect(status.isActive).to.be.false;
    expect(status.hasStarted).to.be.true;
    expect(status.hasEnded).to.be.true;
  });
});

describe('Distribution Schedule', () => {
  beforeEach(async () => {
    const capicoInstance = await ethers.getContractFactory('CapICO')
    capico = await capicoInstance.deploy(
      token.address,
      ether(1),
      ether(50),
      ether(200),
      ether(0.1),
      ether(100),
      startTime,
      endTime
    );
    await capico.deployed();
    await token.transfer(capico.address, tokens(10000));
    await capico.updateWhitelist([user1.address], true);
    await time.increaseTo(startTime + 10);
  });

  it('schedules correct distribution amounts', async () => {
    await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
    
    const dist0 = await capico.distributions(user1.address, 0);
    const dist1 = await capico.distributions(user1.address, 1);
    
    expect(dist0.amount).to.equal(tokens(2.5)); // 25% of 10 tokens
    expect(dist1.amount).to.equal(tokens(2.5)); // 25% of 10 tokens
  });

  it('schedules correct release times', async () => {
    await capico.connect(user1).buyTokens(tokens(10), { value: ether(10) });
    const purchaseTime = await time.latest();
    
    const dist0 = await capico.distributions(user1.address, 0);
    const dist1 = await capico.distributions(user1.address, 1);
    
    expect(dist0.releaseTime).to.equal(purchaseTime + (30 * day));
    expect(dist1.releaseTime).to.equal(purchaseTime + (60 * day));
  });
});

describe('Emergency Functions', () => {
  beforeEach(async () => {
    const capicoInstance = await ethers.getContractFactory('CapICO')
    capico = await capicoInstance.deploy(
      token.address,
      ether(1),
      ether(50),
      ether(200),
      ether(0.1),
      ether(100),
      startTime,
      endTime
    );
    await capico.deployed();
    await token.transfer(capico.address, tokens(10000));
    await capico.updateWhitelist([user1.address], true);
  });

  it('allows owner to pause and unpause', async () => {
    await capico.pause();
    expect(await capico.paused()).to.be.true;
    
    await capico.unpause();
    expect(await capico.paused()).to.be.false;
  });

  it('prevents non-owner from pausing', async () => {
    await expect(
      capico.connect(user1).pause()
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('prevents purchases while paused', async () => {
    await time.increaseTo(startTime + 10);
    await capico.pause();
    
    await expect(
      capico.connect(user1).buyTokens(tokens(10), { value: ether(10) })
    ).to.be.revertedWith('Pausable: paused');
  });
});

describe('Ownership and Access Control', () => {
  beforeEach(async () => {
    const capicoInstance = await ethers.getContractFactory('CapICO')
    capico = await capicoInstance.deploy(
      token.address,
      ether(1),
      ether(50),
      ether(200),
      ether(0.1),
      ether(100),
      startTime,
      endTime
    );
    await capico.deployed();
  });

  it('sets correct owner on deployment', async () => {
    expect(await capico.owner()).to.equal(deployer.address);
  });

  it('allows owner to update whitelist', async () => {
    await capico.updateWhitelist([user1.address, user2.address], true);
    expect(await capico.whitelist(user1.address)).to.be.true;
    expect(await capico.whitelist(user2.address)).to.be.true;
  });

  it('prevents non-owner from updating whitelist', async () => {
    await expect(
      capico.connect(user1).updateWhitelist([user2.address], true)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
});

