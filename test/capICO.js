const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('capICO', () => {
  let token, capico
  let deployer, user1

  beforeEach(async () => {
    const capICO = await ethers.getContractFactory('capICO')
    const Token = await ethers.getContractFactory('Token')

    token = await Token.deploy('CKOIN Token', 'CKOIN', '1000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    user1 = accounts[1]

    capico = await capICO.deploy(token.address, ether(1), '1000000')

    let transaction = await token.connect(deployer).transfer(capico.address, tokens(1000000))
    await transaction.wait()
  })

  describe('Deployment', () => {

    it('sends tokens to the Crowdsale contract', async () => {
      expect(await token.balanceOf(capico.address)).to.equal(tokens(1000000))
    })

    it('returns the price', async () => {
      expect(await capico.price()).to.equal(ether(1))
    })

    it('returns token address', async () => {
      expect(await capico.token()).to.equal(token.address)
    })

  })

  describe('Buying Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await capico.connect(user1).buyTokens(amount, { value: ether(10) })
        result = await transaction.wait()
      })

      it('transfers tokens', async () => {
        expect(await token.balanceOf(capico.address)).to.equal(tokens(999990))
        expect(await token.balanceOf(user1.address)).to.equal(amount)
      })

      it('updates tokensSold', async () => {
        expect(await capico.tokensSold()).to.equal(amount)
      })

      it('emits a buy event', async () => {
        // --> https://hardhat.org/hardhat-chai-matchers/docs/reference#.emit
        await expect(transaction).to.emit(capico, "Buy")
          .withArgs(amount, user1.address)
      })

    })

    describe('Failure', () => {

      it('rejects insufficent ETH', async () => {
        await expect(capico.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted
      })

    })

  })

  describe('Sending ETH', () => {
    let transaction, result
    let amount = ether(10)

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await user1.sendTransaction({ to: capico.address, value: amount })
        result = await transaction.wait()
      })

      it('updates contracts ether balance', async () => {
        expect(await ethers.provider.getBalance(capico.address)).to.equal(amount)
      })

      it('updates user token balance', async () => {
        expect(await token.balanceOf(user1.address)).to.equal(amount)
      })

    })
  })

  describe('Updating Price', () => {
    let transaction, result
    let price = ether(2)

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await capico.connect(deployer).setPrice(ether(2))
        result = await transaction.wait()
      })

      it('updates the price', async () => {
        expect(await capico.price()).to.equal(ether(2))
      })

    })

    describe('Failure', () => {

      it('prevents non-owner from updating price', async () => {
        await expect(capico.connect(user1).setPrice(price)).to.be.reverted
      })

    })
  })

  describe('Finalzing Sale', () => {
    let transaction, result
    let amount = tokens(10)
    let value = ether(10)

    describe('Success', async () => {

      beforeEach(async () => {
        transaction = await capico.connect(user1).buyTokens(amount, { value: value })
        result = await transaction.wait()

        transaction = await capico.connect(deployer).finalize()
        result = await transaction.wait()
      })

      it('transfers remaining tokens to owner', async () => {
        expect(await token.balanceOf(capico.address)).to.equal(0)
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990))
      })

      it('transfers ETH balance to owner', async () => {
        expect(await ethers.provider.getBalance(capico.address)).to.equal(0)
      })

      it('emits Finalize event', async () => {
        // --> https://hardhat.org/hardhat-chai-matchers/docs/reference#.emit
        await expect(transaction).to.emit(capico, "Finalize")
          .withArgs(amount, value)
      })

    })

    describe('Failure', () => {

      it('prevents non-owner from finalizing', async () => {
        await expect(capico.connect(user1).finalize()).to.be.reverted
      })

    })
  })
})
