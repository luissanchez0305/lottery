import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {BigNumber, Contract, ethers, Wallet} from 'ethers';
import lotteryJson from '../assets/Lottery.json';
import lotteryTokenJson from '../assets/LotteryToken.json';

declare let window: any

const LOTTERY_CONTRACT_ADDRESS = "0xe2306011A8341dA78561d9eee76c4df8fa8E5AC4";
const TOKEN_ADDRESS = "0xDE18E41e22A3438A5eF01AbddA9C597C3bCf51F9";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  provider:  ethers.providers.Web3Provider;
  blockNumber: number = 0;
  blockDate: Date | undefined;
  transactions: string[] | undefined;
  userWallet: ethers.Signer | undefined ;
  userEthBalance: number | undefined;
  userAddress: string | undefined;
  userTokenBalance: number | undefined;
  tokenSupply: number | undefined;
  tokenContractAddress: string | undefined;
  lotteryContractAddress: string | undefined;
  tokenContract: Contract | undefined;
  lotteryContract: Contract | undefined;
  lotteryState: boolean | undefined;
  purchaseRatio: number | undefined;
  closingTimeDate: Date | undefined;
  ownerPool: number | undefined;
  prizePool: number | undefined;
  userPrize: number | undefined;

  constructor( private http: HttpClient ){
     this.provider = new ethers.providers.Web3Provider(window.ethereum);
    }

    syncBlock() {
      this.provider.getBlock("latest").then(block=>{
        this.blockNumber = block.number;
        this.blockDate = new Date(block.timestamp * 1000);
        this.transactions = block.transactions;
        this.setUpContracts();
      });
    }

    setUpContracts() {
      this.lotteryContractAddress = LOTTERY_CONTRACT_ADDRESS;
      this.tokenContractAddress = TOKEN_ADDRESS;
      this.lotteryContract = new Contract(LOTTERY_CONTRACT_ADDRESS, lotteryJson.abi, this.provider);
      this.tokenContract = new Contract(TOKEN_ADDRESS, lotteryTokenJson.abi, this.provider);
      this.tokenContract!['totalSupply']().then((resp: ethers.BigNumber)=>{
        const formatedBalance = ethers.utils.formatEther(resp)
        this.tokenSupply=parseFloat(formatedBalance) ?? 0;
      });
      this.lotteryContract!['purchaseRatio']().then((resp: ethers.BigNumber)=>{
        this.purchaseRatio=resp.toNumber() ?? 0;
      });
      this.lotteryContract!['betsOpen']().then((resp: boolean)=>{
        this.lotteryState = resp;
      });
      this.lotteryContract!['betsClosingTime']().then((resp: ethers.BigNumber)=>{
        this.closingTimeDate = new Date(resp.toNumber() * 1000);
      });
      this.lotteryContract!['prizePool']().then((resp: ethers.BigNumber)=>{
        this.prizePool = parseFloat(ethers.utils.formatEther(resp));
      });
      this.lotteryContract!['ownerPool']().then((resp: ethers.BigNumber)=>{
        this.ownerPool = parseFloat(ethers.utils.formatEther(resp));
      });
    }

    async handleAuth() {
      console.log("HANDLE AUTH***")
      window.ethereum.enable()
      this.provider.send("eth_requestAccounts", [])
      console.log("CONNECTED!")
      console.log("provider: " , this.provider);
      const signer = await this.provider.getSigner();
      this.userAddress = await signer.getAddress();
      this.userWallet=signer;

      this.userWallet.getBalance().then(bal=>{
      this.userEthBalance = parseFloat(ethers.utils.formatEther(bal));
      })
      
      this.tokenContract!['balanceOf'](this.userAddress).then((resp: ethers.BigNumber)=>{
        const formatedBalance = ethers.utils.formatEther(resp)
        this.userTokenBalance=parseFloat(formatedBalance) ?? 0;
      })
      this.lotteryContract!['prize'](this.userAddress).then((resp: ethers.BigNumber)=>{
        this.userPrize = parseFloat(ethers.utils.formatEther(resp));
      });
    }

    async openBets(secondsToClose: string){
      const currentBlock = await this.provider.getBlock("latest");
      const minutesInUnix = Number(secondsToClose) * 60;
      console.log({date: currentBlock.timestamp + minutesInUnix});
      const openTx = await this.lotteryContract?.connect(this.userWallet!)['openBets'](currentBlock.timestamp + minutesInUnix);
      const receipt = await openTx.wait();
      console.log(`Bets opened (${receipt.transactionHash})`);
    }

    async buyTokens(amount: string) {
      const buyTx = await this.lotteryContract?.connect(this.userWallet!)['purchaseTokens']({value: ethers.utils.parseEther(amount).div(this.purchaseRatio!)});
      const buyTxReceipt = await buyTx.wait();
      console.log(`Tokens bought (${buyTxReceipt.transactionHash})\n`);
    }

    async burnTokens(amount: string) {
      const allowTx = await this.tokenContract!
        .connect(this.userWallet!)
        ['approve'](this.lotteryContractAddress, ethers.constants.MaxUint256);
      const receiptAllow = await allowTx.wait();
      console.log(`Allowance confirmed (${receiptAllow.transactionHash})\n`);

      
      const burnTx = await this.lotteryContract?.connect(this.userWallet!)['returnTokens'](ethers.utils.parseEther(amount));
      const burnTxReceipt = await burnTx.wait();
      console.log(`Burn confirmed (${burnTxReceipt.transactionHash})\n`);
    }

    async bet(amount: string) {
      const allowTx = await this.tokenContract!
        .connect(this.userWallet!)
        ['approve'](this.lotteryContractAddress, ethers.constants.MaxUint256);
      await allowTx.wait();
      const betTx = await this.lotteryContract!.connect(this.userWallet!)['betMany'](amount);
      const receipt = await betTx.wait();
      console.log(`Bets placed (${receipt.transactionHash})\n`);
    }
    
    async closeBets() {
      const closeTx = await this.lotteryContract!.connect(this.userWallet!)['closeLottery']();
      const closeTxReceipt = await closeTx.wait();
      console.log(`Bets closed (${closeTxReceipt.transactionHash})\n`);
    }

    async claimPrize() {
      const claimTx = await this.lotteryContract!
        .connect(this.userWallet!)
        ['prizeWithdraw'](ethers.utils.parseEther(this.userPrize!.toString()));
      const claimTxReceipt = await claimTx.wait();
      console.log(`Prize claimed (${claimTxReceipt.transactionHash})\n`);
    }

    clearBlock(){
      this.blockNumber = 0;
      this.userWallet = undefined;
      this.tokenContractAddress = undefined;
    }
}