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

    capico = await capICO.deploy(token.address, ether(1))

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

    })
    })
  })





