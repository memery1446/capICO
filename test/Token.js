const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
const MAX_TRANSFER = tokens('100000');
const DAY = 24 * 60 * 60;

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
    });
  });

  describe('Transfer Restrictions', () => {
    beforeEach(async () => {
      await token.transfer(user1.address, tokens('200000'));
    });

    it('enforces max transfer limit', async () => {
      await expect(
        token.connect(user1).transfer(user2.address, tokens('100001'))
      ).to.be.revertedWith('Transfer amount too large');
      
      await token.connect(user1).transfer(user2.address, tokens('100000'));
      expect(await token.balanceOf(user2.address)).to.equal(tokens('100000'));
    });

    it('enforces transfer cooldown', async () => {
      await token.connect(user1).transfer(user2.address, tokens('1000'));
      await expect(
        token.connect(user1).transfer(user2.address, tokens('1000'))
      ).to.be.revertedWith('Transfer cooldown active');

      await time.increase(DAY + 1);
      await token.connect(user1).transfer(user2.address, tokens('1000'));
    });

    it('allows owner to bypass restrictions', async () => {
      await token.transfer(user2.address, tokens('200000'));
      await token.transfer(user1.address, tokens('200000'));
    });
  });

  describe('Minting', () => {
    it('allows owner to mint tokens within max supply', async () => {
      await token.mint(user1.address, tokens('1000'));
      expect(await token.balanceOf(user1.address)).to.equal(tokens('1000'));
    });

    it('prevents minting above max supply', async () => {
      await expect(
        token.mint(user1.address, tokens('999000001'))
      ).to.be.revertedWith('Exceeds max supply');
    });

    it('prevents non-owner from minting', async () => {
      await expect(
        token.connect(user1).mint(user1.address, tokens('1000'))
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Burning', () => {
    beforeEach(async () => {
      await token.transfer(user1.address, tokens('10000'));
    });

    it('allows users to burn their tokens', async () => {
      await token.connect(user1).burn(tokens('5000'));
      expect(await token.balanceOf(user1.address)).to.equal(tokens('5000'));
      expect(await token.totalSupply()).to.equal(tokens(initialSupply).sub(tokens('5000')));
    });

    it('prevents burning more than balance', async () => {
      await expect(
        token.connect(user1).burn(tokens('20000'))
      ).to.be.reverted;
    });
  });

  describe('Pausable', () => {
    it('allows owner to pause/unpause', async () => {
    await token.pause();
    expect(await token.paused()).to.be.true;

    await expect(
      token.transfer(user1.address, tokens('1000'))
    ).to.be.revertedWith('ERC20Pausable: token transfer while paused');

    await token.unpause();
    await token.transfer(user1.address, tokens('1000'));
  });

    it('prevents non-owner from pausing', async () => {
      await expect(
        token.connect(user1).pause()
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

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

  describe('Transfer Restrictions - Additional Cases', () => {
  beforeEach(async () => {
    await token.transfer(user1.address, tokens('200000'));
  });

  it('handles consecutive transfers after cooldown correctly', async () => {
    await token.connect(user1).transfer(user2.address, tokens('1000'));
    await time.increase(DAY + 1);
    await token.connect(user1).transfer(user2.address, tokens('2000'));
    await time.increase(DAY + 1);
    await token.connect(user1).transfer(user2.address, tokens('3000'));
    
    expect(await token.balanceOf(user2.address)).to.equal(tokens('6000'));
  });

  it('enforces cooldown per address independently', async () => {
    await token.transfer(user2.address, tokens('50000'));
    
    await token.connect(user1).transfer(user2.address, tokens('1000'));
    await token.connect(user2).transfer(user1.address, tokens('1000')); // Should work immediately
    
    await expect(
      token.connect(user1).transfer(user2.address, tokens('1000'))
    ).to.be.revertedWith('Transfer cooldown active');
  });

  it('tracks lastTransferTime correctly', async () => {
    const tx = await token.connect(user1).transfer(user2.address, tokens('1000'));
    const block = await ethers.provider.getBlock(tx.blockNumber);
    
    expect(await token.lastTransferTime(user1.address)).to.equal(block.timestamp);
  });
});

describe('Edge Cases', () => {
  it('handles zero transfers', async () => {
    await expect(
      token.transfer(user1.address, 0)
    ).to.not.be.reverted;
  });

  it('prevents transfers to zero address', async () => {
    await expect(
      token.transfer(ethers.constants.AddressZero, tokens('1000'))
    ).to.be.reverted;
  });

  it('enforces max supply across multiple mints', async () => {
    const remainingSupply = (await token.MAX_SUPPLY()).sub(await token.totalSupply());
    await token.mint(user1.address, remainingSupply.sub(tokens('1000')));
    await token.mint(user1.address, tokens('900'));
    
    await expect(
      token.mint(user1.address, tokens('101'))
    ).to.be.revertedWith('Exceeds max supply');
  });
});

describe('Pausable Functionality', () => {
  it('prevents burning while paused', async () => {
    await token.transfer(user1.address, tokens('1000'));
    await token.pause();
    
    await expect(
      token.connect(user1).burn(tokens('500'))
    ).to.be.revertedWith('ERC20Pausable: token transfer while paused');
  });

  it('maintains pause state through transfers', async () => {
    await token.transfer(user1.address, tokens('1000'));
    await token.pause();
    await token.unpause();
    await token.connect(user1).transfer(user2.address, tokens('500')); // Should work
    await token.pause();
    
    await expect(
      token.connect(user1).transfer(user2.address, tokens('100'))
    ).to.be.revertedWith('ERC20Pausable: token transfer while paused');
  });
});
});
