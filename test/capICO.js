  const { expect } = require('chai'); 
  const { ethers } = require('hardhat');

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');

  }

  describe('capICO', () => {


    describe('Deployment', () => {
      it('has correct name', async () => {
        const capICO = await ethers.getContractFactory('capICO') // pull in contract from hardhat
        let capico = await capICO.deploy() //we deploy it an assign it to a lower case variable
        expect(await capico.name()).to.equal('capICO') 

        console.log('retreiving address...')
        //calling the name function (we have this funct. automatically once declared in contr.)
      })
    })
  })
