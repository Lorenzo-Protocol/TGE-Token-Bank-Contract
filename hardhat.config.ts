import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "hardhat-contract-sizer";
// import "hardhat-gas-reporter";

const accounts =
  process.env.PK !== undefined ? [process.env.PK] :
    [
      // all belowing private keys are build in accounts in hardhat,
      "c7950f0124e0f11b08828cb8afcee1bc99e5d4b3815fec94d58a924a1e53b23d", // 0x11e07aed82f1210ddab32fcd9419f56162b2794f
      "f72d341dfd27c61968a205f3e691052a6e301dcd3a236b0cd2ef2057f247d8c4", // 0xe87bde923b1b0b48c2f9f946c386f30d1184458e
      "9ed5a2048801ee52450de66409916c04296dd18feb82daa94be901f22466c8c9", // 0x761eb5fc4fed1a96a2a2ab6f5be8516c50e3007b
      "4313d6bb58d91ad2d112ba1e9ec07852e0bd952809ecd83dfd6892b9f0799ad6", // 0xa994a8c305cba5932ec30f1331155035b09bf391
      "cc25edbbbbc186aeb8b58508d71efd757827ad62a07bd3354a283f17e0fb9d4a"  // 0xa3f45b3ab5ff54d24d61c4ea3f39cc98ebcb3c7e
    ];

const config: HardhatUserConfig = {
  solidity: {
    version:"0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true
    },
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts,
    },
    node: {
      url: "http://13.208.44.230:8545",
      accounts,
    },
    sepolia: {
      url: "https://eth-sepolia.public.blastapi.io",
      accounts,
    },
    polygon: {
      url: "https://polygon.llamarpc.com",
      accounts,
    },
    bitlayer_test: {
      url: "https://testnet-rpc.bitlayer.org",
      gasPrice: 1000000000,
      chainId: 200810,
      accounts
    },
    bitlayer: {
      url: "https://mainnet-rpc.bitlayer.org",
      accounts,
      chainId: 200901,
      gasPrice: 1000000000,
    },
    hecotest: {
      // url: "http://47.118.37.70:8545",
      url: "https://http-testnet.hecochain.com",
      gas: 6000000,
      accounts
    },
    mainnet: {
      url: "https://http-mainnet.hecochain.com",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bsctest: {
      // url: 'https://bsc-testnet.blockpi.network/v1/rpc/public',
      url: 'https://bsc-testnet-rpc.publicnode.com',
      accounts
    },
    bsc: {
      // url: "https://bsc-rpc.publicnode.com",
      url: "https://white-cosmological-gas.bsc.quiknode.pro/f567518ac0071001cd0febb041bb0cc31697267c/",
      accounts
    },
    base: {
      // url: "https://mainnet.base.org",
      url: "https://twilight-thrumming-diamond.base-mainnet.quiknode.pro/20df1e4b7fcd300968026b6d31db453a6edf1d1e",
      accounts
    },
    basetest: {
      url: "https://sepolia.base.org",
      // url: "https://base-sepolia.blockpi.network/v1/rpc/public",
      // url: "https://base-sepolia-rpc.publicnode.com",
      accounts
    },
    auroratest: {
      url: "https://testnet.aurora.dev/",
      gas: 6000000,
      chainId: 1313161555,
      accounts
    },
  },
  // gasReporter: {
  //   enabled: true,
  //   currency: "USD",
  // },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
};

export default config;

