import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        runs: 100,
        enabled: true
      }
    }
  },
  paths: { tests: "tests" }

};

export default config;
