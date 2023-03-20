import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();
const alchemy_api_key = process.env.ALCHEMY_API_KEY;
const private_key: string = process.env.PRIVATE_KEY || "";
const etherscan_api_key: string = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: alchemy_api_key,
      accounts: [private_key],
    }
  },
  etherscan: {
    apiKey: {
      goerli: etherscan_api_key
    }
  },
  paths: { tests: "tests" }
};

export default config;