import '@/styles/globals.css'
import { MetaMaskProvider } from 'metamask-react'
import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <MetaMaskProvider>
        <Component {...pageProps} />
      </MetaMaskProvider>
    </>
  )
}
