// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/Strings.sol";
import "./IProviderERC721.sol";
import "./Building.sol";
import "./BuildingLootBox.sol";

contract BuildingProvider is ProviderERC721, Ownable {
    using Strings for string;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    address public proxyRegistryAddress;
    address public nftAddress;
    address public lootBoxNftAddress;
    string public baseURI = "https://buildings-api.opensea.io/api/provider/";

    /*
     * Enforce the existence of only 100 OpenSea buildings.
     */
    uint256 BUILDING_SUPPLY = 100;

    /*
     * Three different options for minting Buildings (basic, premium, and gold).
     */
    uint256 NUM_OPTIONS = 3;
    uint256 SINGLE_BUILDING_OPTION = 0;
    uint256 MULTIPLE_BUILDING_OPTION = 1;
    uint256 LOOTBOX_OPTION = 2;
    uint256 NUM_BUILDINGS_IN_MULTIPLE_BUILDING_OPTION = 4;

    constructor(address _proxyRegistryAddress, address _nftAddress) {
        proxyRegistryAddress = _proxyRegistryAddress;
        nftAddress = _nftAddress;
        lootBoxNftAddress = address(
            new BuildingLootBox(_proxyRegistryAddress, address(this))
        );

        fireTransferEvents(address(0), owner());
    }

    function name() override external pure returns (string memory) {
        return "OpenSeaBuilding Item Sale";
    }

    function symbol() override external pure returns (string memory) {
        return "CPF";
    }

    function supportsProviderInterface() override public pure returns (bool) {
        return true;
    }

    function numOptions() override public view returns (uint256) {
        return NUM_OPTIONS;
    }

    function transferOwnership(address newOwner) override public onlyOwner {
        address _prevOwner = owner();
        super.transferOwnership(newOwner);
        fireTransferEvents(_prevOwner, newOwner);
    }

    function fireTransferEvents(address _from, address _to) private {
        for (uint256 i = 0; i < NUM_OPTIONS; i++) {
            emit Transfer(_from, _to, i);
        }
    }

    function mint(uint256 _optionId, address _toAddress) override public {
        // Must be sent from the owner proxy or owner.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        assert(
            address(proxyRegistry.proxies(owner())) == _msgSender() ||
                owner() == _msgSender() ||
                _msgSender() == lootBoxNftAddress
        );
        require(canMint(_optionId));

        Building openSeaBuilding = Building(nftAddress);
        if (_optionId == SINGLE_BUILDING_OPTION) {
            openSeaBuilding.mintTo(_toAddress);
        } else if (_optionId == MULTIPLE_BUILDING_OPTION) {
            for (
                uint256 i = 0;
                i < NUM_BUILDINGS_IN_MULTIPLE_BUILDING_OPTION;
                i++
            ) {
                openSeaBuilding.mintTo(_toAddress);
            }
        } else if (_optionId == LOOTBOX_OPTION) {
            BuildingLootBox openSeaBuildingLootBox = BuildingLootBox(
                lootBoxNftAddress
            );
            openSeaBuildingLootBox.mintTo(_toAddress);
        }
    }

    function canMint(uint256 _optionId) override public view returns (bool) {
        if (_optionId >= NUM_OPTIONS) {
            return false;
        }

        Building openSeaBuilding = Building(nftAddress);
        uint256 buildingSupply = openSeaBuilding.totalSupply();

        uint256 numItemsAllocated = 0;
        if (_optionId == SINGLE_BUILDING_OPTION) {
            numItemsAllocated = 1;
        } else if (_optionId == MULTIPLE_BUILDING_OPTION) {
            numItemsAllocated = NUM_BUILDINGS_IN_MULTIPLE_BUILDING_OPTION;
        } else if (_optionId == LOOTBOX_OPTION) {
            BuildingLootBox openSeaBuildingLootBox = BuildingLootBox(
                lootBoxNftAddress
            );
            numItemsAllocated = openSeaBuildingLootBox.itemsPerLootbox();
        }
        return buildingSupply < (BUILDING_SUPPLY - numItemsAllocated);
    }

    function tokenURI(uint256 _optionId) override external view returns (string memory) {
        return string(abi.encodePacked(baseURI, Strings.toString(_optionId)));
    }

    /**
     * Hack to get things to work automatically on OpenSea.
     * Use transferFrom so the frontend doesn't have to worry about different method names.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public {
        _from = _msgSender(); // Temporary
        mint(_tokenId, _to);
    }

    /**
     * Hack to get things to work automatically on OpenSea.
     * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
     */
    function isApprovedForAll(address _owner, address _operator)
        public
        view
        returns (bool)
    {
        if (owner() == _owner && _owner == _operator) {
            return true;
        }

        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (
            owner() == _owner &&
            address(proxyRegistry.proxies(_owner)) == _operator
        ) {
            return true;
        }

        return false;
    }

    /**
     * Hack to get things to work automatically on OpenSea.
     * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
     */
    function ownerOf(uint256 _tokenId) public view returns (address _owner) {
        _tokenId = 0;
        return owner();
    }
}
