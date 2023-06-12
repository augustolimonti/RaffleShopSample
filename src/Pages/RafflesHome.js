import React, {useState, useEffect, useCallback} from "react";
import RaffleItem from "../Components/RaffleItem";
import { useRef } from 'react';
import '../App.css'
import Carousel from 'react-elastic-carousel';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers } from 'ethers';
import PolyDogeABI from '../Components/polyDogeABI.json';
import SPepeABI from '../Components/SPepeABI.json';
import MaxinLogo from '../img/maxinLogo.png'
import PolyDogeIcon from "../img/polyDogeIcon.png";
import DrillClubLogo from '../img/drillClubLogo.png'
import RokoroLogo from '../img/rokoroLogo.png'
import SPepeLogo from '../img/spepe-img.png'

library.add(faSearch, faTimes);

const RafflesHome = (props) => {
  // user variables
  const [walletType, setWalletType] = useState()

  // boolean variables
  const [toggleLivePast, setToggleLivePast] = useState(true)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(true)

  // render variables
  const [itemsToShow, setItemsToShow] = useState();
  const [filterName, setFilterName] = useState('')
  const [filterCollectionName, setFilterCollectionName] = useState('')
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingCollection, setIsSearchingCollection] = useState(false);
  const [filterByPartner, setFilterByPartner] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState('');
  // const [timeLeft, setTimeLeft] = useState()

  // set the public address based on connected wallet.
  // set public key & wallet type
  useEffect(() => {
    if (props.defaultAccount.address){
      setWalletType(props.defaultAccount.connector.walletConnector.name)
    }
  }, [props.defaultAccount])

  // Toggle between live and past raffles.
  const showLiveRaffles = useCallback(() => {
    setToggleLivePast(true);
  }, []);
  const showPastRaffles = useCallback(() => {
    // console.log(toggleLivePast)
    setToggleLivePast(false);
  }, []);

  // Show selected Raffle
  const selectRaffle = (async (item) => {
    // const index = await props.raffleContract.getRaffleIndex(item.creator, item.nftContractAddress, item.nftId)
    props.navigate(`/raffle/${item}`)
  })

  // Render Raffles Functionality
  const carouselRef = useRef();
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) { // adjust this value to your needs
        setItemsToShow(1);
      }
      else if (window.innerWidth < 1000) { // adjust this value to your needs
        setItemsToShow(2);
      }
      else {
        setItemsToShow(3);
      }
    };

    if (window.innerWidth < 600) {
        setItemsToShow(1);
      }
    else if (window.innerWidth < 1000) {
      setItemsToShow(2);
    }
    else {
      setItemsToShow(3);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderFeatured = () => {
    let featuredRaffles = props.allRaffles.filter((item) => item.status === 0).filter((item) => item.featured === 1).filter((item) => {
      if (filterByPartner) {
        return (item.nftContractAddress === partnerFilter || item.tokenAddress === partnerFilter)
      }
      return item
    })

    if (featuredRaffles.length < 3){
      let runningRaffles = props.allRaffles.filter((raffle) => raffle.status === 0).filter((item) => item.featured === 0).filter((item) => (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase()))).filter((item) => {
          if (filterByPartner) {
            return (item.nftContractAddress === partnerFilter || item.tokenAddress === partnerFilter)
          }
          return item
      })
      featuredRaffles = featuredRaffles.concat(runningRaffles.slice(0, (3 - featuredRaffles.length)));
    }
    const totalPages = Math.ceil(featuredRaffles.length / itemsToShow)
    let resetTimeout;
    return (
      <>
      {
        featuredRaffles.length > 0 ?
        <Carousel
          ref={carouselRef}
          enableAutoPlay
          autoPlaySpeed={4000}
          itemsToShow={itemsToShow}
          pagination={false}
          itemPadding={[0, 10]}
          onNextEnd={({ index }) => {
           clearTimeout(resetTimeout)
           if (index + 1 === totalPages) {
              resetTimeout = setTimeout(() => {
                 if (carouselRef.current) {
                   carouselRef.current.goTo(0)
                 }
             }, 4000) // same time
           }
         }}
          onNextStart={(currentItem, nextItem) => {
            if (currentItem.index === nextItem.index) {
              // we hit the last item, go to first item
              if (carouselRef.current) {
                carouselRef.current.goTo(0)
              }
            }
          }}
          onPrevStart={(currentItem, nextItem) => {
            if (currentItem.index === nextItem.index) {
              // we hit the first item, go to last item
              if (carouselRef.current) {
                carouselRef.current.goTo(featuredRaffles.length);
              }
            }
          }}
          disableArrowsOnEnd={false}
          showEmptySlots={true}
          >
          {
            featuredRaffles
            .map((item, index) => {
              let raffleCreator = item.creator
              if (props.verifiedUsers[item.creator]?.twitterHandle){
                raffleCreator = "@" + props.verifiedUsers[item.creator]?.twitterHandle
              }
              else if (props.verifiedUsers[item.creator]?.discordHandle){
                raffleCreator = "@" + props.verifiedUsers[item.creator]?.discordHandle
              }
              return (
                <RaffleItem
                  key={`${item.nftContractAddress}-${item.creator}-${item.nftId}-${(item.duration.toNumber() + item.startDate.toNumber())}`}
                  raffle={item}
                  index={index}
                  publicKey={props.defaultAccount.address}
                  walletType={walletType}
                  purchaseRaffleTicket={purchaseRaffleTicket}
                  selectRaffle = {selectRaffle}
                  featuredCarousel = {true}
                  verifiedCollections={props.verifiedCollections}
                  endTime = {item.duration.toNumber() + item.startDate.toNumber()}
                  raffleCreator={raffleCreator}
                  navigate={props.navigate}
                />
            )})
          }
        </Carousel>
        :
        ""
      }
      </>
    );
  };
  const renderLiveRaffles = () => {
    let featuredRaffles = props.allRaffles.filter((item) => item.status === 0).filter((item) => item.featured === 1).filter((item) => {
      if (filterByPartner) {
        return (item.nftContractAddress === partnerFilter || item.tokenAddress === partnerFilter)
      }
      return item
    })
    if (featuredRaffles.length < 3){
      let runningRaffles = props.allRaffles.filter((raffle) => raffle.status === 0).filter((item) => item.featured === 0).filter((item) => (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase()))).filter((item) => {
        if (filterByPartner) {
          return (item.nftContractAddress === partnerFilter || item.tokenAddress === partnerFilter)
        }
        return item
      })
      featuredRaffles = featuredRaffles.concat(runningRaffles.slice(0, (3 - featuredRaffles.length)));
    }
    let liveRaffles = props.allRaffles.filter((raffle) => raffle.status === 0).filter((item) => item.featured === 0).filter((item) => {
      if (filterByPartner) {
        return (item.nftContractAddress === partnerFilter || item.tokenAddress === partnerFilter)
      }
      return item
    })
    liveRaffles = liveRaffles.filter(element => !featuredRaffles.includes(element));

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-10 w-full h-full">
        {liveRaffles
          .filter((item) => {
            if (showVerifiedOnly) {
              if (isSearching){
                return item.status === 0 && !item.featured && (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase())) && (item.nftName.toLowerCase().includes(filterName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterName.toLowerCase()));
              }
              else if (isSearchingCollection){
                return item.status === 0 && !item.featured && (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase())) && (item.nftName.toLowerCase().includes(filterCollectionName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterCollectionName.toLowerCase()));
              }
              return item.status === 0 && !item.featured && (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase()));
            } else {
              if (isSearching){
                return item.status === 0 && !item.featured && (item.nftName.toLowerCase().includes(filterName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterName.toLowerCase()));
              }
              else if (isSearchingCollection){
                return item.status === 0 && !item.featured && (item.nftName.toLowerCase().includes(filterCollectionName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterCollectionName.toLowerCase()));
              }
              return item.status === 0 && !item.featured;
            }
          })
          .map((item, index) => {
            // console.log(item.verified)
            let raffleCreator = item.creator
            if (props.verifiedUsers[item.creator]?.twitterHandle){
              raffleCreator = "@" + props.verifiedUsers[item.creator]?.twitterHandle
            }
            else if (props.verifiedUsers[item.creator]?.discordHandle){
              raffleCreator = "@" + props.verifiedUsers[item.creator]?.discordHandle
            }
            return (
              <RaffleItem
                key={`${item.nftContractAddress}-${item.creator}-${item.nftId}-${(item.duration.toNumber() + item.startDate.toNumber())}`}
                raffle={item}
                index={index}
                publicKey={props.defaultAccount.address}
                walletType={walletType}
                selectRaffle = {selectRaffle}
                purchaseRaffleTicket={purchaseRaffleTicket}
                verifiedCollections={props.verifiedCollections}
                endTime = {item.duration.toNumber() + item.startDate.toNumber()}
                raffleCreator={raffleCreator}
                navigate={props.navigate}
              />
            )
          })}
      </div>
    );
};
  const renderPastRaffles = () => {
    let pastRaffles = props.allRaffles.filter((item) => (item.status === 3 || item.status === 1 || item.status === 2)).filter((item) => {
      if (filterByPartner) {
        return (item.nftContractAddress === partnerFilter || item.tokenAddress === partnerFilter)
      }
      return item
    })
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-10 w-full h-full">
        {pastRaffles
          .filter((item) => {
            if (showVerifiedOnly) {
              if (isSearching){
                return (item.status === 3 || item.status === 1 || item.status === 2)  && (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase())) && (item.nftName.toLowerCase().includes(filterName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterName.toLowerCase()));
              }
              else if (isSearchingCollection){
                return (item.status === 3 || item.status === 1 || item.status === 2) && (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase())) && (item.nftName.toLowerCase().includes(filterCollectionName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterCollectionName.toLowerCase()));
              }
              return (item.status === 3 || item.status === 1 || item.status === 2) && (item.verified === 1 || props.verifiedCollections.includes(item.nftContractAddress.toLowerCase()));
            } else {
              if (isSearching){
                return (item.status === 3 || item.status === 1 || item.status === 2) && (item.nftName.toLowerCase().includes(filterName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterName.toLowerCase()));
              }
              else if (isSearchingCollection){
                return (item.status === 3 || item.status === 1 || item.status === 2) && (item.nftName.toLowerCase().includes(filterCollectionName.toLowerCase()) || item.collectionName.toLowerCase().includes(filterCollectionName.toLowerCase()));
              }
              return (item.status === 3 || item.status === 1 || item.status === 2);
            }
          })
          .map((item, index) => {
            let raffleCreator = item.creator
            if (props.verifiedUsers[item.creator]?.twitterHandle){
              raffleCreator = "@" + props.verifiedUsers[item.creator]?.twitterHandle
            }
            else if (props.verifiedUsers[item.creator]?.discordHandle){
              raffleCreator = "@" + props.verifiedUsers[item.creator]?.discordHandle
            }
            return(
              <RaffleItem
              key={`${item.nftContractAddress}-${item.creator}-${item.nftId}-${(item.duration.toNumber() + item.startDate.toNumber())}`}
              raffle={item}
              index={index}
              selectRaffle = {selectRaffle}
              publicKey={props.defaultAccount.address}
              walletType={walletType}
              verifiedCollections={props.verifiedCollections}
              endTime = {item.duration.toNumber() + item.startDate.toNumber()}
              raffleCreator={raffleCreator}
              navigate={props.navigate}
            />
            )
          })}
      </div>
  );
  };

  // Purchase Raffle Entry Functionality
  const purchaseRaffleTicket = useCallback( async (ticket, amountPurchased) => {
    // Not available in sample code.

  }, [props.defaultAccount.address, props.allRaffles, walletType])

  // Toggle Between Verified and Unverified
  const toggleVerified = () => setShowVerifiedOnly(!showVerifiedOnly);

  // Search Raffles by NFT Name
  const handleSearch = () => {
    setIsSearching(true);
  };
  const handleClearSearch = () => {
    setIsSearching(false);
    setFilterName('');
    setFilterCollectionName('');
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Search Raffles by Collection Name
  const handleSearchCollection = () => {
    setIsSearchingCollection(true);
  };
  const handleClearSearchCollection = () => {
    setIsSearchingCollection(false);
    setFilterCollectionName('');
  };
  const handleKeyDownCollection = (event) => {
    if (event.key === 'Enter') {
      handleSearchCollection();
    }
  };

  // search by partners
  const handlePartnerSearch = (partnerID, check) => {
    if (check){
      setPartnerFilter(partnerID)
      setFilterByPartner(true);
    }
    else {
      props.setPopup(true)
      props.setPopupState("partnerEmpty")
    }
  };
  const resetPartnerSearch = () => {
    setPartnerFilter('')
    setFilterByPartner(false);
  };

  return (
    <div className="grid   gap-8  relative w-full">
      <p className="bg-[#A7A2A6] sm:w-[30%] text-lg md:text-3xl font-bold text-bold text-dark-gray text-center">
        FEATURED RAFFLES
      </p>
      <div class="w-full h-full sm:flex sm:justify-center sm:items-center flex-col sm:gap-12 sm:flex-row">
        <button onClick={() => {
              if (partnerFilter === '0x8396B098aEe517EFA1049cD7f3e05c48c19b1bae') {
                  resetPartnerSearch();
              } else {
                  handlePartnerSearch('0x8396B098aEe517EFA1049cD7f3e05c48c19b1bae', props.checkIfContains['hasMaxinRaffle']);
              }
          }}
          class={`sm:w-1/5 flex items-center lg:text-2xl px-4 py-1 rounded-t-lg sm:rounded-full ${partnerFilter === '0xd72A258E3428f6e889479C48D07c9C237F7CC332' ? "bg-[#A7A2A6] hover:border-primary-red" : "bg-dark-gray"} font-text font-bold text-bold text-white text-center border sm:border-2 border-primary-yellow hover:bg-[#A7A2A6] truncate`}>
          <img src={MaxinLogo} alt="MaxinImage" class="w-[20%] h-[20%]"/>
          <div className="min-w-[80%]">
            MAXIN'
          </div>
        </button>
        <button onClick={() => {
              if (partnerFilter === '0x39cd103414106b922eb09c7d45df89608b59e887') {
                  resetPartnerSearch();
              } else {
                  handlePartnerSearch('0x39cd103414106b922eb09c7d45df89608b59e887', props.checkIfContains['hasDrillClubRaffle']);
              }
          }}
          class={`sm:w-1/5 flex items-center lg:text-2xl px-4 py-1 sm:rounded-full ${partnerFilter === '0x39cd103414106b922eb09c7d45df89608b59e887' ? "bg-[#A7A2A6] hover:border-primary-red" : "bg-dark-gray"} font-text font-bold text-bold text-white text-center border sm:border-2 border-primary-yellow hover:bg-[#A7A2A6] truncate`}>
          <img src={DrillClubLogo} alt="Drillimage" class="w-[20%] h-[20%]"/>
          <div className="min-w-[80%]">
            DRILL CLUB
          </div>
        </button>
        <button onClick={() => {
              if (partnerFilter === '0x8A953CfE442c5E8855cc6c61b1293FA648BAE472') {
                  resetPartnerSearch();
              } else {
                  handlePartnerSearch('0x8A953CfE442c5E8855cc6c61b1293FA648BAE472', props.checkIfContains['hasPolyDogeRaffle']);
              }
          }}
          class={`sm:w-1/5 flex items-center lg:text-2xl px-4 py-1 sm:rounded-full ${partnerFilter === '0x8A953CfE442c5E8855cc6c61b1293FA648BAE472' ? "bg-[#A7A2A6] hover:border-primary-red" : "bg-dark-gray"} font-text font-bold text-bold text-white text-center border sm:border-2 border-primary-yellow hover:bg-[#A7A2A6] truncate`}>
          <img src={PolyDogeIcon} alt="PolyImage" class="w-[20%] h-[20%]"/>
          <div className="min-w-[80%]">
            POLYDOGE
          </div>
        </button>
        <button onClick={() => {
              if (partnerFilter === '0xd67d0dd4b6e8639f8c51f60bfcb646cb6ed5e993') {
                  resetPartnerSearch();
              } else {
                  handlePartnerSearch('0xd67d0dd4b6e8639f8c51f60bfcb646cb6ed5e993', props.checkIfContains['hasRokoroRaffle']);
              }
          }}
          class={`sm:w-1/5 flex items-center lg:text-2xl px-4 py-1 sm:rounded-full ${partnerFilter === '0xd67d0dd4b6e8639f8c51f60bfcb646cb6ed5e993' ? "bg-[#A7A2A6] hover:border-primary-red" : "bg-dark-gray"} font-text font-bold text-bold text-white text-center border sm:border-2 border-primary-yellow hover:bg-[#A7A2A6] truncate`}>
          <img src={RokoroLogo} alt="RokoroImage" class="w-[20%] h-[20%]"/>
          <div className="min-w-[80%]">
            ROKORO
          </div>
        </button>
        <button onClick={() => {
              if (partnerFilter === '0xfcA466F2fA8E667a517C9C6cfa99Cf985be5d9B1') {
                  resetPartnerSearch();
              } else {
                  handlePartnerSearch('0xfcA466F2fA8E667a517C9C6cfa99Cf985be5d9B1', props.checkIfContains['hasPepeRaffle']);
              }
          }}
          class={`sm:w-1/5 flex items-center lg:text-2xl px-4 py-1 rounded-b-lg sm:rounded-full ${partnerFilter === '0xfcA466F2fA8E667a517C9C6cfa99Cf985be5d9B1' ? "bg-[#A7A2A6] hover:border-primary-red" : "bg-dark-gray"} font-text font-bold text-bold text-white text-center border sm:border-2 border-primary-yellow hover:bg-[#A7A2A6] truncate`}>
          <img src={SPepeLogo} alt="SPEPEImage" class="w-[20%] h-[20%]"/>
          <div className="min-w-[80%]">
            SPEPE
          </div>
        </button>
      </div>
      <div class="flex items-center justify-center">
        {renderFeatured()}
      </div>
      <div class="flex flex-col items-center justify-center">
        <div class="mb-1 flex w-[90%] items-center flex-col pt-8 pb-4 gap-8 md:flex-row">
            {
              toggleLivePast ?
              <>
                <button onClick={showLiveRaffles} class="text-xl py-1 px-4 rounded-full bg-dark-gray font-text font-bold text-bold text-primary-yellow text-center border-2 border-primary-yellow">
                  ACTIVE RAFFLES
                </button>
                <button onClick={showPastRaffles} class="text-xl py-1 px-4 rounded-full font-text font-bold text-bold text-dark-gray text-center hover:text-primary-yellow">
                  PAST RAFFLES
                </button>
              </>
              :
              <>
              <button onClick={showLiveRaffles} class="text-xl py-1 px-4 rounded-full font-text font-bold text-bold text-dark-gray text-center hover:text-primary-yellow">
                ACTIVE RAFFLES
              </button>
              <button onClick={showPastRaffles} class="text-xl py-1 px-4 rounded-full bg-dark-gray font-text font-bold text-bold text-primary-yellow text-center border-2 border-primary-yellow">
                PAST RAFFLES
              </button>
              </>
            }
            <div class="flex flex-col items-center justify-center max-w-[100px] min-w-[100px]">
              <button
                onClick={toggleVerified}
                className={`w-10 h-6 bg-gray rounded-full flex items-center p-1 ${showVerifiedOnly ? 'bg-primary-yellow' : 'bg-gray'} shadow focus:outline-none`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full inline-block ${showVerifiedOnly ? 'transform translate-x-full' : ''}`}
                  style={{ transition: 'transform 0.2s ease-in-out' }}
                ></span>
              </button>
              {
                showVerifiedOnly ?
                <p class="text-xs font-bold text-bold text-primary-yellow text-center">Verified</p>
                :
                <p class="text-xs font-bold text-bold text-gray text-center">All Collections</p>
              }
            </div>
        </div>
        <div class="mb-1 flex w-[90%] items-center flex-col pt-8 pb-4 gap-8 md:flex-row">
          <div className="relative">
            <button className="absolute inset-y-0 left-0 flex items-center pl-3" onClick={handleSearch}>
              <FontAwesomeIcon icon="search" className="text-gray-deep hover:text-primary-yellow"/>
            </button>
            {isSearching && (
              <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleClearSearch}>
                <FontAwesomeIcon icon="times" className="text-gray-deep" />
              </button>
            )}
            <input
              className="bg-gray-light border-2 border-dark-gray rounded-full pl-12 pr-1 py-[2px] text-[16px] font-bold text-gray-deep focus:outline-none"
              type="text"
              placeholder="Search Raffle Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="relative">
            <button className="absolute inset-y-0 left-0 flex items-center pl-3" onClick={handleSearchCollection}>
              <FontAwesomeIcon icon="search" className="text-gray-deep hover:text-primary-yellow"/>
            </button>
            {isSearchingCollection && (
              <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleClearSearchCollection}>
                <FontAwesomeIcon icon="times" className="text-gray-deep" />
              </button>
            )}
            <input
              className="bg-gray-light border-2 border-dark-gray rounded-full pl-12 pr-1 py-[2px] text-[16px] font-bold text-gray-deep focus:outline-none"
              type="text"
              placeholder="Search By Collection"
              value={filterCollectionName}
              onChange={(e) => setFilterCollectionName(e.target.value)}
              onKeyDown={handleKeyDownCollection}
            />
          </div>
        </div>
        <div class="flex items-center justify-center mb-8 w-[90vw]">
          {
            toggleLivePast ?
            renderLiveRaffles()
            :
            renderPastRaffles()
          }
        </div>
      </div>
    </div>
  )

}

export default RafflesHome;
