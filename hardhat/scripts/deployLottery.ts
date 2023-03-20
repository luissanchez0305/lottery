import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Lottery__factory } from "../typechain-types";
import { exec } from 'child_process';
dotenv.config();


async function main() {
  const tokenName = "LotteryToken";
  const tokenSymbol = "LTN"
  const purchaseRatio = 100000;
  const BET_PRICE = 1;
  const BET_FEE = 0.2;

  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing private key, please check .env file");
  
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);
  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} eth`);

  console.log("Deploying Lottery contract");
  
  const lotteryContractFactory = new Lottery__factory(signer);
  const lotteryContract = await lotteryContractFactory.deploy(
    tokenName,
    tokenSymbol,
    purchaseRatio,
    ethers.utils.parseEther(BET_PRICE.toFixed(18)),
    ethers.utils.parseEther(BET_FEE.toFixed(18))
  );
  const deployTxReceipt = await lotteryContract.deployTransaction.wait();
  console.log(`The contract was deployed at the address ${lotteryContract.address} at block ${deployTxReceipt.blockNumber}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});