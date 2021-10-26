// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155Tradable.sol";

/**
 * @title BuildingAccessory
 * BuildingAccessory - a contract for Building Accessory semi-fungible tokens.
 */
contract BuildingAccessory is ERC1155Tradable {
    constructor(address _proxyRegistryAddress)
        ERC1155Tradable(
            "OpenSea Building Accessory",
            "OSBA",
            "https://buildings-api.opensea.io/api/accessory/{id}",
            _proxyRegistryAddress
        ) {}

    function contractURI() public pure returns (string memory) {
        return "https://buildings-api.opensea.io/contract/opensea-erc1155";
    }
}
