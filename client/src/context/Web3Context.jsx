import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  // Function to Connect Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request Account Access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Get Balance (Optional but good for UI)
        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(bal));
        
        return accounts[0];
      } catch (error) {
        console.error("Connection Failed", error);
        alert("Failed to connect wallet.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Check if wallet is already connected on reload
  useEffect(() => {
    if (window.ethereum) {
      // 1. Check existing connection
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });

      // 2. Listen for Account Changes (The Fix)
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]); // Auto-update state
        } else {
          setAccount(null); // User disconnected
        }
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, balance, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};