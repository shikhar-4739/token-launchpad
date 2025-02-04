import React from "react";

const CardComponent = ({ img, title, desc, link }) => {
  return (
    <div className=" relative bg-gradient-to-b from-gray-500 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-white dark:border-[#303436] shadow-xl overflow-hidden w-full sm:w-1/2 md:w-1/3 lg:w-1/4 md:h-96 m-4 text-center transition-transform transform duration-300 hover:scale-105 hover:shadow-2xl">
      <a
        href={link}
        rel="noreferrer"
        className=" block h-full"
      >
        <div className="w-full h-2/3 overflow-hidden border-b-2 border-white dark:border-[#303436] flex items-center justify-center">
          <img
            src={img}
            alt="img"
            className="w-3/4 h-3/4 md:w-3/4 md:h-3/4 object-cover"
          />
        </div>
        <div className=" p-4 md:pb-8 ">
          <h1 className="text-xl md:text-2xl font-bold mb-2 tracking-wide text-gray-800 dark:text-[#CDC8C2]">{title}</h1>
          <p className="text-sm  leading-relaxed text-gray-600 dark:text-[#CDC8C2]">{desc}</p>
        </div>
      </a>
    </div>
  );
};

export default CardComponent;
