import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'

import Navigation from './Navigation';  
import Info from './Info';

 // ABI's
import TOKEN_ABI from '../abis/Token.json'
import CAPICO_ABI from '../abis/capICO.json'

// Config
import config from '../config.json';

function App() {

  const [provider, setProvider] = useState(null)
  const [capico, setCapIco] = useState(null)
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)



  const loadBlockchainData = async () => {
    // Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log(provider)
    setProvider(provider)

    // Fetch Chain ID
    const { chainId } = await provider.getNetwork()

      // Contracts
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)
    console.log(token.address)
    const capico = new ethers.Contract(config[chainId].capico.address, CAPICO_ABI, provider)
    setCapIco(capico)

      // Accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)
      

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading])

  return(
    <Container>
    <Navigation/>
      <hr />  
      {account && (
    <Info account={account} />
    )}
    </Container>
  )
}

export default App;
