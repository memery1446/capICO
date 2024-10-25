  const { expect } = require('chai'); 
  const { ethers } = require('hardhat');

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');


  }
  const ether = tokens

  describe('capICO', () => {
    let capico, token
    let accounts, deployer, user1

    beforeEach(async () => {
        const capICO = await ethers.getContractFactory('capICO') // pull in contract from hardhat
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
      // it('has correct name', async () => {
     
      //   expect(await capico.name()).to.equal('capICO') 

      //   //console.log('verifying name...')
      //   //calling the name function (we have this funct. automatically once declared in contr.)
      // })
    it('sends tokens to the capICO contract', async () => {
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
      it('updates the contracts ether balance', async () => {
        expect(await ethers.provider.getBalance(capico.address)).to.equal(amount)
      })

      it('updates the number of tokens sold', async () => {
        expect(await capico.tokensSold()).to.equal(amount)
      })

      it('emits a buy event', async () => {
        //console.log(result)

        await expect(transaction).to.emit(capico, 'Buy').withArgs(amount, user1.address)
      })

    })

  describe('Failure', () => {
      it('rejects insufficient ETH', async () => {
        await expect(capico.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted
      })

      it('rejects purchases over the maxSupply', async () => {
        await expect(capico.connect(user1).buyTokens(tokens(1200000), {value: 1200000 })).to.be.reverted
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

      it('updates contract eth balance', async () => {
        expect(await ethers.provider.getBalance(capico.address)).to.equal(amount)
      })

      it('updates the user token balance', async () => {
        expect(await token.balanceOf(user1.address)).to.equal(amount)
      })

      // it('confirms the owner is the deployer', async () => {
      //   expect(await deployer.getAddress()).to.equal(msg.sender)
      // })
    })
  })

  describe('Finalizing the sale', () => {
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
    })

    describe('Failure', () => {

    })
})

  })





