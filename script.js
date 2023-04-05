// https://medium.com/@natelapinski/how-to-send-ether-from-ethers-js-4e02f6fa24f2
// https://ethereum.stackexchange.com/questions/139213/differences-between-ethers-getcontractfactory-new-ethers-contract-and-ne

//VVI: By Patrick Collins https://betterprogramming.pub/everything-you-need-to-know-about-fullstack-web3-94c0f1b18019

const connectBtn = document.getElementById("connectButton");
const fundBtn = document.getElementById("fundButton");
const balanceBtn = document.getElementById("balanceButton");
const withdrawBtn = document.getElementById("withdrawButton");

import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./constants.js";

async function connect() {
  if (window.ethereum) {
    console.log("MetaMask Hai!");

    try {
      await ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (err) {
      console.log(err);
    }

    connectBtn.innerText = "Connected!";
  } else {
    connectBtn.innerText = "Please install metamask!";
  }
}

// fund function

//ERROR : https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/546
const fund = async () => {
  if (window.ethereum) {
    //To send a transaction we need:
    // provider / connection to blockchain
    // signer / wallet /someone with some gas
    // contract that we are interacting with
    // ^ ABI & Address
    const ethAmount = document.getElementById("ethAmount").value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txRes = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(txRes, provider);
      document.getElementById("ethAmount").value = "";
      //we can either listen for the tx to be mined
      //OR listen for event ->which we havent learned yet
    } catch (err) {
      console.log(err);
    }
  } else {
    fundBtn.innerHTML = "Please install MetaMask";
  }
};

//IMP: https://ethereum.stackexchange.com/questions/133586/what-is-difference-between-two-mine-waiting-methods
//provider.once is the same as contract.once
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
      //getBalance returns a BigNumber(Wei) and formaEther returns numeric string value in Ether
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceBtn.innerHTML = "Please install MetaMask";
  }
}

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error);
    }
  } else {
    withdrawBtn.innerHTML = "Please install MetaMask";
  }
}

connectBtn.addEventListener("click", connect);

fundBtn.addEventListener("click", fund);

balanceBtn.addEventListener("click", getBalance);

withdrawBtn.addEventListener("click", withdraw);

// withdraw function
