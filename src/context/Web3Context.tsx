import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { ethers } from 'ethers';
import {
  CardData,
  INITIAL_DEMO_CARDS,
  getStoredContractAddress,
  setStoredContractAddress,
  getStoredContractABI,
  setStoredContractABI,
  contractAbi as defaultAbi,
} from '../contract/config';

interface Web3ContextType {
  account: string | null;
  shortAccount: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  networkName: string;
  hasMetaMask: boolean;
  contractAddress: string;
  isConfigured: boolean;
  isOwner: boolean;
  ownerAddress: string | null;
  isDemoMode: boolean;
  ethBalance: string;
  allCards: CardData[];
  myCards: CardData[];
  isLoadingCards: boolean;
  lastDrawnCard: CardData | null;
  txPending: boolean;
  txHash: string | null;
  error: string | null;
  clearError: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  toggleDemoMode: (enabled?: boolean) => void;
  updateContractAddress: (address: string) => void;
  updateContractABI: (abiStr: string) => void;
  resetToDefaultABI: () => void;
  refreshGameData: () => Promise<void>;
  drawCard: () => Promise<CardData | null>;
  addCard: (name: string, image: string, hp: number, attack: number, rarity: string) => Promise<boolean>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

const DEMO_ACCOUNT = '0x71C...DemoOwner';
const DEMO_STORAGE_CARDS = 'anime_demo_all_cards';
const DEMO_STORAGE_MY_CARDS = 'anime_demo_my_cards';

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>('Unknown');
  const [contractAddress, setContractAddress] = useState<string>(() => getStoredContractAddress());
  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Financial / Balance state (Real ETH)
  const [ethBalance, setEthBalance] = useState<string>('0.0000 ETH');

