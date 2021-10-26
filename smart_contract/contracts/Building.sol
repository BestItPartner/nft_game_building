// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";

/**
 * @title Building
 * Building - a contract for my non-fungible buildings.
 */
contract Building is ERC721Tradable {
    constructor(address _proxyRegistryAddress)
        ERC721Tradable("OpenSea Building", "OSB", _proxyRegistryAddress)
    {}

    function baseTokenURI() override public pure returns (string memory) {
        return "https://buildings-api.opensea.io/api/building/";
    }

    function contractURI() public pure returns (string memory) {
        return "https://buildings-api.opensea.io/contract/opensea-buildings";
    }
}
