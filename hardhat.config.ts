import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    fuji: {
      url: process.env.FUJI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    morphTestnet: {
      url: process.env.MORPH_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || "",
    },
    customChains: [
      {
        network: "morphTestnet",
        chainId: 2710,
        urls: {
          apiURL: "https://explorer-api-testnet.morphl2.io/api",
          browserURL: "https://testnet.morphl2.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;