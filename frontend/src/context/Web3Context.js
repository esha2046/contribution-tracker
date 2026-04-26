import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../utils/constants';
import { CONTRIBUTION_TRACKER_ABI } from '../utils/contractABI';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => window.ethereum !== undefined;

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);

      // Initialize contract
      if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRIBUTION_TRACKER_ABI,
          web3Signer
        );
        setContract(contractInstance);
      }
    } catch (err) {
      setError(err.message);
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    setError(null);
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet]);

  // Check for previous connection
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const web3Signer = await web3Provider.getSigner();
          const network = await web3Provider.getNetwork();

          setProvider(web3Provider);
          setSigner(web3Signer);
          setAccount(accounts[0]);
          setChainId(network.chainId);

          if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
            const contractInstance = new ethers.Contract(
              CONTRACT_ADDRESS,
              CONTRIBUTION_TRACKER_ABI,
              web3Signer
            );
            setContract(contractInstance);
          }
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();
  }, []);

  const value = {
    account,
    provider,
    signer,
    contract,
    chainId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isConnected: account !== null,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
