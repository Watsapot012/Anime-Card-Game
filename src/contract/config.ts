import contractAbi from './abi.json';

export interface CardData {
  id: number;
  name: string;
  image: string;
  hp: number;
  attack: number;
  rarity: 'Common' | 'Rare' | 'SR' | 'SSR' | string;
  exists: boolean;
}

export const DEFAULT_CONTRACT_ADDRESS = '0xc74eaa220ee8dadcf4372b7b1ab50299efd99195';

export const CONTRACT_STORAGE_KEY = 'anime_card_game_contract_address';
export const ABI_STORAGE_KEY = 'anime_card_game_custom_abi';

export function getStoredContractAddress(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CONTRACT_STORAGE_KEY);
    if (stored && stored.trim() !== '') {
      return stored.trim();
    }
  }
  return DEFAULT_CONTRACT_ADDRESS;
}

export function setStoredContractAddress(address: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONTRACT_STORAGE_KEY, address.trim());
  }
}

export function getStoredContractABI(): any[] {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(ABI_STORAGE_KEY);
    if (custom) {
      try {
        return JSON.parse(custom);
      } catch (e) {
        console.error('Invalid custom ABI in localStorage, falling back to default', e);
      }
    }
  }
  return contractAbi;
}

export function setStoredContractABI(abiString: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ABI_STORAGE_KEY, abiString);
  }
}

export const INITIAL_DEMO_CARDS: CardData[] = [
  {
    id: 1,
    name: 'Naruto',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    hp: 100,
    attack: 30,
    rarity: 'Common',
    exists: true,
  },
  {
    id: 2,
    name: 'Tanjiro',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    hp: 120,
    attack: 35,
    rarity: 'Rare',
    exists: true,
  },
  {
    id: 3,
    name: 'Gojo',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    hp: 150,
    attack: 50,
    rarity: 'SR',
    exists: true,
  },
  {
    id: 4,
    name: 'Goku',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    hp: 200,
    attack: 70,
    rarity: 'SSR',
    exists: true,
  },
];

export const CONTRACT_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract Ownable {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract SimpleCardGame is Ownable {
    struct Card {
        uint256 id;
        string name;
        string image;
        uint256 hp;
        uint256 attack;
        string rarity;
        bool exists;
    }

    uint256 private _cardIdCounter;
    uint256 private _nonce;

    mapping(uint256 => Card) public cards;
    mapping(address => uint256[]) public playerCards;

    event CardAdded(uint256 indexed cardId, string name);
    event CardDrawn(address indexed player, uint256 indexed cardId);

    constructor() {
        _createCard("Naruto", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80", 100, 30, "Common");
        _createCard("Tanjiro", "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80", 120, 35, "Rare");
        _createCard("Gojo", "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80", 150, 50, "SR");
        _createCard("Goku", "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80", 200, 70, "SSR");
    }

    function _createCard(
        string memory name,
        string memory image,
        uint256 hp,
        uint256 attack,
        string memory rarity
    ) internal {
        require(bytes(name).length > 0, "Card name cannot be empty");
        require(hp > 0, "HP must be greater than 0");
        require(attack > 0, "Attack must be greater than 0");

        _cardIdCounter++;
        uint256 newId = _cardIdCounter;

        cards[newId] = Card({
            id: newId,
            name: name,
            image: image,
            hp: hp,
            attack: attack,
            rarity: rarity,
            exists: true
        });

        emit CardAdded(newId, name);
    }

    function addCard(
        string memory name,
        string memory image,
        uint256 hp,
        uint256 attack,
        string memory rarity
    ) external onlyOwner {
        _createCard(name, image, hp, attack, rarity);
    }

    function getCard(uint256 cardId) external view returns (Card memory) {
        require(cards[cardId].exists, "Card does not exist");
        return cards[cardId];
    }

    function getTotalCards() external view returns (uint256) {
        return _cardIdCounter;
    }

    function drawCard() external returns (uint256) {
        require(_cardIdCounter > 0, "No cards available to draw");

        _nonce++;
        uint256 randomIndex = (uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    _nonce
                )
            )
        ) % _cardIdCounter) + 1;

        playerCards[msg.sender].push(randomIndex);
        emit CardDrawn(msg.sender, randomIndex);
        return randomIndex;
    }

    function getMyCards() external view returns (uint256[] memory) {
        return playerCards[msg.sender];
    }

    function getCardsOf(address player) external view returns (uint256[] memory) {
        return playerCards[player];
    }
}`;

export { contractAbi };
