import React, { useCallback, useEffect, useState } from "react";
import { Keypair, VersionedTransaction } from "@solana/web3.js";
import fetch from "cross-fetch";
import bs58 from "bs58";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { MdOutlineSwapVert } from "react-icons/md";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

const assets = [
  {
    name: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
  {
    name: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  {
    name: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
  },
  {
    name: "WIF",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
  },
  {
    name: "RAY",
    mint: "4k3Dyjzvzp8eM9vk4k3h1Bj8M1aKQY2LvWvh1ha6BNt1",
    decimals: 6,
  },
  {
    name: "SRM",
    mint: "9e1c5NrSZui6JkjjAzDyyNEQ1dUdA6DP28syneYz3FGZ",
    decimals: 6,
  },
  {
    name: "SBR",
    mint: "SaberUSDHUSDJxMN51ErTkBvY5EjfpSbHEPU85HxDjAzKgCU",
    decimals: 6,
  },
  {
    name: "ORCA",
    mint: "orcaNoyrF1f3aQrUbJwZkPZGyzBY8W7mG49pPAzqHFV",
    decimals: 6,
  },
  {
    name: "FTT",
    mint: "5x4Fs7NzXSFeGpP8hbTW2ZgJkR7JwYSHgpw8aEgCMANM",
    decimals: 8,
  },
];

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const SwapToken = () => {
  const [fromAsset, setFromAsset] = useState(assets[0]);
  const [toAsset, setToAsset] = useState(assets[1]);
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [quoteResponse, setQuoteResponse] = useState(null);
  const [slippage, setSlippage] = useState(0.5);

  const wallet = useWallet();
  const { connection } = useConnection();

  const fetchQuote = async (amount) => {
    if (!amount || amount < 0) return;

    try {
      console.log(fromAsset.mint, toAsset.mint, amount * 10 ** fromAsset.decimals, slippage);
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${fromAsset.mint}&outputMint=${toAsset.mint}&amount=${amount * 10 ** fromAsset.decimals}&slippage=${slippage}`
      );
      const data = await response.json();
      console.log(data);
      if (data && data.outAmount) {
        setToAmount((data.outAmount / 10 ** toAsset.decimals).toFixed(6));
        setQuoteResponse(data);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  };

  const debounceFetchQuote = useCallback(debounce(fetchQuote, 500), [
    fromAsset,
    toAsset,
  ]);

  useEffect(() => {
    if (fromAmount) {
      debounceFetchQuote(fromAmount);
    }
  }, [fromAmount, debounceFetchQuote, slippage]);

  const handleFromAssetChange = (event) => {
    const selectedAsset = assets.find(
      (asset) => asset.name === event.target.value
    );
    setFromAsset(selectedAsset);
    // Automatically switch the "toAsset" if it matches the selected "fromAsset"
    if (toAsset.name === selectedAsset.name) {
      setToAsset(assets.find((asset) => asset.name !== selectedAsset.name));
    }
  };

  const handleToAssetChange = (event) => {
    setToAsset(assets.find((asset) => asset.name === event.target.value));
  };

  const handleSwap = async () => {
    if (!wallet.connected || !wallet.signTransaction) {
      console.error(
        "Wallet not connected or does not support signing transactions."
      );
      return;
    }

    try {
      toast.info("Processing swap. Please wait...");
      const response = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet.publicKey?.toString(),
          wrapAndUnwrapSol: true,
        }),
      });

      const { swapTransaction } = await response.json();
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      const signedTransaction = await wallet.signTransaction(transaction);

      const rawTransaction = signedTransaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txid,
        },
        "confirmed"
      );
      
      toast.success("Transaction successful. Check your wallet for the new token balance.");
      console.log(`Transaction successful: https://solscan.io/tx/${txid}`);
    } catch (error) {
      toast.error("Error during swap. Please try again.");
      console.error("Error during swap:", error);
    }
  };

  return (
    <section>
      <div className="m-3 md:m-10 flex justify-center ">
        <div className="w-full max-w-md p-10 bg-white shadow-md rounded-2xl dark:bg-black">
          <h1 className=" text-2xl md:text-5xl font-bold text-center mb-6 text-gray-800 leading-tight dark:text-[#CDC8C2]">
            Swap anytime, anywhere.
          </h1>

          <div className="mb-4">
            <label className="block text-base font-medium text-gray-700 dark:text-[#CDC8C2]">
              Sell
            </label>
            <input
              type="number"
              value={fromAmount}
              min={0}
              onChange={(e) => setFromAmount(Number(e.target.value))}
              className="w-full mt-1 p-2 border-2 border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
            />
            <select
              value={fromAsset.name}
              onChange={handleFromAssetChange}
              className="w-full p-2 border-2 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 mt-2 dark:text-[#CDC8C2] dark:bg-black dark:border-[#25282a]"
            >
              {assets.map((asset) => (
                <option key={asset.mint} value={asset.name}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center text-xl rounded-xl ">
            <span className="p-2 bg-gray-200 rounded-full dark:bg-[#25282a] dark:text-[#CDC8C2]">
            <MdOutlineSwapVert />
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-base font-medium text-gray-700 dark:text-[#CDC8C2]">
              Buy
            </label>
            <input
              type="number"
              value={toAmount}
              readOnly
              className="w-full mt-1 p-2 border-2 border-gray-200 rounded-md shadow-sm bg-gray-50 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
            />
            <select
              value={toAsset.name}
              onChange={handleToAssetChange}
              className="w-full p-2 border-2 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 mt-2 dark:text-[#CDC8C2] dark:bg-black dark:border-[#25282a]"
            >
              {assets.map((asset) => (
                <option
                  key={asset.mint}
                  value={asset.name}
                  disabled={asset.name === fromAsset.name} 
                >
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex justify-between">
            <label className="block text-base font-medium text-gray-700 mt-2 dark:text-[#CDC8C2]">
              Slippage Tolerance
            </label>
            <select value={slippage} onChange={(e) => setSlippage(Number(e.target.value))} className="w-1/2 p-2 border-2 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:border-[#25282a] dark:text-[#CDC8C2] dark:bg-black">
              <option value={0.1}>0.1%</option>
              <option value={0.5}>0.5%</option>
              <option value={1}>1%</option>
              <option value={2}>2%</option>
            </select>
          </div>

          {wallet.connected ? (
            <button
            onClick={handleSwap}
            disabled={!fromAmount || toAsset.mint === fromAsset.mint}
            className={`w-full py-2 px-4 rounded-md text-white ${
              !fromAmount || toAsset.mint === fromAsset.mint
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Swap
          </button>
          ) : (
            <button className="w-full py-2 px-4 rounded-md bg-gray-400 cursor-not-allowed">
              Connect Wallet to Swap
            </button>
          )}
        </div>
      </div>

      <div className="md:m-5 pt-8 pb-8 ">
        <h1 className=" text-2xl md:text-3xl font-bold text-center pb-4 dark:text-[#CDC8C2]">
          FREQUENTLY ASKED QUESTIONS
        </h1>

        <div className="m-5 ">
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              className="dark:bg-black"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium ">What is slippage?</h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base">
                Slippage refers to the difference between the expected price of
                a trade and the actual price at which the trade is executed.
              </p>
              <br />
              <p className="text-sm md:text-base">
                High slippage can occur in volatile markets or with low
                liquidity.
              </p>
            </AccordionDetails>
          </Accordion>
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium">
                  Is it Safe to use Swap Token here?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base">
                Yes, our tool is completely safe. It is a dApp that swap your
                token, and it does not store any of your data.
              </p>
              <p className="text-sm md:text-base">
                Our dApp is audited and used by hundred users every month.
              </p>
            </AccordionDetails>
          </Accordion>
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium">
                  What are the fees associated with token swapping?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base">
                Fees for token swapping can include:
                <br />
                <br/>
                Network fees (e.g., gas fees on Ethereum or transaction fees on
                Solana).
                <br />
                Exchange fees (charged by the DEX).
                <br />
                Slippage (the difference between the expected and actual trade
                price).
              </p>
            </AccordionDetails>
          </Accordion>
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium">
                  Which wallet can i use?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base">
                You can use any Solana Wallet as Phantom, Solflare, Backpack,
                etc.
              </p>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row dark:text-[#CDC8C2]">
        <div className="flex flex-col md:w-3/5 items-start ">
          <div className="md:w-3/4 m-5 md:ml-12">
            <h1 className="text-lg md:text-3xl font-semibold mb-4">
              SPL TOKEN SWAP
            </h1>
            <p className="text-sm md:text-lg mb-6 font-normal">
            Easily swap your tokens with our Token Swap feature. Whether you are a beginner or an experienced user, our platform provides a seamless and secure way to exchange your tokens.
            </p>
            <p className="text-sm md:text-lg mb-6 font-normal ">
            Furthermore, you can count on exceptional support to help you with anything. Our highly trained team is available 24/7 to help you resolve any issues or questions you may have.
            </p>
            <p className="text-sm md:text-lg mb-6 font-normal">
            Start swapping your tokens on Solana today with our reliable and secure online platform. Experience the easiest and most efficient token swap process available!
            </p>
          </div>
        </div>
        <div className="w-full md:w-2/5 m-auto ">
          <img
            src="/swap.png"
            alt="logo"
            className="w-full h-auto md:w-4/5 md:h-3/4 rounded-lg"
          />
        </div>
      </div>

      <p className="text-center font-bold pb-5 pt-2 dark:text-[#CDC8C2]">
        © 2024 CoinFlux | All rights reserved.
      </p>
    </section>
  );
};

export default SwapToken;
