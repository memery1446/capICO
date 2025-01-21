import { ethers } from "ethers"
import { ICO_ADDRESS } from "../contracts/addresses"
import CapICO from "../contracts/CapICO.json"
import { updateICOInfo } from "./icoSlice"

const pollingMiddleware = (store) => (next) => (action) => {
  if (action.type === "START_POLLING") {
    const pollInterval = setInterval(async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const accounts = await provider.listAccounts()

          // Only proceed if we have a connected account
          if (accounts.length === 0) {
            store.dispatch(
              updateICOInfo({
                isActive: false,
                cooldownEnabled: false,
                vestingEnabled: false,
                totalRaised: "0",
                hardCap: "0",
                tokenPrice: "0",
                tokenName: "",
                tokenSymbol: "",
                tokenBalance: "0",
                totalSupply: "0",
              }),
            )
            return
          }

          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider)

          const [isActive, cooldownEnabled, vestingEnabled, totalRaised, hardCap, tokenPrice, tokenAddress] =
            await Promise.all([
              contract.isActive(),
              contract.cooldownEnabled(),
              contract.vestingEnabled(),
              contract.totalRaised(),
              contract.hardCap(),
              contract.getCurrentTokenPrice(),
              contract.token(),
            ])

          const tokenContract = new ethers.Contract(
            tokenAddress,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function totalSupply() view returns (uint256)",
              "function balanceOf(address) view returns (uint256)",
            ],
            provider,
          )

          const [tokenName, tokenSymbol, totalSupply] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.totalSupply(),
          ])

          let tokenBalance = "0"
          try {
            const signer = provider.getSigner()
            const address = await signer.getAddress()
            tokenBalance = await tokenContract.balanceOf(address)
            tokenBalance = ethers.utils.formatEther(tokenBalance)
          } catch (error) {
            console.error("Error getting token balance:", error)
            // Don't throw here, just use "0" as the balance
          }

          store.dispatch(
            updateICOInfo({
              isActive,
              cooldownEnabled,
              vestingEnabled,
              totalRaised: ethers.utils.formatEther(totalRaised),
              hardCap: ethers.utils.formatEther(hardCap),
              tokenPrice: ethers.utils.formatEther(tokenPrice),
              tokenName,
              tokenSymbol,
              tokenBalance,
              totalSupply: ethers.utils.formatEther(totalSupply),
            }),
          )
        } catch (error) {
          console.error("Polling error:", error)
          // Dispatch an action to update the state with an error
          store.dispatch(
            updateICOInfo({
              error: "Failed to fetch ICO information. Please check your connection and try again.",
            }),
          )
        }
      }
    }, 15000) // Poll every 15 seconds

    return () => clearInterval(pollInterval)
  }
  return next(action)
}

export default pollingMiddleware

