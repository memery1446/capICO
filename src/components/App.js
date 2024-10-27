import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'

import Navigation from './Navigation';  
import Info from './Info';

// ABI's
import TOKEN_ABI from '../abis/Token.json'
import CAPICO_ABI from '../abis/capICO.json'

function App() {

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log(provider)
    setProvider(provider)

      // Contracts
    const token = ethers.Contract('0x...aa3', TOKEN_ABI, provider)
    console.log(token)
    
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
  });

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
