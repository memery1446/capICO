// src/config/contractAddresses.js
const addresses = {
  // Local development
  development: {
    TOKEN: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    ICO: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  },
  // Sepolia testnet
  sepolia: {
    TOKEN: process.env.REACT_APP_TOKEN_ADDRESS,
    ICO: process.env.REACT_APP_ICO_ADDRESS
  }
};

const getAddresses = () => {
  const network = process.env.REACT_APP_NETWORK || 'development';
  return addresses[network];
};

export default getAddresses();

