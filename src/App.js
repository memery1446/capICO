import React, { useEffect, useState, useCallback } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import { store } from "./store/store"
import { ethers } from "ethers"
import { ICO_ADDRESS } from "./contracts/addresses"
import CapICO from "./contracts/CapICO.json"
import ICOToken from "./contracts/ICOToken.json"
import { createEthersService } from "./EthersServiceProvider"
import { updateICOInfo, setCurrentTokenPrice } from "./store/icoSlice"
import { setGlobalError } from "./store/errorSlice"
import { withEthers } from "./withEthers"

// Component imports
import ICOStatus from "./components/ICOStatus"
import WhitelistStatus from "./components/WhitelistStatus"
import BuyTokens from "./components/BuyTokens"
import TokenVestingDashboard from "./components/TokenVestingDashboard"
import ReferralSystem from "./components/ReferralSystem"
import TierInfo from "./components/TierInfo"
import TransactionHistory from "./components/TransactionHistory"
import OwnerActions from "./components/OwnerActions"
import UserStatus from "./components/UserStatus"
import WalletConnection from "./components/WalletConnection"
import GlobalError from "./components/GlobalError"
import LandingPage from "./components/LandingPage"

function AppContent() {
  const [isOwner, setIsOwner] = useState(false)
  const [ethService, setEthService] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDApp, setShowDApp] = useState(false)
  const dispatch = useDispatch()
  const isWalletConnected = useSelector((state) => state.referral.isWalletConnected)
  const tokenPrice = useSelector((state) => state.ico.tokenPrice)
  const currentTokenPrice = useSelector((state) => state.ico.currentTokenPrice)

  const initializeWeb3 = useCallback(
    async (requestAccounts = false) => {
      if (typeof window.ethereum !== "undefined") {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
          if (requestAccounts) {
            await web3Provider.send("eth_requestAccounts", [])
          }
          const service = await createEthersService(web3Provider)
          setEthService(service)
          setIsLoading(false)
        } catch (error) {
          console.error("Error initializing contract:", error)
          dispatch(setGlobalError("Failed to initialize Web3. Please check your wallet connection."))
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
        if (requestAccounts) {
          dispatch(setGlobalError("Web3 not detected. Please install MetaMask or another Web3 wallet."))
        }
      }
    },
    [dispatch],
  )

  useEffect(() => {
    initializeWeb3(false)

    const handleAccountsChanged = () => initializeWeb3(true)
    const handleChainChanged = () => initializeWeb3(true)

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [initializeWeb3])

  const getTiers = useCallback(async () => {
    if (ethService && ethService.icoContract) {
      try {
        const tierCount = await ethService.icoContract.getTierCount()
        const tiers = []
        for (let i = 0; i < tierCount.toNumber(); i++) {
          const tier = await ethService.icoContract.getTier(i)
          tiers.push({
            minPurchase: ethers.utils.formatEther(tier[0]),
            maxPurchase: ethers.utils.formatEther(tier[1]),
            discount: tier[2].toString(),
          })
        }
        dispatch(updateICOInfo({ tiers }))
        return tiers
      } catch (error) {
        console.error("Error fetching tiers:", error)
        dispatch(setGlobalError("Failed to fetch tier information. Please try again later."))
        return []
      }
    }
    return []
  }, [ethService, dispatch])

  const getEthersService = useCallback(() => {
    if (ethService && ethService.provider && ethService.icoContract) {
      return {
        provider: ethService.provider,
        icoContract: ethService.icoContract,
        getNetwork: async () => {
          try {
            return await ethService.provider.getNetwork()
          } catch (error) {
            console.error("Error getting network:", error)
            throw error
          }
        },
        getReferralBonus: async () => {
          try {
            const signer = ethService.provider.getSigner()
            const address = await signer.getAddress()
            const bonus = await ethService.icoContract.referralBonuses(address)
            return ethers.utils.formatEther(bonus)
          } catch (error) {
            console.error("Error getting referral bonus:", error)
            throw error
          }
        },
        getCurrentReferrer: async () => {
          try {
            const signer = ethService.provider.getSigner()
            const address = await signer.getAddress()
            return ethService.icoContract.referrers(address)
          } catch (error) {
            console.error("Error getting current referrer:", error)
            throw error
          }
        },
        setReferrer: async (referrer) => {
          try {
            const tx = await ethService.icoContract.setReferrer(referrer)
            await tx.wait()
          } catch (error) {
            console.error("Error setting referrer:", error)
            throw error
          }
        },
        buyTokens: ethService.buyTokens,
      }
    }
    return null
  }, [ethService])

  const updateTokenPrice = useCallback(async () => {
    if (ethService && ethService.icoContract && isWalletConnected) {
      try {
        const signer = ethService.provider.getSigner()
        await signer.getAddress() // This will throw if no account is connected
        const currentPrice = await ethService.icoContract.getCurrentTokenPrice()
        dispatch(setCurrentTokenPrice(ethers.utils.formatEther(currentPrice)))
      } catch (error) {
        console.error("Error updating token price:", error)
        
      }
    }
  }, [ethService, isWalletConnected, dispatch])

  useEffect(() => {
    const checkOwnership = async () => {
      if (ethService && ethService.icoContract && isWalletConnected) {
        try {
          const ownerAddress = await ethService.icoContract.owner()
          const signerAddress = await ethService.getSignerAddress()
          setIsOwner(ownerAddress.toLowerCase() === signerAddress.toLowerCase())
        } catch (error) {
          console.error("Error checking ownership:", error)
          // Only show error if wallet is connected
          if (isWalletConnected) {
            dispatch(setGlobalError("Failed to check ownership status. Please try again later."))
          }
        }
      }
    }

    checkOwnership()
    if (isWalletConnected) {
      updateTokenPrice()
    }
  }, [ethService, dispatch, isWalletConnected, updateTokenPrice])

  useEffect(() => {
    let interval
    if (isWalletConnected) {
      interval = setInterval(() => {
        updateTokenPrice()
      }, 30000) // Update every 30 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isWalletConnected, updateTokenPrice])

  useEffect(() => {
    let interval
    if (isWalletConnected) {
      interval = setInterval(() => {
        updateTokenPrice()
      }, 30000) // Update every 30 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isWalletConnected, updateTokenPrice])

  useEffect(() => {
    if (isWalletConnected) {
      dispatch({ type: "START_POLLING" })
    }
  }, [isWalletConnected, dispatch])

  useEffect(() => {
    console.log("Token price updated:", tokenPrice)
    console.log("Current token price updated:", currentTokenPrice)
  }, [tokenPrice, currentTokenPrice])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  const ethersService = getEthersService()

  if (!showDApp) {
    return <LandingPage onEnterDApp={() => setShowDApp(true)} />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1e88e5" }}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-xl p-6 backdrop-blur-lg bg-opacity-90">
            <h1 className="text-6xl font-bold text-center" style={{ color: "#1e88e5" }}>
              capICO
            </h1>
            <h1 className="text-2xl font-bold text-center" style={{ color: "#1e88e5" }}>
              INITIAL COIN OFFERING PLATFORM
            </h1>
            <p className="text-gray-600 text-center mt-2">Manage your ICO participation and token investments</p>
          </div>
        </div>

        <GlobalError />

        <div className="space-y-6">
          {/* Main Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <WalletConnection />
            </div>
            {isWalletConnected && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <UserStatus />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <ICOStatus />
                </div>
              </>
            )}
          </div>

          {isWalletConnected ? (
            <>
              {/* User Interactive Features */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <BuyTokens
                    buyTokens={ethService?.buyTokens}
                    tokenPrice={currentTokenPrice}
                    isWalletConnected={isWalletConnected}
                  />
                </div>
                {ethersService && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <ReferralSystem ethersService={ethersService} />
                  </div>
                )}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <WhitelistStatus />
                </div>
              </div>

              {/* Information, Status, and Transaction History Components */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <TierInfo getTiers={getTiers} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <TokenVestingDashboard />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <TransactionHistory />
                </div>
              </div>

              {/* OWNER ACTIONS */}
              {isOwner && (
                <div className="bg-gray-50 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Owner Administration</h2>
                  <OwnerActions />
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-2xl text-gray-700 font-semibold mb-4">
                Please connect your wallet to access the dashboard
              </div>
              <p className="text-gray-500 mb-4">
                Connect your Web3 wallet to view your ICO participation status and manage your tokens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const WrappedAppContent = withEthers(AppContent)

function App() {
  return (
    <Provider store={store}>
      <WrappedAppContent />
    </Provider>
  )
}

export default App