  const [allCards, setAllCards] = useState<CardData[]>(INITIAL_DEMO_CARDS);
  const [myCards, setMyCards] = useState<CardData[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith('anime_user_cards_'));
        for (const k of keys) {
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        }
      } catch {}
    }
    return [];
  });

  const isRefreshingRef = useRef(false);
  const allCardsRef = useRef<CardData[]>(INITIAL_DEMO_CARDS);
  allCardsRef.current = allCards;

  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [lastDrawnCard, setLastDrawnCard] = useState<CardData | null>(null);
  const [txPending, setTxPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasMetaMask = typeof window !== 'undefined' && Boolean((window as any).ethereum);

  const clearError = () => setError(null);

  // Short wallet address helper
  const shortAccount = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  const isConfigured = Boolean(
    contractAddress && ethers.isAddress(contractAddress)
  );

  // Load demo state from localStorage
  const loadDemoCards = useCallback(() => {
    if (typeof window === 'undefined') return;
    const storedAll = localStorage.getItem(DEMO_STORAGE_CARDS);
    const storedMy = localStorage.getItem(DEMO_STORAGE_MY_CARDS);

    if (storedAll) {
      try {
        setAllCards(JSON.parse(storedAll));
      } catch {
        setAllCards(INITIAL_DEMO_CARDS);
      }
    } else {
      localStorage.setItem(DEMO_STORAGE_CARDS, JSON.stringify(INITIAL_DEMO_CARDS));
      setAllCards(INITIAL_DEMO_CARDS);
    }

    if (storedMy) {
      try {
        setMyCards(JSON.parse(storedMy));
      } catch {
        setMyCards([]);
      }
    } else {
      setMyCards([]);
    }
    setEthBalance('10.0000 ETH (Demo)');
  }, []);

  // Update Contract Address
  const updateContractAddress = (address: string) => {
    const clean = address.trim();
    setStoredContractAddress(clean);
    setContractAddress(clean);
  };

  // Update Contract ABI
  const updateContractABI = (abiStr: string) => {
    setStoredContractABI(abiStr);
  };

  const resetToDefaultABI = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('anime_card_game_custom_abi');
    }
  };

  // Helper to get ethers contract instance
  const getContract = useCallback(
    async (withSigner = false) => {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }
      if (!isConfigured) {
        throw new Error('Contract address is not configured yet');
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const abi = getStoredContractABI();

      if (withSigner) {
        const signer = await provider.getSigner();
        return new ethers.Contract(contractAddress, abi, signer);
      }
      return new ethers.Contract(contractAddress, abi, provider);
    },
    [contractAddress, isConfigured]
  );

  // Refresh data from contract or demo storage
  const refreshGameData = useCallback(async () => {
    if (isDemoMode) {
      loadDemoCards();
      return;
    }

    if (!account) {
      return;
    }

    if (isRefreshingRef.current) {
      return;
    }
    isRefreshingRef.current = true;

    // Helper timeout wrapper to guarantee execution never hangs
    const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
      ]);
    };

    // 1. Fetch real ETH balance from blockchain
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const bal = await withTimeout(provider.getBalance(account), 3000, null);
        if (bal !== null) {
          const ethStr = ethers.formatEther(bal);
          const formatted = parseFloat(ethStr).toFixed(4) + ' ETH';
          setEthBalance(formatted);
        }
      } catch (balErr) {
        console.warn('Could not read ETH balance:', balErr);
      }
    }

    // If contract not configured yet, stop here
    if (!isConfigured) {
      return;
    }

    setIsLoadingCards(true);
    setError(null);

    // Hard safety timer to guarantee isLoadingCards turns false even on slow networks
    const safetyTimer = setTimeout(() => {
      setIsLoadingCards(false);
    }, 4500);

    try {
      const contract = await getContract(false);

      // Check owner with timeout
      try {
        const contractOwner = await withTimeout(contract.owner(), 2500, null);
        if (contractOwner) {
          setOwnerAddress(contractOwner);
          if (account) {
            setIsOwner(contractOwner.toLowerCase() === account.toLowerCase());
          }
        }
      } catch (err) {
        console.warn('Could not read owner():', err);
      }

      // Read total cards with timeout
      let total = 0;
      try {
        const totalBN = await withTimeout(contract.getTotalCards(), 2500, null);
        if (totalBN !== null) {
          total = Number(totalBN);
        }
      } catch (err) {
        console.warn('Could not read getTotalCards():', err);
      }

      let fetchedCards: CardData[] = [];
      if (total > 0) {
        // Fetch all cards in parallel instead of slow serial loop
        const cardPromises = Array.from({ length: total }, (_, idx) => {
          const cardId = idx + 1;
          return withTimeout(
            contract.getCard(cardId).then((c: any) => ({
              id: Number(c.id),
              name: c.name,
              image: c.image,
              hp: Number(c.hp),
              attack: Number(c.attack),
              rarity: c.rarity,
              exists: c.exists,
            })),
            3000,
            null
          ).catch(() => null);
        });

        const results = await Promise.all(cardPromises);
        fetchedCards = results.filter((c): c is CardData => c !== null);
      }

      if (fetchedCards.length > 0) {
        setAllCards(fetchedCards);
      }

      // Read player cards: Try non-blocking eth_call getCardsOf(account) or getMyCards({ from: account })
      let playerCardIds: (bigint | number)[] = [];
      try {
        if (typeof contract.getCardsOf === 'function') {
          playerCardIds = await withTimeout(contract.getCardsOf(account), 3000, []);
        }
      } catch (err1) {
        console.warn('contract.getCardsOf failed:', err1);
      }

      if (!playerCardIds || playerCardIds.length === 0) {
        try {
          playerCardIds = await withTimeout(contract.getMyCards({ from: account }), 3000, []);
        } catch (err2) {
          console.warn('contract.getMyCards({ from: account }) failed:', err2);
        }
      }

      const userCards: CardData[] = [];
      const cardSource = fetchedCards.length > 0 ? fetchedCards : allCards;

      if (playerCardIds && playerCardIds.length > 0) {
        for (const idBN of playerCardIds) {
          const cId = Number(idBN);
          const cardDetail = cardSource.find((c) => c.id === cId);
          if (cardDetail) {
            userCards.push(cardDetail);
          } else {
            try {
              const singleCard = await withTimeout(contract.getCard(cId), 2000, null);
              if (singleCard) {
                userCards.push({
                  id: Number(singleCard.id),
                  name: singleCard.name,
                  image: singleCard.image,
                  hp: Number(singleCard.hp),
                  attack: Number(singleCard.attack),
                  rarity: singleCard.rarity,
                  exists: singleCard.exists,
                });
              }
            } catch (err) {
              console.error(`Error loading player card #${cId}:`, err);
            }
          }
        }
      }

      // Load local cache to ensure no drawn cards are ever missed due to RPC delay
      const cacheKey = `anime_user_cards_${account.toLowerCase()}`;
      const localCached = localStorage.getItem(cacheKey);
      let cachedList: CardData[] = [];
      if (localCached) {
        try {
          cachedList = JSON.parse(localCached);
        } catch {}
      }

      // If userCards has cards, sync and update cache
      if (userCards.length > 0) {
        setMyCards(userCards);
        localStorage.setItem(cacheKey, JSON.stringify(userCards));
      } else if (cachedList.length > 0) {
        // RPC might be lagging; keep cached list so player doesn't see an empty collection
        setMyCards(cachedList);
      } else {
        setMyCards([]);
      }
    } catch (err: any) {
      console.error('Error refreshing game data:', err);
      // Fallback to cache if error
      const cacheKey = `anime_user_cards_${account.toLowerCase()}`;
      const localCached = localStorage.getItem(cacheKey);
      if (localCached) {
        try {
          setMyCards(JSON.parse(localCached));
        } catch {}
      }
    } finally {
      clearTimeout(safetyTimer);
      setIsLoadingCards(false);
      isRefreshingRef.current = false;
    }
  }, [account, isConfigured, isDemoMode, getContract, loadDemoCards]);

  // Connect wallet
  const connectWallet = async () => {
    setError(null);
    if (!hasMetaMask) {
      setError('MetaMask not detected. Please install MetaMask or use Demo Mode.');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        const userAddr = accounts[0];
        setAccount(userAddr);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
        setNetworkName(network.name === 'unknown' ? `Chain ${network.chainId}` : network.name);

        // Fetch ETH balance immediately
        try {
          const bal = await provider.getBalance(userAddr);
          const ethStr = ethers.formatEther(bal);
          setEthBalance(parseFloat(ethStr).toFixed(4) + ' ETH');
        } catch {}
      }
    } catch (err: any) {
      console.error('Error connecting MetaMask:', err);
      setError(err?.message || 'User rejected MetaMask connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsOwner(false);
    setOwnerAddress(null);
    setMyCards([]);
    setEthBalance('0.0000 ETH');
  };

  // Toggle demo mode
  const toggleDemoMode = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !isDemoMode;
    setIsDemoMode(nextVal);
    if (nextVal) {
      setAccount(DEMO_ACCOUNT);
      setIsOwner(true);
      setOwnerAddress(DEMO_ACCOUNT);
      loadDemoCards();
    } else {
      if (account === DEMO_ACCOUNT) {
        setAccount(null);
        setIsOwner(false);
        setOwnerAddress(null);
        setMyCards([]);
        setEthBalance('0.0000 ETH');
      }
    }
  };

  // Draw Card
  const drawCard = async (): Promise<CardData | null> => {
    setError(null);
    setTxHash(null);

    // Demo Mode Logic
    if (isDemoMode) {
      if (allCards.length === 0) {
        setError('No cards available to draw');
        return null;
      }
      setTxPending(true);
      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const drawn = allCards[randomIndex];

      const updatedMyCards = [...myCards, drawn];
      setMyCards(updatedMyCards);
      localStorage.setItem(DEMO_STORAGE_MY_CARDS, JSON.stringify(updatedMyCards));

      setLastDrawnCard(drawn);
      setTxPending(false);
      return drawn;
    }

    // On-Chain Web3 Logic
    if (!account) {
      setError('Please connect MetaMask first');
      return null;
    }

    if (!isConfigured) {
      setError('Please configure your deployed Contract Address in settings first');
      return null;
    }

    try {
      setTxPending(true);
      const contract = await getContract(true);

      const tx = await contract.drawCard();
      setTxHash(tx.hash);
      const receipt = await tx.wait();

      // Read CardDrawn event from receipt logs
      let drawnCardId: number | null = null;

      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
            if (parsedLog && parsedLog.name === 'CardDrawn') {
              drawnCardId = Number(parsedLog.args.cardId);
              break;
            }
          } catch (e) {
            // Not this event, continue
          }
        }
      }

      // If we got the ID directly or fallback
      let cardData: CardData | null = null;
      if (drawnCardId) {
        const rawCard = await contract.getCard(drawnCardId);
        cardData = {
          id: Number(rawCard.id),
          name: rawCard.name,
          image: rawCard.image,
          hp: Number(rawCard.hp),
          attack: Number(rawCard.attack),
          rarity: rawCard.rarity,
          exists: rawCard.exists,
        };
      } else {
        // Fallback: pick from allCards
        const pool = allCards.length > 0 ? allCards : INITIAL_DEMO_CARDS;
        cardData = pool[Math.floor(Math.random() * pool.length)];
      }

      if (cardData) {
        setLastDrawnCard(cardData);

        // INSTANT COLLECTION UPDATE: Immediately add to myCards state & cache!
        setMyCards((prev) => {
          const updated = [...prev, cardData!];
          const cacheKey = `anime_user_cards_${account.toLowerCase()}`;
          localStorage.setItem(cacheKey, JSON.stringify(updated));
          return updated;
        });
      }

      // Refresh cards and ETH balance from contract in background
      await refreshGameData();
      return cardData;
    } catch (err: any) {
      console.error('Error drawing card:', err);
      const msg = err?.reason || err?.message || 'Transaction failed';
      setError(msg);
      return null;
    } finally {
      setTxPending(false);
    }
  };

  // Add Card (Admin)
  const addCard = async (
    name: string,
    image: string,
    hp: number,
    attack: number,
    rarity: string
  ): Promise<boolean> => {
    setError(null);
    setTxHash(null);

    if (isDemoMode) {
      setTxPending(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newCard: CardData = {
        id: allCards.length + 1,
        name,
        image,
        hp,
        attack,
        rarity,
        exists: true,
      };
      const updated = [...allCards, newCard];
      setAllCards(updated);
      localStorage.setItem(DEMO_STORAGE_CARDS, JSON.stringify(updated));
      setTxPending(false);
      return true;
    }

    if (!account) {
      setError('Please connect MetaMask first');
      return false;
    }

    if (!isConfigured) {
      setError('Contract address is not configured');
      return false;
    }

    try {
      setTxPending(true);
      const contract = await getContract(true);
      const tx = await contract.addCard(name, image, hp, attack, rarity);
      setTxHash(tx.hash);
      await tx.wait();
      await refreshGameData();
      return true;
    } catch (err: any) {
      console.error('Error adding card:', err);
      const msg = err?.reason || err?.message || 'Transaction failed';
      setError(msg);
      return false;
    } finally {
      setTxPending(false);
    }
  };

  // Listen to MetaMask account & chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainHex: string) => {
      setChainId(parseInt(chainHex, 16));
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    // Initial check if already connected
    ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        }
      })
      .catch((err: any) => console.log('Account check error:', err));

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // When account or contractAddress changes, reload data
  useEffect(() => {
    if (isDemoMode) {
      loadDemoCards();
    } else if (account) {
      refreshGameData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, contractAddress, isConfigured, isDemoMode]);

  return (
    <Web3Context.Provider
      value={{
        account,
        shortAccount,
        isConnected: Boolean(account),
        isConnecting,
        chainId,
        networkName,
        hasMetaMask,
        contractAddress,
        isConfigured,
        isOwner,
        ownerAddress,
        isDemoMode,
        ethBalance,
        allCards,
        myCards,
        isLoadingCards,
        lastDrawnCard,
        txPending,
        txHash,
        error,
        clearError,
        connectWallet,
        disconnectWallet,
        toggleDemoMode,
        updateContractAddress,
        updateContractABI,
        resetToDefaultABI,
        refreshGameData,
        drawCard,
        addCard,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
