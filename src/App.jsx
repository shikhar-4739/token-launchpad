import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TokenCreate from "./components/TokenCreate";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Liquidity from "./components/Liquidity";
import SwapToken from "./components/SwapToken";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import Airdrop from "./components/Airdrop";
import NotFound from "./components/Not-found";
import InProgress from "./components/InProgress";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ConnectionProvider endpoint={"https://devnet.helius-rpc.com/?api-key=a2335b29-e093-478d-bacf-dc1afa44120d"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="pt-20 flex flex-row bg-gray-200 dark:bg-[#25282A] h-screen overflow-hidden min-h-screen">
              <Navbar />
              <Router>
                <ScrollToTop />
                <div className="w-1/6 border-r-2 border-white bg-gray-200 dark:bg-[#25282A] dark:border-[#303436] dark:text-[#CDC8C2]  h-full overflow-y-auto custom-scrollbar">
                  <Sidebar />
                </div>
                <div className="w-full h-full md:w-5/6 overflow-y-auto custom-scrollbar bg-gray-200 dark:bg-[#25282A]">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create-token" element={<TokenCreate />} />
                    <Route path="/create-liquidity" element={<InProgress />} />
                    <Route path="/swap-token" element={<SwapToken />} />
                    <Route path="/airdrop" element={<Airdrop />} />
                    <Route path="/snapshot" element={<InProgress />} />
                    <Route path="/many-more" element={<InProgress />} />
                    <Route path="/*" element={<NotFound />} />
                  </Routes>
                </div>
              </Router>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}

export default App;
