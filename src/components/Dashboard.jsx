import React from "react";
import { useNavigate } from "react-router-dom";
import CardComponent from "./CardComponent";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { BsTwitter } from "react-icons/bs";
import { FaDiscord } from "react-icons/fa6";
import { FaYoutube, FaTelegramPlane } from "react-icons/fa";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const Dashboard = () => {
  const navigateTo = useNavigate();

  const { ref: tokensRef, inView: tokensInView } = useInView({
    triggerOnce: true,
  });
  const { ref: liquidityRef, inView: liquidityInView } = useInView({
    triggerOnce: true,
  });
  const { ref: transactionsRef, inView: transactionsInView } = useInView({
    triggerOnce: true,
  });

  return (
    <section className="min-h-screen">
      <div className="flex flex-col-reverse md:flex-row pt-10 md:pt-24">
        <div className="flex flex-col w-full md:w-3/5 items-center md:items-start justify-center ml-2 md:ml-20">
          <div className=" w-full md:w-3/4 dark:text-[#CDC8C2]">
            <h1 className="text-2xl md:text-5xl font-bold mb-4">
              The all-in-one solution for web3 creators
            </h1>
            <p className="text-base md:text-lg mb-6 w-full md:w-4/5">
              Launch Token, Liquidity, Airdrops and much more. Effortless and
              without coding.
            </p>
          </div>
          <div className="">
            <button
              className="bg-gray-500 hover:bg-gray-300 text-white dark:text-[#CDC8C2] font-bold py-2 px-4 md:px-10 md:py-4 rounded-lg transition duration-300"
              onClick={() => navigateTo("/create-token")}
            >
              Launch Token &gt;
            </button>
          </div>
        </div>
        <div className="w-full md:w-2/5 m-auto p-5 flex justify-center">
          <img
            src="https://tools.smithii.io/assets/blockchain-sol-FXJALW3_.webp"
            alt="logo"
            className="w-full h-auto md:w-3/5 md:h-3/4 rounded-lg"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center mt-14 md:mt-24 bg-black dark:bg-[#181A1B]">
        <div className="flex flex-col items-center justify-center text-white dark:text-[#CDC8C2] py-10 w-full md:w-2/3">
          <h1 className=" text-3xl md:text-4xl font-semibold mb-10">
            OUR NUMBERS
          </h1>
          <div className="flex flex-wrap justify-center">
            <div
              className="flex flex-col items-center justify-center m-4"
              ref={tokensRef}
            >
              <h1 className="text-5xl font-bold">
                {tokensInView && <CountUp start={0} end={10} duration={2.5} />}+
              </h1>
              <p className="text-lg">Tokens Launched</p>
            </div>
            <div
              className="flex flex-col items-center justify-center mx-20"
              ref={liquidityRef}
            >
              <h1 className="text-5xl font-bold">
                {liquidityInView && (
                  <CountUp start={0} end={100} duration={2.5} />
                )}
                +
              </h1>
              <p className="text-lg">Liquidity Pools</p>
            </div>
            <div
              className="flex flex-col items-center justify-center m-4"
              ref={transactionsRef}
            >
              <h1 className="text-5xl font-bold">
                {transactionsInView && (
                  <CountUp start={0} end={1000} duration={2.5} />
                )}
                +
              </h1>
              <p className="text-lg">Transactions</p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3">
          <img
            src="https://smithii.io/wp-content/uploads/2024/09/Jorge-sin-fondo-e1725357382783-2048x2048.png"
            alt="hero"
            className=" w-full"
          />
        </div>
      </div>

      <div>
        <h1 className=" text-xl md:text-4xl font-semibold text-center mt-20 dark:text-[#CDC8C2]">
          OUR MOST UNDERSTANDING FEATURES
        </h1>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center m-6 md:mt-10 md:gap-x-14">
        <CardComponent
          img={"https://tools.smithii.io/assets/feature-1-Bws4gxMZ.webp"}
          title={"Token Creator"}
          desc={"Create a Custom Token without Coding within 2 minutes "}
          link={"/create-token"}
        />
        <CardComponent
          img={"https://tools.smithii.io/assets/feature-3-C1RBVecJ.webp"}
          title={"Liquidity Pool"}
          desc={
            "Easily create and manage liquidity pools to provide liquidity for your tokens"
          }
          link={"/create-liquidity"}
        />
        <CardComponent
          img={"https://tools.smithii.io/assets/feature-2-DyDbPOfA.webp"}
          title={"Airdrop"}
          desc={"Make an Airdrop of Tokens to a list of Wallets with Ease "}
          link={"/airdrop"}
        />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center m-6 md:mt-10 md:gap-x-14">
        <CardComponent
          img={"https://tools.smithii.io/assets/feature-4-BXtEYLHO.webp"}
          title={"Swap Token"}
          desc={
            "Easily swap between different tokens with our intuitive interface"
          }
          link={"/swap-token"}
        />
        <CardComponent
          img={"https://tools.smithii.io/assets/feature-5-B5ivgyyD.webp"}
          title={"Snapshot"}
          desc={
            "Take snapshots of your token holdings for governance and airdrops"
          }
          link={"/snapshot"}
        />
        <CardComponent
          img={"https://tools.smithii.io/assets/feature-6-CA42dWDf.webp"}
          title={"Many More ..."}
          desc={
            "We are working on more features to enhance your web3 experience"
          }
          link={"/many-more"}
        />
      </div>

      <div className="flex flex-col md:flex-row mt-10 md:mt-20 dark:text-[#CDC8C2]">
        <div className="w-full md:w-2/5 flex flex-col md:items-start items-center md:pl-16 md:pt-10 md:ml-6 dark:text-[#CDC8C2]">
          <h1 className="text-xl md:text-2xl font-semibold text-center">
            {" "}
            HAVE ANY DOUBTS?
          </h1>
          <p className="md:text-lg font-normal pt-4 md:pt-6 w-4/5 md:w-full">
            Feel Free to Connect on{" "}
            <span className="font-bold">
              <a href="/">Discord</a>
            </span>{" "}
            or send us a message on{" "}
            <span className="font-bold">
              <a href="/">Telegram</a>
            </span>
          </p>
        </div>
        <div className="m-5 md:pr-14">
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className="text-black dark:text-[#CDC8C2]"/>}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium dark:text-[#CDC8C2]">
                  Is this Platform Secure?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base dark:text-[#CDC8C2]">
                CoinFlux provides secure and audited Smart Contracts for our
                thousand monthly recurrent users.
              </p>
              <br />
              <p className="text-sm md:text-base dark:text-[#CDC8C2]">
                You can rest assured that everything within our platform is 100%
                safe
              </p>
            </AccordionDetails>
          </Accordion>
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className="text-black dark:text-[#CDC8C2]"/>}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium dark:text-[#CDC8C2]">
                  Which wallet can I use?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base dark:text-[#CDC8C2]">
                You can use any Solana Wallet as Phantom, Solflare, Backpack,
                etc.
              </p>
            </AccordionDetails>
          </Accordion>
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className="text-black dark:text-[#CDC8C2]"/>}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium dark:text-[#CDC8C2]">
                  How can I contact you?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base dark:text-[#CDC8C2]">
                You can contact us on Discord or Telegram.
              </p>
              <br />
              <p className="text-sm md:text-base dark:text-[#CDC8C2]">
                Our team will answer as soon as possible.
              </p>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>

      <div className=" md:mt-16 md:mb-10">
        <h1 className="text-xl md:text-2xl font-semibold text-center dark:text-[#CDC8C2]">
          {" "}
          JOIN OUR COMMUNITY
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center mt-8 md:mt-14 md:gap-x-14  md:mx-24 dark:text-[#CDC8C2]">
          <a
            href="/"
            className=" bg-white flex border-2 rounded-2xl pl-8 md:pl-14 py-3 md:py-6 text-xl md:text-2xl w-4/5 transition-transform transform duration-300 hover:translate-x-3 dark:bg-black dark:border-[#303436]"
          >
            <BsTwitter className=" mr-2 md:mr-6 text-2xl md:text-4xl" /> Twitter
          </a>
          <a
            href="/"
            className="bg-white flex border-2 rounded-2xl mt-4 md:mt-0 pl-8 md:pl-14 py-3 md:py-6 text-xl md:text-2xl w-4/5 transition-transform transform duration-300 hover:translate-x-3 dark:bg-black dark:border-[#303436]"
          >
            <FaDiscord className="mr-2 md:mr-6 text-2xl md:text-4xl" />
            Discord
          </a>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center mt-4 md:mt-8 md:gap-x-14  md:mx-24 dark:text-[#CDC8C2]">
          <a
            href="/"
            className="bg-white flex border-2 rounded-2xl pl-8 md:pl-14 py-3 md:py-6 text-xl md:text-2xl w-4/5 transition-transform transform duration-300 hover:translate-x-3 dark:bg-black dark:border-[#303436]"
          >
            <FaYoutube className="mr-2 md:mr-6 text-2xl md:text-4xl" />
            Youtube
          </a>
          <a
            href="/"
            className="bg-white flex border-2 rounded-2xl mt-4 md:mt-0 pl-8 md:pl-14 py-3 md:py-6 text-xl md:text-2xl w-4/5 transition-transform transform duration-300 hover:translate-x-3 dark:bg-black dark:border-[#303436]"
          >
            <FaTelegramPlane className="mr-2 md:mr-6 text-2xl md:text-4xl" />
            Telegram
          </a>
        </div>
      </div>

      <p className="text-center font-bold pt-10 pb-5 dark:text-[#CDC8C2]">
        © 2024 CoinFlux | All rights reserved.
      </p>
    </section>
  );
};

export default Dashboard;
