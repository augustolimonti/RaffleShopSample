import React from 'react';
import Partners from "../img/loadingPartners.png";

function LoadingPage() {
  return (
    <div className="flex flex-col h-full flex-grow">
        <div className="top-0 right-0 fixed sm:relative z-30 w-full mb-16">
          <div className="top-0 right-0 fixed header ml-auto self-end flex justify-between items-center sm:items-end sm:w-full pl-5 pr-10 sm:px-7 relative">
          </div>
        </div>
        <div className="px-7  h-full flex flex-col justify-start items-center gap-16">
            <p className="bg-dark-gray sm:w-[30%] text-lg mt-32 sm:mt-16 md:mt-0 md:text-3xl font-bold text-bold text-[#EAE9E8] text-center">
              A JOINT UTILITY CREATED BY
            </p>
            <div className="container bg-[#D9D9D9] mx-auto p-6 max-w-screen-xl">
              <img className="w-full h-full"src={Partners}/>
            </div>
            <div className="loader"></div>
        </div>
    </div>
  );
}

export default LoadingPage;
