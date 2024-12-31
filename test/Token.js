const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
const MAX_TRANSFER = tokens('100000');
const DAY = 24 * 60 * 60;
const MINUTE = 60;

describe('Token', () => {
  let token, deployer, user1, user2;
  const initialSupply = '1000000';

  beforeEach(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy('ICO Token', 'ICO', initialSupply);
  });

  describe('Deployment', () => {
    it('sets correct token parameters', async () => {
      expect(await token.name()).to.equal('ICO Token');
      expect(await token.symbol()).to.equal('ICO');
      expect(await token.totalSupply()).to.equal(tokens(initialSupply));
      expect(await token.MAX_SUPPLY()).to.equal(tokens('1000000000'));
      expect(await token.launchTime()).to.be.gt(0);
      expect(await token.TRANSFER_COOLDOWN()).to.equal(DAY);
      expect(await token.DEMO_TRANSFER_COOLDOWN()).to.equal(2 * MINUTE);
      expect(await token.isDemoMode()).to.be.true;
      expect(await token.exemptAccounts(deployer.address)).to.be.true;
    });
  });

  describe('Transfer Restrictions', () => {
    beforeEach(async () => {
      await token.mint(user1.address, tokens('200000'));
    });

    it('enforces max transfer limit', async () => {
      await expect(
        token.connect(user1).transfer(user2.address, tokens('100001'))
      ).to.be.revertedWith('Transfer amount too large');
      
      await token.connect(user1).transfer(user2.address, tokens('100000'));
      expect(await token.balanceOf(user2.address)).to.equal(tokens('100000'));
    });

    it('enforces demo mode transfer cooldown', async () => {
      await token.connect(user1).transfer(user2.address, tokens('1000'));
      await expect(
        token.connect(user1).transfer(user2.address, tokens('1000'))
      ).to.be.revertedWith('Transfer cooldown active');

      await time.increase(2 * MINUTE + 1);
      await token.connect(user1).transfer(user2.address, tokens('1000'));
    });

    it('enforces normal mode transfer cooldown', async () => {
      await token.toggleDemoMode();
      await token.connect(user1).transfer(user2.address, tokens('1000'));
      await expect(
        token.connect(user1).transfer(user2.address, tokens('1000'))
      ).to.be.revertedWith('Transfer cooldown active');

      await time.increase(DAY + 1);
      await token.connect(user1).transfer(user2.address, tokens('1000'));
    });

    it('allows exempt accounts to bypass restrictions', async () => {
      // Set user1 as exempt
      await token.setExemptAccount(user1.address, true);
      
      // Now user1 should be able to make two transfers in succession
      await token.connect(user1).transfer(user2.address, tokens('100000'));
      await token.connect(user1).transfer(user2.address, tokens('50000')); // No cooldown needed
      
      expect(await token.balanceOf(user2.address)).to.equal(tokens('150000'));
    });
});

  describe('Admin Functions', () => {
    it('allows owner to update transfer cooldown', async () => {
      const newCooldown = 2 * DAY;
      await token.setTransferCooldown(newCooldown);
      expect(await token.TRANSFER_COOLDOWN()).to.equal(newCooldown);
    });

    it('allows owner to update demo transfer cooldown', async () => {
      const newCooldown = 5 * MINUTE;
      await token.setDemoTransferCooldown(newCooldown);
      expect(await token.DEMO_TRANSFER_COOLDOWN()).to.equal(newCooldown);
    });

    it('allows owner to update max transfer amount', async () => {
      const newLimit = tokens('200000');
      await token.setMaxTransferAmount(newLimit);
      expect(await token.MAX_TRANSFER_AMOUNT()).to.equal(newLimit);
    });

    it('allows owner to toggle demo mode', async () => {
      expect(await token.isDemoMode()).to.be.true;
      await token.toggleDemoMode();
      expect(await token.isDemoMode()).to.be.false;
    });

    it('allows owner to set exempt accounts', async () => {
      await token.setExemptAccount(user1.address, true);
      expect(await token.exemptAccounts(user1.address)).to.be.true;
      
      await token.setExemptAccount(user1.address, false);
      expect(await token.exemptAccounts(user1.address)).to.be.false;
    });

    it('prevents non-owner from calling admin functions', async () => {
      await expect(
        token.connect(user1).setTransferCooldown(DAY)
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await expect(
        token.connect(user1).setDemoTransferCooldown(MINUTE)
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await expect(
        token.connect(user1).setMaxTransferAmount(tokens('1000'))
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await expect(
        token.connect(user1).toggleDemoMode()
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await expect(
        token.connect(user1).setExemptAccount(user2.address, true)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Events', () => {
    it('emits correct events for admin functions', async () => {
      await expect(token.setTransferCooldown(2 * DAY))
        .to.emit(token, 'CooldownUpdated')
        .withArgs(2 * DAY);

      await expect(token.setDemoTransferCooldown(5 * MINUTE))
        .to.emit(token, 'CooldownUpdated')
        .withArgs(5 * MINUTE);

      await expect(token.setMaxTransferAmount(tokens('200000')))
        .to.emit(token, 'TransferLimitUpdated')
        .withArgs(tokens('200000'));

      await expect(token.toggleDemoMode())
        .to.emit(token, 'DemoModeToggled')
        .withArgs(false);

      await expect(token.setExemptAccount(user1.address, true))
        .to.emit(token, 'ExemptAccountSet')
        .withArgs(user1.address, true);
    });
  });

  // Keep existing tests for standard ERC20 functionality
  describe('ERC20 Standard', () => {
    beforeEach(async () => {
      await token.transfer(user1.address, tokens('10000'));
    });

    it('handles allowances correctly', async () => {
      await token.connect(user1).approve(user2.address, tokens('5000'));
      expect(await token.allowance(user1.address, user2.address)).to.equal(tokens('5000'));

      await token.connect(user2).transferFrom(user1.address, user2.address, tokens('3000'));
      expect(await token.balanceOf(user2.address)).to.equal(tokens('3000'));
      expect(await token.allowance(user1.address, user2.address)).to.equal(tokens('2000'));
    });
  });

  // Keep existing tests for minting and burning
  describe('Minting and Burning', () => {
    it('allows owner to mint tokens within max supply', async () => {
      await token.mint(user1.address, tokens('1000'));
      expect(await token.balanceOf(user1.address)).to.equal(tokens('1000'));
    });

    it('prevents minting above max supply', async () => {
      await expect(
        token.mint(user1.address, tokens('999000001'))
      ).to.be.revertedWith('Exceeds max supply');
    });

    it('allows users to burn their tokens', async () => {
      await token.transfer(user1.address, tokens('10000'));
      await token.connect(user1).burn(tokens('5000'));
      expect(await token.balanceOf(user1.address)).to.equal(tokens('5000'));
      expect(await token.totalSupply()).to.equal(tokens(initialSupply).sub(tokens('5000')));
    });
  });
});