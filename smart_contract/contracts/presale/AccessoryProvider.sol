// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/security/ReentrancyGuard.sol";
import "openzeppelin-solidity/contracts/utils/Strings.sol";
import "./IProvider.sol";
import "../ERC1155Tradable.sol";

/**
 * @title AccessoryProvider
 * AccessoryProvider - a provider contract for Building Accessory semi-fungible
 * tokens.
 */
abstract contract AccessoryProvider is IProvider, Ownable, ReentrancyGuard {
    using Strings for string;
    using SafeMath for uint256;
}
