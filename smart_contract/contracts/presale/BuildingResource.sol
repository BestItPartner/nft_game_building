// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC1155Tradable.sol";

/**
 * @title Material
 * Material - a contract for Building Accessory semi-fungible tokens.
 */
contract BuildingResource is ERC1155Tradable {
    string public contractURI ="https://buildings-api.opensea.io/contract/opensea-erc1155";
    address public tokenPool;
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri,
        address _proxyRegistryAddress)
        ERC1155Tradable(
            _name,
            _symbol,
            _uri,
            _proxyRegistryAddress
        ) {
            tokenPool = msgSender();
        }

    function setContractURI(string memory _contractURI) public onlyOwner {
        contractURI = _contractURI;
    }
    function createResource(
        uint256 _id,
        uint256 _initialSupply,
        string memory _uri
        ) public onlyOwner returns (uint256) {
        return create(tokenPool, _id, _initialSupply, _uri, "0x00");
    }
    function transferOwnership(address _newOwner) public override onlyOwner {
        // for(uint256 i = 0 ; i< tpIds.length ; i++) {
        //     uint256 _id = tpIds[i];
        //     creators[_id] = _newOwner;
        // }
        Ownable.transferOwnership(_newOwner);
    }
}
