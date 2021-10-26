// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";
import "./Building.sol";
import "./IProviderERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

/**
 * @title BuildingLootBox
 *
 * BuildingLootBox - a tradeable loot box of Buildings.
 */
contract BuildingLootBox is ERC721Tradable {
    uint256 NUM_BUILDINGS_PER_BOX = 3;
    uint256 OPTION_ID = 0;
    address providerAddress;

    constructor(address _proxyRegistryAddress, address _providerAddress)
        ERC721Tradable("BuildingLootBox", "LOOTBOX", _proxyRegistryAddress)
    {
        providerAddress = _providerAddress;
    }

    function unpack(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == _msgSender());

        // Insert custom logic for configuring the item here.
        for (uint256 i = 0; i < NUM_BUILDINGS_PER_BOX; i++) {
            // Mint the ERC721 item(s).
            ProviderERC721 provider = ProviderERC721(providerAddress);
            provider.mint(OPTION_ID, _msgSender());
        }

        // Burn the presale item.
        _burn(_tokenId);
    }

    function baseTokenURI() override public pure returns (string memory) {
        return "https://buildings-api.opensea.io/api/box/";
    }

    function itemsPerLootbox() public view returns (uint256) {
        return NUM_BUILDINGS_PER_BOX;
    }
}
