// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * This is a generic provider contract that can be used to mint tokens. The configuration
 * for minting is specified by an _optionId, which can be used to delineate various
 * ways of minting.
 */
interface IProvider {
    /**
     * Returns the name of this provider.
     */
    function name() external view returns (string memory);

    /**
     * Returns the symbol for this provider.
     */
    function symbol() external view returns (string memory);

    /**
     * Number of options the provider supports.
     */
    function numOptions() external view returns (uint256);

    /**
     * @dev Returns a URL specifying some metadata about the option. This metadata can be of the
     * same structure as the ERC1155 metadata.
     */
    function uri(uint256 _optionId) external view returns (string memory);

    /**
     * Indicates that this is a provider contract. Ideally would use EIP 165 supportsInterface()
     */
    function supportsProviderInterface() external view returns (bool);

    /**
     * Indicates the Wyvern schema name for assets in this lootbox, e.g. "ERC1155"
     */
    function providerSchemaName() external view returns (string memory);
}
