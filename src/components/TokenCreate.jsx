import React, { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { FaUpload } from "react-icons/fa";
import axios from "axios";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

const TokenCreate = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimal, setDecimal] = useState(6);
  const [supply, setSupply] = useState(1);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [includeSocialLinks, setIncludeSocialLinks] = useState(true);
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [website, setWebsite] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = () => {
    return name && symbol && decimal && supply && image && description;
  }

  // Function to create metadata URI
  const createMetadataURI = async (metadata) => {
    try {
      // Prepare metadata JSON as string
      const metadataJSON = JSON.stringify(metadata);
      console.log("Metadata JSON: ", metadataJSON);
      // Push the metadata JSON file to GitHub (assuming a preconfigured GitHub API)
      const response = await axios.post(
        `https://api.github.com/repos/${import.meta.env.VITE_GITHUB_USERNAME}/${import.meta.env.VITE_GITHUB_REPOSITORY}/contents/metadata/token-metadata.json`,
        {
          message: "Create token metadata",
          content: btoa(metadataJSON), // Base64 encode the JSON
          path: "metadata/token-metadata.json", // Path to save the metadata in GitHub repo
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          },
        }
      );

      // Return the URL of the metadata stored in the repository
      const metadataURI = `https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}/${import.meta.env.VITE_GITHUB_REPOSITORY}/raw/main/metadata/token-metadata.json`;
      console.log(metadataURI);
      return metadataURI;
    } catch (error) {
      console.error("Error creating metadata URI:", error);
    }
  };

  const uploadImageToGitHub = async (imageFile) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64Image = reader.result.split(",")[1];
          const response = await axios.post(
            `https://api.github.com/repos/${import.meta.env.VITE_GITHUB_USERNAME}/${import.meta.env.VITE_GITHUB_REPOSITORY}/contents/images/token-image.png`,
            {
              message: "Upload token image",
              content: base64Image,
              path: "images/token-image.png",
            },
            {
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
              },
            }
          );
          const imageUrl = `https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}/${import.meta.env.VITE_GITHUB_REPOSITORY}/raw/main/images/token-image.png`;
          resolve(imageUrl);
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error("Error uploading image to GitHub:", error);
      throw error;
    }
  };

  const createToken = async () => {
    const metadata = {
      name: name,
      symbol: symbol,
      description: description,
      image: "",
      twitter: includeSocialLinks ? twitter : "",
      website: includeSocialLinks ? website : "",
      discord: includeSocialLinks ? discord : "",
    };

    // Generate the image URL by uploading to GitHub
    console.log("Uploading image to GitHub...", image);
    const imageURL = await uploadImageToGitHub(image);
    console.log("Token Image URL: ", imageURL);

    // Add the image URL to the metadata
    metadata.image = imageURL;

    // Generate the metadata URI by uploading to GitHub
    console.log("Creating metadata URI...", metadata);
    const metadataURI = await createMetadataURI(metadata);
    console.log("Token Metadata URI: ", metadataURI);

    const mintKeypair = Keypair.generate();
    const tokenMetadata = {
      mint: mintKeypair.publicKey,
      name: name,
      symbol: symbol,
      uri: metadataURI,
      additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(tokenMetadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimal,
        wallet.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        uri: tokenMetadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      })
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeypair);

    await wallet.sendTransaction(transaction, connection);

    const associatedToken = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(associatedToken.toBase58());

    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction2, connection);

    const transaction3 = new Transaction().add(
      createMintToInstruction(
        mintKeypair.publicKey,
        associatedToken,
        wallet.publicKey,
        supply,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction3, connection);
  };

  return (
    <section>
      <div className="m-3 md:m-10 bg-white rounded-2xl p-5 dark:bg-black dark:text-[#CDC8C2]">
        <div className="text-center pt-5">
          <h1 className="text-xl md:text-5xl font-bold text-center  md:pb-2">
            Solana Token Creator
          </h1>
          <p className="md:text-xl text-center mt-2 md:mt-4">
            Easily Create your own Solana SPL Token in just 7+1 steps without
            Coding.
          </p>
        </div>

        <form className="mt-10">
          <div className="flex flex-row flex-wrap">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label
                className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                htmlFor="name"
              >
                *Name:
              </label>
              <input
                className="shadow appearance-none border-2 border-gray-200 bg-white rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                type="text"
                placeholder="Put the Name of your Token"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-6 w-full md:w-1/2 px-2">
              <label
                className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                htmlFor="symbol"
              >
                *Symbol:
              </label>
              <input
                className="shadow appearance-none border-2 border-gray-200 bg-white  rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                type="text"
                placeholder="Put the Symbol of your Token"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-row flex-wrap">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label
                className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                htmlFor="name"
              >
                *Decimal:
              </label>
              <input
                className="shadow appearance-none border-2 border-gray-200 bg-white rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                type="text"
                placeholder="Enter decimal value"
                value={decimal}
                onChange={(e) => setDecimal(e.target.value)}
              />
            </div>
            <div className="mb-6 w-full md:w-1/2 px-2">
              <label
                className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                htmlFor="symbol"
              >
                *Supply:
              </label>
              <input
                className="shadow appearance-none border-2 border-gray-200 bg-white rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                type="text"
                placeholder="Enter token supply"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-row flex-wrap">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label
                className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                htmlFor="image"
              >
                *Image:
              </label>
              <div className="relative">
                <input
                  className="hidden "
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="image"
                  className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer h-32 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      className="absolute inset-0 w-1/2 h-3/4 m-auto object-cover rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FaUpload className="h-8 w-8" />
                      <span className="mt-2 text-sm">Click to upload</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label
                className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                htmlFor="description"
              >
                Description:
              </label>
              <textarea
                className="shadow appearance-none border-2 border-gray-200 bg-white rounded-md w-full h-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                placeholder="Enter a description for your token"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="mb-6 px-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                checked={includeSocialLinks}
                onChange={() => setIncludeSocialLinks(!includeSocialLinks)}
              />
              <span className="text-sm md:text-xl font-semibold">
                Add Social Links
              </span>
            </label>
          </div>

          {includeSocialLinks && (
            <div className="flex flex-row flex-wrap">
              <div className="w-full md:w-1/3 px-2 mb-4">
                <label
                  className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                  htmlFor="twitter"
                >
                  Twitter:
                </label>
                <input
                  className="shadow appearance-none border-2 border-gray-200 bg-white rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/3 px-2 mb-4">
                <label
                  className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                  htmlFor="discord"
                >
                  Discord:
                </label>
                <input
                  className="shadow appearance-none border-2 border-gray-200 bg-white rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                  type="url"
                  placeholder="https://discord.gg/yourlink"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/3 px-2 mb-4">
                <label
                  className="block text-gray-700 text-sm md:text-xl font-semibold mb-2 dark:text-[#CDC8C2]"
                  htmlFor="website"
                >
                  Website:
                </label>
                <input
                  className="shadow appearance-none border-2 border-gray-200 bg-white rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm hover:border-2 hover:border-blue-500 transition duration-300 dark:bg-black dark:text-[#CDC8C2] dark:border-[#25282a]"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-center mt-10">
            <button
              className={` ${!wallet.connected ? "opacity-50 cursor-not-allowed" : " "} bg-gray-500 hover:bg-gray-200 text-white md:text-xl font-bold py-2 px-4 md:py-4 md:px-8 rounded-lg focus:outline-none focus:shadow-outline`}
              type="button"
              disabled={!wallet.connected || !isFormValid()}
              title={
                !wallet.connected
                  ? "Please connect your wallet to continue"
                  : !isFormValid() ? "Please fill all the required fields" : ""
              }
              onClick={createToken}
            >
              Create Token
            </button>
          </div>
        </form>

        <a href="/liquidity">
          <div className="text-center mt-10 border-4  rounded-xl md:m-20 items-center justify-center bg-gray-100 border-white dark:text-[#CDC8C2] dark:border-[#303436] dark:bg-[#25282a]">
            <p className="p-4 text-sm md:text-xl font-semibold">
              Want To Create a Liquidity Pool ?Click it Here{" "}
            </p>
          </div>
        </a>

        <hr className="my-10 border-t-2 border-gray-200 dark:border-[#25282a]" />

        <div className="flex flex-col md:flex-row md:p-10 dark:text-[#CDC8C2]">
          <div className="m-auto p-5 w-full md:w-2/5">
            <img
              src="https://tools.smithii.io/assets/blockchain-sol-FXJALW3_.webp"
              alt="logo"
              className="w-full h-auto md:w-3/5 md:h-3/4 rounded-lg"
            />
          </div>
          <div className=" flex flex-col items-start w-full md:w-3/5">
            <h1 className=" text-lg md:text-2xl font-bold mb-4">
              How to use Solana Token Creator
            </h1>
            <p className="text-sm md:text-lg mb-2 ">1. Connect your Solana wallet</p>
            <p className="text-sm md:text-lg mb-2">
              2. Write the name you want for your Token
            </p>
            <p className="text-sm md:text-lg mb-2">
              3. Indicate the symbol (max 8 characters)
            </p>
            <p className="text-sm md:text-lg mb-2 ">
              4. Select the decimals quantity (0 for Whitelist Token, 6 for
              utility token)
            </p>
            <p className="text-sm md:text-lg mb-2 ">
              5. Write the description you want for your SPL Token
            </p>
            <p className="text-sm md:text-lg mb-2 ">
              6. Upload the image for your token (PNG)
            </p>
            <p className="text-sm md:text-lg mb-2 ">7. Put the Supply of your Token</p>
            <p className="text-sm md:text-lg mb-2 ">
              8. Click on create, accept the transaction and wait until your
              token is ready
            </p>
          </div>
        </div>
      </div>

      <div className="md:m-5 pt-8 pb-8">
        <h1 className=" text-2xl md:text-3xl font-bold text-center pb-4 dark:text-[#CDC8C2]">
          FREQUENTLY ASKED QUESTIONS
        </h1>

        <div className="m-5">
          <Accordion className="mb-6">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography component="span">
                <h1 className="md:text-xl font-medium">
                  What is Solana Token Creator
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base">
                Solana Token Creator is a Smart Contract that allows everyone,
                without coding experience, to create SPL Tokens (tokens from
                Solana Chain) customized with the data you want (supply, name,
                symbol, description and image).
              </p>
              <br />
              <p className="text-sm md:text-base">
                All this process is faster and cheaper that any other option as
                it is automatically done. This tool is completely safe, audited
                by different development teams and used by biggest solana
                projects.
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
                  Is it Safe to use Solana Token Creator here?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base">
                Yes, our tool is completely safe. It is a dApp that creates your
                token, giving you and only you the mint and freeze Authority
                (the control of a SPL Token).
              </p>
              <p className="text-sm md:text-base">Our dApp is audited and used by hundred users every month.</p>
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
                  How much time will Solana Token Creator Take?
                </h1>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm md:text-base">
                The time of your Token Creation depends on the TPS Status of
                Solana. It usually takes just a few seconds so do not worry,
                your token will be ready really soon!
              </p>
              <br />
              <p className="text-sm md:text-base">If you have any issue please contact us.</p>
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

      <div className="flex flex-col-reverse md:flex-row  dark:text-[#CDC8C2]">
        <div className="flex flex-col md:w-3/5 items-start ">
          <div className="md:w-3/4 m-5 md:ml-12">
            <h1 className="text-lg md:text-3xl font-semibold mb-4">
              SPL TOKEN CREATOR
            </h1>
            <p className="text-sm md:text-lg mb-6 font-normal">
              Whether you have development knowledge, our SPL Token Creator
              software is perfect. It will help you create tokens quickly and
              securely, saving you time and money.
            </p>
            <p className="text-sm md:text-lg mb-6 font-normal ">
            Furthermore, you can count on exceptional support to help you with anything. Our highly trained team is available 24/7 to help you resolve any issues or questions you may have.
            </p>
            <p className="text-sm md:text-lg mb-6 font-normal">
            Start creating and managing your SPL tokens on Solana today with our reliable and secure online maker. We assure you won't find an easier and more efficient experience elsewhere!
            </p>
          </div>
        </div>
        <div className="w-full md:w-2/5 m-auto ">
          <img
            src="/create-token.png"
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

export default TokenCreate;
