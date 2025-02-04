import React from "react";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { RiTokenSwapFill } from "react-icons/ri";
import { BiCoinStack } from "react-icons/bi";
import { MdSwapHorizontalCircle } from "react-icons/md";
import { MdGeneratingTokens } from "react-icons/md";

const Sidebar = () => {
  const navigateTo = useNavigate();

  const goToHome = () => {
    navigateTo("/");
  };

  const goToSwapPage = () => {
    navigateTo("/swap-token");
  };

  const goToCreateToken = () => {
    navigateTo("/create-token");
  };

  const goToLiquidityPage = () => {
    navigateTo("/create-liquidity");
  };

  const goToAirdropPage = () => {
    navigateTo("/airdrop");
  }

  return (
    <div className='h-full'>
      <div className='flex flex-col pt-4'>
        <div className='p-4 cursor-pointer flex items-center' onClick={goToHome}>
          <MdDashboard className='h-6 w-6' title="DashBoard"/>
          <span className='ml-2 hidden lg:inline'>Dashboard</span>
        </div>
        <div className='p-4 cursor-pointer flex items-center' onClick={goToCreateToken}>
          <RiTokenSwapFill className='h-6 w-6' title="Create Token"/>
          <span className='ml-2 hidden lg:inline'>Create Token</span>
        </div>
        <div className='p-4 cursor-pointer flex items-center' onClick={goToLiquidityPage}>
          <BiCoinStack className='h-6 w-6' title="Liquidity"/>
          <span className='ml-2 hidden lg:inline'>Liquidity</span>
        </div>
        <div className='p-4 cursor-pointer flex items-center' onClick={goToSwapPage}>
          <MdSwapHorizontalCircle className='h-6 w-6' title="Swap Token"/>
          <span className='ml-2 hidden lg:inline'>Swap Token</span>
        </div>
        <div className='p-4 cursor-pointer flex items-center' onClick={goToAirdropPage}>
          <MdGeneratingTokens className='h-6 w-6' title="Airdrop"/>
          <span className='ml-2 hidden lg:inline'>Airdrop</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
