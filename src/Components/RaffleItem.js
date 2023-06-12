import React, { useState, useEffect, useRef } from "react";
import { Checkmark } from 'react-checkmark'
import { faExclamationTriangle, faAward, faTicket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ethers} from 'ethers';

export default function RaffleItem({
  raffle,
  index,
  publicKey,
  purchaseRaffleTicket,
  selectRaffle,
  featuredCarousel,
  type,
  cancelRaffle,
  verifiedCollections,
  endTime,
  userAddress,
  raffleCreator,
  navigate
}) {
  const endTimeRef = useRef();
  endTimeRef.current = endTime;

  const [timeLeft, setTimeLeft] = useState();
  const [amountPurchased, setAmountPurchased] = useState()
  const [twitterHandle, setTwitterHandle] = useState()
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeRemaining = endTimeRef.current - now;

      // Convert timeRemaining from milliseconds to a more human-readable format
      if (timeRemaining >= 0 && !(raffle.status)){
        const seconds = Math.floor((timeRemaining / 1000) % 60);
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        if (days === 0){
          setTimeLeft(`Ends in ${Math.abs(hours)} hrs ${Math.abs(minutes)} min ${Math.abs(seconds)}s`);
        } else {
          setTimeLeft(`Ends in ${Math.abs(days)} days ${Math.abs(hours)} hrs ${Math.abs(minutes)} min`);
        }
      }
      else if (!(raffle.status) || raffle.status === 1 || raffle.status === 2){
        setTimeLeft("Ending Raffle...")
      }
      else {
        let endDate = new Date(raffle.endDate);
        let endDateString = endDate.toDateString();
        setTimeLeft('Ended on ' + endDateString)
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [raffle]);


  const onChange = (e) => {
    if (e.target.name === "ticketAmount"){
      setAmountPurchased(e.target.value)
    }
  }

  function formatTicketCost(ticketCost) {
    const etherCost = parseFloat(ethers.utils.formatEther(ticketCost));

    if (etherCost >= 1000000) {
      // Convert to millions format
      const millionCost = etherCost / 1000000;
      if (millionCost >= 100){
        return `${millionCost.toFixed(0)}m`;
      }
      else if (millionCost >= 10){
        return `${millionCost.toFixed(1)}m`;
      }
      return `${millionCost.toFixed(2)}m`;
    } else if (etherCost >= 1000) {
      // Convert to thousands format
      const thousandCost = etherCost / 1000;
      if (thousandCost >= 100){
        return `${thousandCost.toFixed(0)}k`;
      }
      else if (thousandCost >= 10){
        return `${thousandCost.toFixed(1)}k`;
      }
      return `${thousandCost.toFixed(2)}k`;
    } else {
      // Return as is
      return etherCost.toFixed(2);
    }
  }


  if (type === "purchasedRaffles"){
    const ticketsPurchased = raffle.tickets.reduce((accumulator, currentValue) => {
      if (currentValue === publicKey) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);
    return (
      <div className={`${((raffle.winner === publicKey && userAddress === 'user') || raffle.winner === userAddress) ? "border-4 border-primary-red-tint": "border-4 border-transparent"} w-full p-5 mb-5 bg-dark-gray rounded-2xl transition`}>
        <div className="grid grid-cols-3 items-start justify-start gap-2">
          <div className="aspect-[1/1] w-full pb-full relative overflow-hidden rounded-xl col-span-1">
            <img className="absolute inset-0 w-full h-full object-cover object-center bg-[#EAE9E8]" alt="raffleImage" src={raffle.imageLink}/>
          </div>
          <div className="flex flex-col overflow-hidden text-start col-span-2">
            <div className="flex font-bold text-xl text-primary-red-tint gap-2">
              <div className="font-bold text-xl text-primary-yellow text-ellipsis whitespace-nowrap overflow-hidden">
              {raffle.nftName}
              </div>
              {
                ((raffle.winner === publicKey && userAddress === 'user') || raffle.winner === userAddress) ?
                <FontAwesomeIcon icon={faAward} className="mt-1"/>
                :
                ""
              }
            </div>
            <div className = "flex items-center">
              <div className={"text-left text-white text-ellipsis whitespace-nowrap overflow-hidden text-md font-bold"}>
                {raffle.collectionName}
              </div>
              <div className="ml-2">
                {
                  (raffle.verified || verifiedCollections.includes(raffle.nftContractAddress.toLowerCase())) ?
                  <Checkmark size="12px" />
                  :
                  <FontAwesomeIcon icon={faExclamationTriangle} size="12x" color="yellow"/>
                }
              </div>
            </div>
            <div className={"text-left text-gray text-sm w-[40%] font-bold mb-2 hover:underline"}>
              <p onClick={(event) => {event.stopPropagation(); navigate(`/profile/${raffle.creator}`)}} className="text-ellipsis whitespace-nowrap overflow-hidden">{raffleCreator}</p>
            </div>
            <div className="grid sm:grid-cols-3 items-start justify-center text-center gap-2">
                <div className="text-primary-yellow text-xs font-bold">
                  {
                    !(raffle.status) ?
                    <>
                      <h4 class="text-primary-yellow text-xs font-bold">Time Remaining</h4>
                      <span class="text-white font-lekton-regular">{timeLeft}</span>
                    </>
                    :
                    <>
                      <h4 class="text-primary-yellow text-xs font-bold">Raffle Ended</h4>
                      <span class="text-white font-lekton-regular">{timeLeft}</span>
                    </>
                  }
                </div>
                <div className="text-primary-yellow text-xs font-bold gap-2">
                  <h4 class="text-primary-yellow text-xs font-bold">Tickets Remaining</h4>
                  {
                    (raffle.ticketQuantity.toNumber() - raffle.tickets.length) === 0 ?
                    <span class="text-[#FF7F7F] font-lekton-regular">SOLD OUT</span>
                    :
                    <span class="text-white font-lekton-regular">{raffle.ticketQuantity.toNumber() - raffle.tickets.length}/{raffle.ticketQuantity.toNumber()}</span>
                  }
                </div>
                <div className="text-primary-yellow text-xs font-bold gap-2">
                  <h4 class="text-primary-yellow text-xs font-bold gap-2">Tickets Purchased</h4>
                  <div class="text-white font-lekton-regular">{ticketsPurchased} tickets</div>
                  <div class="text-white font-lekton-regular">{((ticketsPurchased / raffle.tickets.length)*100).toFixed(2)}% chance</div>
                </div>
            </div>
          </div>
        </div>
      </div>

    )
  }

  return (
    <div className={`relative p-5 bg-dark-gray rounded-lg min-w-full min-h-full ${featuredCarousel ? "border-transparent border-4 hover:border-primary-yellow hover:cursor-pointer hover:border-4" : "cursor-pointer shadow-md transition ease-in-out hover:-translate-y-2 duration-300 dark:shadow-white/60 dark:hover:shadow-xl dark:hover:shadow-white/70 dark:bg-[#333333]"}`}>
      <div
        
        >
        <div className="w-full pb-[100%] rounded-lg relative overflow-hidden">
          <img
            className="w-full h-full absolute object-cover bg-[#EAE9E8]"
            src={raffle.imageLink}
            style={{ borderRadius: 10 }}
            alt="Product"
          />
          {
            !(raffle.status) ?
            <div className="absolute top-2 left-2 bg-gray-light text-primary-red font-bold px-2 py-1 rounded-lg max-w-[80%] text-[70%] truncate">
              {timeLeft}
            </div>
            :
            raffle.status !== 4 ?
            <div className="absolute top-2 left-2 bg-gray-light text-gray font-bold px-2 py-1 rounded-lg max-w-[80%] text-[70%] truncate">
              {timeLeft}
            </div>
            :
            <div className="absolute top-2 left-2 bg-gray-light text-gray font-bold px-2 py-1 rounded-lg max-w-[80%] text-[70%] truncate">
              Raffle Cancelled
            </div>
          }
          {
            raffle.tickets.reduce((a, v) => (v === publicKey ? a + 1 : a), 0) > 0 ?
            <div className="flex items-center absolute bottom-2 right-2 bg-[#EAE9E8] text-gray rounded-xl px-2 py-1 gap-2">
              {
                raffle.tickets.reduce((a, v) => (v === publicKey ? a + 1 : a), 0)
              }
              <FontAwesomeIcon icon={faTicket} className=""/>
            </div>
            :
            ""
          }
        </div>
        <div className = "flex items-center">
          <div className={"text-left text-white text-ellipsis whitespace-nowrap overflow-hidden text-md font-bold"}>
            {raffle.collectionName}
          </div>
          <div className="ml-2">
            {
              (raffle.verified || verifiedCollections.includes(raffle.nftContractAddress.toLowerCase())) ?
              <Checkmark size="12px" />
              :
              <FontAwesomeIcon icon={faExclamationTriangle} size="12x" color="yellow"/>
            }
          </div>
        </div>
        <div className={"text-left text-primary-yellow text-ellipsis whitespace-nowrap overflow-hidden text-lg font-bold"}>
          {raffle.nftName}
        </div>
        <div className={"text-left text-gray text-sm w-[40%] font-bold mb-2 hover:underline"}>
          <p onClick={(event) => {event.stopPropagation(); navigate(`/profile/${raffle.creator}`)}} className="text-ellipsis whitespace-nowrap overflow-hidden">{raffleCreator}</p>
        </div>
        <div className="grid grid-cols-2 w-full font-text font-bold text-[14px] lg:text-lg 2xl:text-2xl mb-5">
          <div className="text-white text-center break-words leading-tight">
            Tickets <br></br> Remaining
          </div>
          <div className="text-white text-center break-words leading-tight">
            Price Per <br></br> Ticket
          </div>
          <div className="text-primary-yellow text-center break-words text-3xl">
            {
              (raffle.ticketQuantity.toNumber() - raffle.tickets.length) === 0 ?
              <span class="text-[#FF7F7F]">SOLD<br></br> OUT</span>
              :
              <>
              <span>{raffle.ticketQuantity.toNumber() - raffle.tickets.length}</span>
              <hr className="border-primary-yellow w-2/3 mx-auto" />
              {raffle.ticketQuantity.toNumber()}
              </>
            }
          </div>
          <div className="flex flex-col text-primary-yellow text-center items-center break-words text-4xl" >
            {formatTicketCost(raffle.ticketCost)} <br></br> <span class="text-xl">{raffle.tokenAddress === '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0' ? '$MATIC' : `${raffle.tokenAddress === '0x8A953CfE442c5E8855cc6c61b1293FA648BAE472' ? '$PolyDoge' : '$SPEPE'}`}</span>
          </div>
        </div>
      </div>
      <hr className="border-gray-400 my-5" />
      {
        raffle.status === 0 ?
        <>
        <div className="grid gap-2 grid-cols-3">
          <input name="ticketAmount" type="number" placeHolder="QTY" maxLength={26} onChange={e => {onChange(e)}} className="text-white text-center justify-center items-center bg-transparent border-2 border-white col-span-1" autoComplete="off"/>
          <button
            onClick={() => {
              purchaseRaffleTicket(raffle, amountPurchased)
            }}
            disabled={!publicKey}
            className="disabled:opacity-50 font-text font-semibold px-1 py-1 text-sm xl:text-xl bg-primary-red hover:opacity-50 text-white rounded-full uppercase shadow-lg ml-1 mr-1 col-span-2 z-20"
          >
            Buy Now
          </button>
        </div>
        {
          (type === "createdRaffle" && raffle.tickets.length === 0 && publicKey === raffle.creator) ?
          <button onClick={() => {
            cancelRaffle(raffle)
          }} className="font-bold p-2 text-sm xl:text-xl bg-[#BE0000] hover:opacity-50 text-white rounded-xl uppercase shadow-lg mt-4 w-full">
          CANCEL RAFFLE
          </button>
          :
          ""
        }
        </>
        :
        <>
        {
          (raffle.status === 1 || raffle.status === 2) ?
          <div className="flex flex-col items-start justify-start">
            <div className={"text-left text-white truncate overflow-hidden text-xl font-bold"}>
              Choosing Winner...
            </div>
          </div>
          :
          <>
          {
            raffle.status === 3 ?
            <div className="flex flex-col items-start justify-start">
              <div className={"text-left text-white truncate overflow-hidden text-xl font-bold"}>
                Raffle Winner:
              </div>
              <div className={"text-left text-primary-yellow text-lg font-bold mb-2 break-all"}>
                {raffle.winner}
              </div>
            </div>
            :
            <div className="flex flex-col items-start justify-start">
              <div className={"text-left text-white truncate overflow-hidden text-xl font-bold"}>
                Raffle Cancelled:
              </div>
              <div className={"text-left text-primary-yellow text-lg font-bold mb-2 break-all"}>
                No Winner Was Picked
              </div>
            </div>
          }
          </>

        }
        </>
      }
    </div>
  );
}
