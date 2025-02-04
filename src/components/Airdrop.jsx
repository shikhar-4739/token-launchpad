import React, { useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { LuCoins } from "react-icons/lu";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import { MenuItem, Select } from "@mui/material";

const Airdrop = () => {
  const [publicKey, setPublicKey] = useState("");
  const [network, setNetwork] = useState("devnet");
  const wallet = useWallet();
  const { connection } = useConnection();

  async function requestAirdrop() {
    try {
      let amount = 1;
      toast.info("Processing ...");
      await connection.requestAirdrop(
        wallet.publicKey,
        amount * LAMPORTS_PER_SOL
      );
      toast.success(
        "Airdropped " + amount + " SOL to " + wallet.publicKey.toBase58()
      );
    } catch (error) {
      toast.error("Failed to airdrop! Try again later.");
    }
  }

  return (
    <section>
    <div className="m-3 md:m-10 flex justify-center">
      <div className="w-full max-w-2xl p-10 bg-white dark:bg-black shadow-md rounded-2xl">
        <h1 className="text-2xl md:text-5xl font-bold text-center mb-6 text-gray-800 dark:text-[#CDC8C2] leading-tight">
          Request Airdrop
        </h1>
        <p className="text-center mb-4 md:text-xl font-normal dark:text-[#CDC8C2]">
          * Max 1 SOL per request
        </p>
        <div className="mb-4 mt-10 flex w-full md:flex-row flex-col justify-between">
          <div className="md:w-5/6">
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="shadow appearance-none border-2 border-gray-200 dark:border-[#25282a] bg-white dark:bg-black rounded-md w-full py-2 px-3 text-gray-700  leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300"
              placeholder="Enter your valid public key"
              required
            />
          </div>
          <div className="md:w-1/6 mt-2 md:ml-2 md:mt-0 cursor-not-allowed">
            <Select
              value={network}
              className="w-full border rounded-md shadow-sm h-10 dark:border-[#303436] dark:bg-[#181A1B]"
              disabled
            >
              <MenuItem value="devnet" >devnet</MenuItem>
            </Select>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <Button
            onClick={requestAirdrop}
            variant="contained"
            color="primary"
            startIcon={<LuCoins />}
            className="w-1/2"
          >
            Airdrop
          </Button>
        </div>

        <div className="mt-10">
            <p className="text-sm font-normal dark:text-[#CDC8C2]"><span className="text-base font-semibold">NOTE :- </span> This tool is designed for development purposes and does not distribute mainnet SOL.</p>
        </div>

        <hr className="my-10 border-t-2 border-gray-200 dark:border-[#25282a]" />

        <a href="/create-token">
          <div className="text-center mt-10 border-4  rounded-xl md:mt-12 md:mb-4 items-center justify-center bg-gray-100 dark:bg-[#25282a] border-white dark:text-[#CDC8C2] dark:border-[#303436]">
            <p className="p-4 text-sm md:text-xl font-semibold">
              Want To Create a Token ? Click it Here{" "}
            </p>
          </div>
        </a>
      </div>
    </div>

    <div className="flex flex-col-reverse md:flex-row ">
        <div className="flex flex-col md:w-3/5 items-start mt-4 md:mt-10 dark:text-[#CDC8C2]">
          <div className="md:w-3/4 m-5 md:ml-12">
            <h1 className="text-lg md:text-3xl font-semibold mb-4">
              SPL SOLANA FAUCET
            </h1>
            <p className="text-sm md:text-lg mb-6 font-normal">
            The Solana Faucet is a tool that allows developers and users to receive small amounts of SOL tokens for testing and development purposes. This is particularly useful for those who are building and testing applications on the Solana blockchain.
            </p>
            <p className="text-sm md:text-lg mb-6 font-normal ">
            By using the Solana Faucet, you can easily obtain SOL tokens without having to purchase them from an exchange. This makes it easier to experiment with the Solana network and develop your projects without any financial barriers.
            </p>
            <p className="text-sm md:text-lg mb-6 font-normal">
            Our platform provides a seamless and secure way to request SOL tokens. Whether you are a beginner or an experienced developer, our faucet ensures that you have the resources you need to succeed.
            </p>
          </div>
        </div>
        <div className="w-full md:w-2/5 m-auto mt-10">
          <img
            src="/airdrop.png"
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

export default Airdrop;
