  const { expect } = require('chai'); 
  const { ethers } = require('hardhat');

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');

  }

  describe('capICO', () => {
    let capico, token
    let accounts, deployer, user1

    beforeEach(async () => {
        const capICO = await ethers.getContractFactory('capICO') // pull in contract from hardhat
        const Token = await ethers.getContractFactory('Token')
        
        token = await Token.deploy('CKOIN Token', 'CKOIN', '1000000')
        capico = await capICO.deploy(token.address) 

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]
    })

  describe('Deployment', () => {
      // it('has correct name', async () => {
     
      //   expect(await capico.name()).to.equal('capICO') 

      //   //console.log('verifying name...')
      //   //calling the name function (we have this funct. automatically once declared in contr.)
      // })

    it('returns token address', async () => {
      expect(await capico.token()).to.equal(token.address)
    })

    })

  describe('Buying Tokens', () => {
    it('transfers tokens', async () => {

    })
    })
  })
