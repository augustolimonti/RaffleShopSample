import React, { useCallback, useState, useEffect, useRef } from 'react';
import axios from "axios";
import RafflesHome from './RafflesHome'
import MaxinLogo from '../img/maxinLogo.png'
import PolyDogeIcon from "../img/polyDogeIcon.png";
import DrillClubLogo from '../img/drillClubLogo.png'
import RokoroLogo from '../img/rokoroLogo.png'
import Failed from "../img/failedtransaction.png";
import PoweredBy from "../img/poweredBy.png"
import { Checkmark } from 'react-checkmark';
import { useAccount} from 'wagmi'
import RaffleContractABI from '../Components/raffleContractABI.json';
import {ethers} from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlus, faHouse, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { DynamicWidget } from '@dynamic-labs/sdk-react';
import menuIcon from "../img/burger-menu.svg";
import { Routes, Route, useNavigate } from 'react-router-dom';


const Nav = ({ children, ...props }) => {
  // Logo variables
  const logoList = [MaxinLogo, PolyDogeIcon, DrillClubLogo, RokoroLogo];
  const [currentLogo, setCurrentLogo] = useState(0);
  const [opacity, setOpacity] = useState(1);

  // page variable
  const [page, setPage] = useState("Home")
  const navigate = useNavigate();
  const [showScroll, setShowScroll] = useState(false)

  // mobile variables
  const [showMenu, setShowMenu] = useState(false);
  const handleShowMenu = (val) => {
    setShowMenu(val || !showMenu);
  };

  // popup variables
  const [popup, setPopup] = useState(false)
  const [popupState, setPopupState] = useState();
  const [popupArray, setPopupArray] = useState([])
  const timeoutRef = useRef();

  // wallet variables
  let defaultAccount = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected })
    },
  });
  defaultAccount = useAccount({
    onDisconnect() {
      console.log('Disconnected')
    },
  })

  // verified collections
  const [verifiedCollections, setVerifiedCollections] = useState([])
  const [verifiedUsers, setVerifiedUsers] = useState()

  // raffle variables
  const [allRaffles, setAllRaffles] = useState([])
  const [allSelectedRaffles, setAllSelectedRaffles] = useState()
  const [updatedRaffles, setUpdatedRaffles] = useState(true)
  const [checkIfContains, setCheckIfContains] = useState(
    {
      hasMaxinRaffle: false,
      hasDrillClubRaffle: false,
      hasPolyDogeRaffle: false,
      hasRokoroRaffle: false,
      hasPepeRaffle: false
    }
  )

  // loading variables
  const [isLoading, setIsLoading] = useState(true)

  // get all Verified Collections
  useEffect(() => {
    var data = JSON.stringify({
      action: "getAllVerifiedCollections"
    });

    var config = {
      // not available in sample code.
    };

    axios(config)
      .then(function (response) {
        let tempVerifiedCollections = []
        for (const collection of response.data.verifiedCollections){
          tempVerifiedCollections.push(collection[2].toLowerCase())
        }
        setVerifiedCollections(tempVerifiedCollections)
      })
      .catch(function (error) {
        console.log(error)
      });
  }, []);

  // get all Verified Users
  useEffect(() => {
    var data = JSON.stringify({
      'action': 'getVerifiedUsers'
    });

    var config = {
      // not available in sample code.
    };

    axios(config)
      .then(function (response) {
        let verifedUsersTemp = {}
        for (const userData of response.data.verifiedUsers){
          verifedUsersTemp[userData[0]] = {
            twitterHandle: userData[1],
            discordHandle: userData[2],
            discordPFP: userData[4],
            twitterPFP: userData[5]
          }
        }
        console.log(verifedUsersTemp)
        setVerifiedUsers(verifedUsersTemp)
      })
      .catch(function (error) {
        console.log(error)
      });

  }, []);

  //instantiate raffle contract
  const raffleContractAddress = '0xc910443f676b9af2e7d8B57b8565bc4DF8f5dcED'
  const provider = ethers.getDefaultProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`);
  const raffleContract = new ethers.Contract(raffleContractAddress, RaffleContractABI, provider);

  // toggle to create page
  const handleCreateRaffleClick = useCallback(() => {
    setShowMenu(false)
    navigate("/create")
  }, []);

  // toggle to user profile page
  const handleUserProfileClick = useCallback(() => {
    if(defaultAccount.address){
      setShowMenu(false)
      navigate(`/profile/user`)
    }
    else{
      setPopup(true)
      setPopupState("notSignedIn")
    }
  }, [defaultAccount]);

  // toggle to home page
  const handleHomePageClick = useCallback(() => {
    setShowMenu(false)
    navigate("/")
  }, []);

  // function to alternate logo between partners
  useEffect(() => {
    const timer = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setCurrentLogo((currentLogo + 1) % logoList.length);
        setOpacity(1);
      }, 1000);
    }, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [currentLogo]);

  // get all raffles (both live and not live)
  useEffect(() => {
    const fetchData = async () => {
      const raffles = await raffleContract.getAllRaffles()
      if (raffles) {
        setIsLoading(true); // Start loading
        let tempAllRaffles = [];
        let tempSelectedRaffles = {}
        for (const raffle of raffles) {
          if (raffle.nftContractAddress === '0x8396B098aEe517EFA1049cD7f3e05c48c19b1bae' && raffle.status === 0 && checkIfContains['hasMaxinRaffle'] === false){
            checkIfContains['hasMaxinRaffle'] = true
          }
          else if (raffle.nftContractAddress === '0x39cd103414106b922eb09c7d45df89608b59e887' && raffle.status === 0 && checkIfContains['hasDrillClubRaffle'] === false){
            checkIfContains['hasDrillClubRaffle'] = true
          }
          else if (raffle.nftContractAddress === '0xd67d0dd4b6e8639f8c51f60bfcb646cb6ed5e993' && raffle.status === 0 && checkIfContains['hasRokoroRaffle'] === false){
            checkIfContains['hasRokoroRaffle'] = true
          }

          if (raffle.tokenAddress === '0x8A953CfE442c5E8855cc6c61b1293FA648BAE472' && raffle.status === 0 && checkIfContains['hasPolyDogeRaffle'] === false){
            checkIfContains['hasPolyDogeRaffle'] = true
          }
          else if (raffle.tokenAddress === '0xfcA466F2fA8E667a517C9C6cfa99Cf985be5d9B1' && raffle.status === 0 && checkIfContains['hasPepeRaffle'] === false){
            checkIfContains['hasPepeRaffle'] = true
          }

          try {
            var data = JSON.stringify({
              action: "getRaffleExtraData",
              collectionAddress: raffle.nftContractAddress,
              raffleID: raffles.indexOf(raffle)
            });
            var config = {
              // not available in sample code.
            };

            const response = await axios(config);
            const extradata = JSON.parse(response.data.extradata)
            const addedRaffleData = {
              collectionName: extradata[0],
              nftName: extradata[4],
              imageLink: extradata[2],
              verified: extradata[3],
              featured: extradata[5],
              endDate: extradata[6],
              raffleID: raffles.indexOf(raffle)
            };
            const updatedRaffle = {
              ...raffle,
              ...addedRaffleData
            };
            tempAllRaffles.push(updatedRaffle)
            tempSelectedRaffles[raffles.indexOf(raffle)] = updatedRaffle

          } catch (error) {
            console.log(error);
          }
        }
        tempAllRaffles.sort((a, b) => {
          if (a.featured !== b.featured) {
            return b.featured - a.featured;  // featured raffles first
          } else {
            return (a.startDate.toNumber() + a.duration.toNumber()) - (b.startDate.toNumber() + b.duration.toNumber());  // then, sort by the end time
          }
        });
        setAllRaffles(tempAllRaffles);
        setAllSelectedRaffles(tempSelectedRaffles)
        setIsLoading(false);
      }
    };

    fetchData();
  }, [updatedRaffles]);

  useEffect(() => {
    if (popupState === 'transactionError' || popupState === 'transferApproved'
          || popupState === 'raffleCreated' || popupState === 'rafflePurchased'
          || popupState === 'wrongAmount' || popupState === 'cancelledRaffle' || popupState === 'partnerEmpty' || popupState === 'notSignedIn' || popupState === 'cantBeFeatured'){
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        resetPopup(popupState);
      }, 5000);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [popupState, popup])

  const renderPopup = () => {
    if (popupState === "transferApprovalInProgress") {
      // clearTimeout(timeoutRef.current);
      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <div className="bg-gray rounded-md p-4 flex items-center">
            <img
              className="h-5 w-5 mr-4 animate-spin"
              src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"
              alt="Loading"
            />
            <p className="text-white font-lekton">Approval in Progress - please follow the prompt on your wallet.</p>
          </div>
        </div>
      );
    }
    else if(popupState === "transactionError"){
      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <img
                className="h-5 w-5 mr-4"
                src={Failed}
                alt="Loading"
              />
              <p className="text-white font-lekton mr-2">Transaction Failed. Please Try Again.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if (popupState === "transferApproved") {
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <Checkmark size='24px'/>
              <p className="text-white font-lekton ml-2 mr-2">NFT approved to transfer! Fill out the raffle parameters to raffle your NFT.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if (popupState === "raffleCreationInProgress") {
      // clearTimeout(timeoutRef.current);
      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <div className="bg-gray rounded-md p-4 flex items-center">
            <img
              className="h-5 w-5 mr-4 animate-spin"
              src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"
              alt="Loading"
            />
            <p className="text-white font-lekton">Raffle Creation in Progress - please follow the prompt on your wallet.</p>
          </div>
        </div>
      );
    }
    else if (popupState === "raffleCreated") {
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <Checkmark size='24px'/>
              <p className="text-white font-lekton ml-2 mr-2">Raffle Created! Head over to your profile to view live raffle.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if (popupState === "purchaseInProgress") {
      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <div className="bg-gray rounded-md p-4 flex items-center">
            <img
              className="h-5 w-5 mr-4 animate-spin"
              src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"
              alt="Loading"
            />
            <p className="text-white font-lekton">Purchase in Progress - please follow the prompt on your wallet.</p>
          </div>
        </div>
      );
    }
    else if (popupState === "rafflePurchased") {
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <Checkmark size='24px'/>
              <p className="text-white font-lekton ml-2 mr-2">Raffle Tickets Purchased!</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if(popupState === "wrongAmount"){
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <img
                className="h-5 w-5 mr-4"
                src={Failed}
                alt="Loading"
              />
              <p className="text-white font-lekton mr-2">Amount Entered Invalid. Please Try Again.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if (popupState === "cancellationInProgress") {
      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <div className="bg-gray rounded-md p-4 flex items-center">
            <img
              className="h-5 w-5 mr-4 animate-spin"
              src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"
              alt="Loading"
            />
            <p className="text-white font-lekton">Cancellation in Progress - please follow the prompt on your wallet.</p>
          </div>
        </div>
      );
    }
    else if (popupState === "cancelledRaffle") {
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <Checkmark size='24px'/>
              <p className="text-white font-lekton ml-2 mr-2">Raffle has been Cancelled! Your NFT has been safely returned.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if(popupState === "notSignedIn"){
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <img
                className="h-5 w-5 mr-4"
                src={Failed}
                alt="Loading"
              />
              <p className="text-white font-lekton mr-2">Must be signed in to your wallet to access profile. Connect your wallet and try again.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if(popupState === "partnerEmpty"){
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <img
                className="h-5 w-5 mr-4"
                src={Failed}
                alt="Loading"
              />
              <p className="text-white font-lekton mr-2">Currently no live raffles for this collection available.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }
    else if(popupState === "cantBeFeatured"){
      // setTimeout(() => {
      //   resetPopup(popupState);
      // }, 5000);

      return (
        <div style={{position:'fixed', bottom: 35, right: 35, zIndex:100}}>
          <>
            <div className="bg-gray rounded-md rounded-b-none p-4 flex items-center">
              <img
                className="h-5 w-5 mr-4"
                src={Failed}
                alt="Loading"
              />
              <p className="text-white font-lekton mr-2">This collection is not verified within our system and therefore cannot be a featured raffle.</p>
              <button
                onClick={() => {
                  resetPopup();
                }}
                className="text-white font-lekton bg-gray rounded-full w-5 h-5 flex items-center justify-center hover:bg-dark-gray"
              >
                &#10761;
              </button>
            </div>
            <div className="relative w-full h-1 bg-primary-red bg-opacity-30">
              <div className="absolute left-0 top-0 h-1 bg-primary-red animate-progress" />
            </div>
          </>
        </div>
      );
    }

  };
  const resetPopup = () => {
    setPopup(false);
    setPopupState();
  };

  // functionality to render scroll back up button.
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true)
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false)
      }
    };

    window.addEventListener('scroll', checkScrollTop)

    return () => {
      window.removeEventListener('scroll', checkScrollTop)
    };
  }, [showScroll]);

  // functionality to scroll back to top of page.
  const scrollTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
      <div className="flex flex-col h-full flex-grow gap-8">
        <div className="top-0 right-0 sticky z-30 w-full">
          <div className="header flex justify-between items-center sm:w-full pl-5 pr-10 sm:px-7 relative">
            <div class="h-[80%] flex items-center justify-center">
              <img src={logoList[currentLogo]} alt="CurrentLogo" style={{ opacity: opacity, transition: 'opacity 1s' }} class="max-h-full max-w-full hover:cursor-pointer" onClick={() => {navigate("/")}} />
            </div>
            <div
              className={`fixed  flex flex-col items-center justify-start gap-8 p-8 w-[70%] z-20 right-0 h-screen sm:sticky top-0 bg-gray-deep/90 sm:bg-transparent transition-all ${
                showMenu ? "sm:hidden" : "opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto sm:hidden"
              }`}
            >
              {
                showMenu ?
                <>
                  <DynamicWidget />
                  <div class="w-full h-[10%] flex flex-col text-gilroy-bold uppercase text-white items-center justify-center hover:cursor-pointer">
                    POWERED BY
                    <img src={MaxinLogo} alt="PoweredBy" class="max-h-full max-w-full" onClick={() => window.open("https://discord.gg/p77QeCs6qs")} />
                  </div>
                  <button className="flex gap-4 items-center w-full font-gilroy-regular text-lg text-primary-yellow px-4 py-2 rounded-lg drop-shadow-lg border border-white hover:bg-gray-100">
                    <FontAwesomeIcon icon={faPlus} />
                    <div>Create Raffle</div>
                  </button>
                  <button className="flex gap-4 items-center w-full font-gilroy-regular text-lg text-primary-yellow px-4 py-2 rounded-lg drop-shadow-lg border border-white hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUser} />
                    <div>My Profile</div>
                  </button>
                  <button className="flex gap-4 items-center w-full font-gilroy-regular text-lg text-primary-yellow px-4 py-2 rounded-lg drop-shadow-lg border border-white hover:bg-gray-100"  onClick={handleHomePageClick}>
                    <FontAwesomeIcon icon={faHouse} />
                    <div>Raffle Home</div>
                  </button>
                  <button className="flex gap-4 items-center font-gilroy-bold text-lg text-primary-yellow px-4 py-2 rounded-full drop-shadow-lg border border-white hover:bg-gray-100"  onClick={() => {setShowMenu(false)}}>
                    X
                  </button>
                </>
                :
                ""
              }
            </div>
            <div onClick={handleShowMenu} className="sm:hidden h-auto">
              <img className=" cursor-pointer" src={menuIcon} alt="menu button" />
            </div>
            <div className=" hidden h-full sm:flex sm:items-center sm:justify-center sm:gap-4">
              <button className="hidden sm:flex items-center bg-dark-gray font-gilroy-regular text-2xl text-primary-yellow px-4 py-[7px] rounded-lg drop-shadow-lg border border-white hover:bg-gray-100">
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <div>
                <DynamicWidget />
              </div>
              <button className="hidden sm:flex bg-dark-gray items-center font-gilroy-regular text-md text-primary-yellow p-3 drop-shadow-lg rounded-full border border-white hover:bg-gray">
                <FontAwesomeIcon icon={faUser} />
              </button>
            </div>
          </div>
        </div>
        <div className={`px-2 h-full ${showMenu ? "blur-lg sm:blur-none" : ""}`}>
          {popup ? renderPopup(): ""}
          {isLoading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="loader"></div>
            </div>
          )
          :
          <Routes>
            <Route path="/" element={<RafflesHome
              defaultAccount = {defaultAccount}
              setPage={setPage}
              allRaffles={allRaffles}
              allSelectedRaffles={allSelectedRaffles}
              raffleContract = {raffleContract}
              raffleContractABI = {RaffleContractABI}
              raffleContractAddress = {raffleContractAddress}
              provider={props.provider}
              setPopup={setPopup}
              setPopupState={setPopupState}
              setPopupArray={setPopupArray}
              resetPopup={resetPopup}
              verifiedCollections={verifiedCollections}
              verifiedUsers={verifiedUsers}
              checkIfContains={checkIfContains}
              navigate={navigate}
            />} />
          </Routes>
          }
        </div>
        <div className="hidden fixed bottom-12 right-2 h-[4vh] w-[4vw] z-50 md:block hover:cursor-pointer">
            <img src={PoweredBy} alt="logo" onClick={() => window.open("https://discord.gg/p77QeCs6qs")}/>

        </div>
        {showScroll &&
          <FontAwesomeIcon onClick={scrollTop} icon={faArrowUp} className="fixed bottom-6 left-2 w-[4vw] z-50  py-4 rounded-full bg-gray text-white hover:cursor-pointer hover:bg-opacity-50" />
        }
      </div>
  );

}

export default Nav;
