import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {BigNumber, Contract, ethers, Wallet} from 'ethers';
import lotteryJson from '../assets/Lottery.json';
import lotteryTokenJson from '../assets/LotteryToken.json';

declare let window: any

const LOTTERY_CONTRACT_ADDRESS = "0xf13a713BbEa25dAA0dF2143563182688903dAC3c";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  provider:  ethers.providers.Web3Provider;
  blockNumber: number = 0;
  transactions: string[] | undefined;
  userWallet: ethers.Signer | undefined ;
  userEthBalance: number | undefined;
  userAddress: string | undefined;
  userTokenBalance: number | undefined;
  userVotingPower: number | undefined;
  tokenContractAddress: string | undefined;
  tokenSupply: number | undefined;
  tokenSymbol: string | undefined;
  tokenContract: Contract | undefined;
  lotteryContract: Contract | undefined;
  winner: string | undefined;

  constructor( private http: HttpClient ){
     this.provider = new ethers.providers.Web3Provider(window.ethereum);
    }

    syncBlock() {
      this.provider.getBlock("latest").then(block=>{
        this.blockNumber = block.number;
        this.transactions = block.transactions;
        this.setUpContracts();
      });
    }

    setUpContracts() {
      this.lotteryContract = new Contract(LOTTERY_CONTRACT_ADDRESS, lotteryJson.abi, this.provider);
      this.lotteryContract['paymentToken']().then((resp: string) => {
        console.log(resp);
        this.tokenContractAddress = resp;
        this.tokenContract = new Contract(resp, lotteryTokenJson.abi, this.provider);

      })
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
    }

    clearBlock(){
      this.blockNumber = 0;
      this.userWallet = undefined;
      this.tokenContractAddress = undefined;
    }
}