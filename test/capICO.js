  const { expect } = require('chai'); 
  const { ethers } = require('hardhat');

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');

  }

  describe('capICO', () => {
    let capico

    beforeEach(async () => {
        const capICO = await ethers.getContractFactory('capICO') // pull in contract from hardhat
        capico = await capICO.deploy() 
    })

    describe('Deployment', () => {
      it('has correct name', async () => {
     
        expect(await capico.name()).to.equal('capICO') 

        //console.log('verifying name...')
        //calling the name function (we have this funct. automatically once declared in contr.)
      })
    })
  })
