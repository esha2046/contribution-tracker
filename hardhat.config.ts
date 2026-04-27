import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      type: "http",
      chainType: "op",
      url: "https://sepolia.base.org",
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
    },
  },
});