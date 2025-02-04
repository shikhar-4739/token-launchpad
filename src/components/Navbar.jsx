import React, { useEffect, useState } from "react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { FiSun } from "react-icons/fi";
import { IoMoonOutline } from "react-icons/io5";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="fixed top-0 w-full shadow-lg p-4 z-50 flex items-center justify-between bg-white dark:bg-[#181A1B] dark:text-[#CDC8C2]">
      <div className="flex">
        <img src="/logo.webp" alt="logo" className="h-8 w-8 mr-2" />
        <h1 className="text-xl">CoinFlux</h1>
      </div>
      <div className="flex">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 mr-6"
        >
          {darkMode ? (
            <FiSun className="w-8 h-5 text-yellow-400" />
          ) : (
            <IoMoonOutline className="w-8 h-5 text-gray-900" />
          )}
        </button>
        <div className="ml-auto">
          <WalletMultiButton className="h-6" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
