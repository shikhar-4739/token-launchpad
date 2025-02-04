import React from 'react';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

const InProgress = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 dark:bg-[#25282A]">
      <div className="m-3 flex flex-col items-center justify-center bg-white p-6 md:p-10 rounded-lg shadow-md dark:bg-black">
        <CircularProgress size={80} className="mb-8 dark:text-[#CDC8C2]" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4 dark:text-[#CDC8C2]">Page In Progress</h1>
        <p className="text-lg text-gray-600 mb-8 dark:text-[#CDC8C2]">
          We're working hard to bring you this feature. Please check back later.
        </p>
        <Button
          onClick={() => navigate('/')}
          variant="contained"
          color="primary"
          className="px-6 py-3"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default InProgress;