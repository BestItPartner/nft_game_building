const Building = artifacts.require("./Building.sol");
const BuildingProvider = artifacts.require("./BuildingProvider.sol");
const BuildingLootBox = artifacts.require("./BuildingLootBox.sol");
const BuildingAccessory = artifacts.require("../contracts/BuildingAccessory.sol");
const BuildingAccessoryProvider = artifacts.require("../contracts/BuildingAccessoryProvider.sol");
const BuildingAccessoryLootBox = artifacts.require(
  "../contracts/BuildingAccessoryLootBox.sol"
);
const LootBoxRandomness = artifacts.require(
  "../contracts/LootBoxRandomness.sol"
);

const setupBuildingAccessories = require("../lib/setupBuildingAccessories.js");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;
const DEPLOY_ALL = process.env.DEPLOY_ALL;
const DEPLOY_ACCESSORIES_SALE = process.env.DEPLOY_ACCESSORIES_SALE || DEPLOY_ALL;
const DEPLOY_ACCESSORIES = process.env.DEPLOY_ACCESSORIES || DEPLOY_ACCESSORIES_SALE || DEPLOY_ALL;
const DEPLOY_BUILDINGS_SALE = process.env.DEPLOY_BUILDINGS_SALE || DEPLOY_ALL;
// Note that we will default to this unless DEPLOY_ACCESSORIES is set.
// This is to keep the historical behavior of this migration.
const DEPLOY_BUILDINGS = process.env.DEPLOY_BUILDINGS || DEPLOY_BUILDINGS_SALE || DEPLOY_ALL || (! DEPLOY_ACCESSORIES);

module.exports = async (deployer, network, addresses) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  if (DEPLOY_BUILDINGS) {
    await deployer.deploy(Building, proxyRegistryAddress, {gas: 5000000});
  }

  if (DEPLOY_BUILDINGS_SALE) {
    await deployer.deploy(BuildingProvider, proxyRegistryAddress, Building.address, {gas: 7000000});
    const building = await Building.deployed();
    await building.transferOwnership(BuildingProvider.address);
  }

  if (DEPLOY_ACCESSORIES) {
    await deployer.deploy(
      BuildingAccessory,
      proxyRegistryAddress,
      { gas: 5000000 }
    );
    const accessories = await BuildingAccessory.deployed();
    await setupBuildingAccessories.setupAccessory(
      accessories,
      addresses[0]
    );
  }

  if (DEPLOY_ACCESSORIES_SALE) {
    await deployer.deploy(LootBoxRandomness);
    await deployer.link(LootBoxRandomness, BuildingAccessoryLootBox);
    await deployer.deploy(
      BuildingAccessoryLootBox,
      proxyRegistryAddress,
      { gas: 6721975 }
    );
    const lootBox = await BuildingAccessoryLootBox.deployed();
    await deployer.deploy(
      BuildingAccessoryProvider,
      proxyRegistryAddress,
      BuildingAccessory.address,
      BuildingAccessoryLootBox.address,
      { gas: 5000000 }
    );
    const accessories = await BuildingAccessory.deployed();
    const provider = await BuildingAccessoryProvider.deployed();
    await accessories.transferOwnership(
      BuildingAccessoryProvider.address
    );
    await setupBuildingAccessories.setupAccessoryLootBox(lootBox, provider);
    await lootBox.transferOwnership(provider.address);
  }
};
