import './App.css';
import React, { useState, useEffect } from 'react';
import Nav from './Pages/Nav'
import Loading from './Pages/Loading'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 4000ms = 4s

    // This function will run when the component unmounts
    return () => {
      clearTimeout(timer); // This will clear the timer in case the component unmounts before the timer fires
    }
  }, []);

  return (
      <Router>
        <div className="App bg-[#EAE9E8] min-h-screen">
          {isLoading && (
            <div className="loader-overlay">
              <Loading />
            </div>
          )}
          <DynamicContextProvider
             settings={{
               environmentId: process.env.DYNAMIC_KEY,
               initialAuthenticationMode: 'connect-only'
          }}>
            <DynamicWagmiConnector evmNetworks={[
              {
                blockExplorerUrls: ['https://polygonscan.com/'],
                chainId: 137,
                chainName: 'Matic Mainnet',
                iconUrls: ['https://app.dynamic.xyz/assets/networks/polygon.svg'],
                nativeCurrency: {
                  decimals: 18,
                  name: 'MATIC',
                  symbol: 'MATIC',
                },
                networkId: 137,
                rpcUrls: ['https://polygon-rpc.com'],
                shortName: 'MATIC',
                vanityName: 'Polygon',
              },
            ]}>
              <Nav />
            </DynamicWagmiConnector>
          </DynamicContextProvider>
        </div>
      </Router>
  );
}

export default App;
