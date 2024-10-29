import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'

import Navigation from './Navigation';  
import Info from './Info';
import Loading from './Loading';
import Progress from './Progress';

 // ABI's
import TOKEN_ABI from '../abis/Token.json'
import CAPICO_ABI from '../abis/capICO.json'

// Config
import config from '../config.json';

function App() {

  const [provider, setProvider] = useState(null)
  const [capico, setCapICO] = useState(null)
  const [account, setAccount] = useState(null)
  const [accountBalance, setAccountBalance] = useState(0)

  const [price, setPrice] = useState(0)
  const [maxTokens, setMaxTokens] = useState(0)
  const [tokensSold, setTokensSold] = useState(0)

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
    setCapICO(capico)

      // Accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Account balance
    const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)    
    setAccountBalance(accountBalance)

    // Price
    const price = ethers.utils.formatUnits(await capico.price(), 18)
    setPrice(price)

    // Max Tokens
    const maxTokens = ethers.utils.formatUnits(await capico.maxTokens(), 18)
    setMaxTokens(maxTokens)

    // Tokens Sold
    const tokensSold = ethers.utils.formatUnits(await capico.tokensSold(), 18)
    setTokensSold(tokensSold)

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

    <h1 className='my-4 text-center'>Introducing CKOIN</h1>

    {isLoading ? (
        <loading />
        ) : (
        <>
        <p className='text-center'><strong>Current Price:</strong> {price} ETH</p>
        <Progress maxTokens={maxTokens} tokensSold={tokensSold} />
        </>
      )}
    
      <hr />  
      {account && (
    <Info account={account} accountBalance={accountBalance} />
    )}
    </Container>
  )
}

export default App;























