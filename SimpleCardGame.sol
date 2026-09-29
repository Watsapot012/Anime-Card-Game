// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleCardGame
 * @dev Web3 Anime Card Game Smart Contract for Remix IDE deployment & Web3 Demo
 * Features: Ownable, Card Struct, Card Registration, Pseudo-Random Draw, Player Collections.
 * NOTE: Randomness uses block properties for lightweight testnet/demo use (do not use for high-stake real money).
 */

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

    event CardAdded(
        uint256 indexed cardId,
        string name
    );

    event CardDrawn(
        address indexed player,
        uint256 indexed cardId
    );

    constructor() {
        // Pre-populate with iconic starter demo cards for immediate testnet gameplay
        _createCard(
            "Naruto",
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
            100,
            30,
            "Common"
        );
        _createCard(
            "Tanjiro",
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
            120,
            35,
            "Rare"
        );
        _createCard(
            "Gojo",
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
            150,
            50,
            "SR"
        );
        _createCard(
            "Goku",
            "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80",
            200,
            70,
            "SSR"
        );
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
}
