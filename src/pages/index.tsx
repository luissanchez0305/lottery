import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useMetaMask } from 'metamask-react'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { status, connect, account, chainId, ethereum } = useMetaMask();
  const requestAccount = async () => {
    const response = await connect();
    return response;
  };
  useEffect(() => {
    if(status === "connected"){

    }
  }, [status])
  return (
    <div className="px-4 py-5 my-5 text-center">
      <h1 className="display-5 fw-bold">Lottery</h1>
      <div className="col-lg-6 mx-auto">
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
          <button type="button" className="btn btn-primary btn-lg px-4 gap-3" onClick={() => requestAccount()}>Connect</button>
        </div>          
        <p className="lead my-5">Wallet connected {account}</p>
      </div>
    </div>
  )
}
