/* libraries used */

const truffleAssert = require('truffle-assertions');

const setup = require('../lib/setupBuildingAccessories.js');
const testVals = require('../lib/testValuesCommon.js');
const vals = require('../lib/valuesCommon.js');

/* Contracts in this test */

const MockProxyRegistry = artifacts.require(
  "../contracts/MockProxyRegistry.sol"
);
const LootBoxRandomness = artifacts.require(
  "../contracts/LootBoxRandomness.sol"
);
const BuildingAccessory = artifacts.require("../contracts/BuildingAccessory.sol");
const BuildingAccessoryProvider = artifacts.require("../contracts/BuildingAccessoryProvider.sol");
const BuildingAccessoryLootBox = artifacts.require("../contracts/BuildingAccessoryLootBox.sol");
const TestForReentrancyAttack = artifacts.require(
  "../contracts/TestForReentrancyAttack.sol"
);


/* Useful aliases */

const toBN = web3.utils.toBN;


/* Utilities */

const toTokenId = optionId => optionId;


contract("BuildingAccessoryProvider", (accounts) => {
  const TOTAL_OPTIONS = 9;

  const owner = accounts[0];
  const userA = accounts[1];
  const userB = accounts[2];
  const proxyForOwner = accounts[8];

  let buildingAccessory;
  let myProvider;
  let myLootBox;
  let attacker;
  let proxy;

  // To install the proxy mock and the attack contract we deploy our own
  // instances of all the classes here rather than using the ones that Truffle
  // deployed.

  before(async () => {
    proxy = await MockProxyRegistry.new();
    await proxy.setProxy(owner, proxyForOwner);
    buildingAccessory = await BuildingAccessory.new(proxy.address);
    BuildingAccessoryLootBox.link(LootBoxRandomness);
    myLootBox = await BuildingAccessoryLootBox.new(
      proxy.address,
      { gas: 6721975 }
    );
    myProvider = await BuildingAccessoryProvider.new(
      proxy.address,
      buildingAccessory.address,
      myLootBox.address
    );
    attacker = await TestForReentrancyAttack.new();
    await attacker.setProviderAddress(myProvider.address);
    await setup.setupBuildingAccessories(
      buildingAccessory,
      myProvider,
      myLootBox,
      owner
    );
  });

  // This also tests the proxyRegistryAddress and lootBoxAddress accessors.

  describe('#constructor()', () => {
    it('should set proxyRegistryAddress to the supplied value', async () => {
      assert.equal(await myProvider.proxyRegistryAddress(), proxy.address);
      assert.equal(await myProvider.lootBoxAddress(), myLootBox.address);
    });
  });

  describe('#name()', () => {
    it('should return the correct name', async () => {
      assert.equal(
        await myProvider.name(),
        'OpenSea Building Accessory Pre-Sale'
      );
    });
  });

  describe('#symbol()', () => {
    it('should return the correct symbol', async () => {
      assert.equal(await myProvider.symbol(), 'OSCAP');
    });
  });

  describe('#supportsProviderInterface()', () => {
    it('should return true', async () => {
      assert.isOk(await myProvider.supportsProviderInterface());
    });
  });

  describe('#providerSchemaName()', () => {
    it('should return the schema name', async () => {
      assert.equal(await myProvider.providerSchemaName(), 'ERC1155');
    });
  });

  describe('#numOptions()', () => {
    it('should return the correct number of options', async () => {
      assert.equal(await myProvider.numOptions(), TOTAL_OPTIONS);
    });
  });

  //NOTE: We test this early relative to its place in the source code as we
  //      mint tokens that we rely on the existence of in later tests here.
  
  describe('#mint()', () => {
    it('should not allow non-owner or non-operator to mint', async () => {
      await truffleAssert.fails(
        myProvider.mint(vals.CLASS_COMMON, userA, 1000, "0x0", { from: userA }),
        truffleAssert.ErrorType.revert,
        'BuildingAccessoryProvider#_mint: CANNOT_MINT_MORE'
      );
    });

    it('should allow owner to mint', async () => {
      const quantity = toBN(10);
      await myProvider.mint(
        vals.CLASS_COMMON,
        userA,
        quantity,
        "0x0",
        { from: owner }
      );
      // Check that the recipient got the correct quantity
      // Token numbers are one higher than option numbers
      const balanceUserA = await buildingAccessory.balanceOf(
        userA,
        toTokenId(vals.CLASS_COMMON)
      );
      assert.isOk(balanceUserA.eq(quantity));
      // Check that balance is correct
      const balanceOf = await myProvider.balanceOf(owner, vals.CLASS_COMMON);
      assert.isOk(balanceOf.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(quantity)));
      // Check that total supply is correct
      const premintedRemaining = await buildingAccessory.balanceOf(
        owner,
        toTokenId(vals.CLASS_COMMON)
      );
      assert.isOk(premintedRemaining.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(quantity)));
    });

    it('should allow proxy to mint', async () => {
      const quantity = toBN(100);
      //FIXME: move all quantities to top level constants
      const total = toBN(110);
      await myProvider.mint(
        vals.CLASS_COMMON,
        userA,
        quantity,
        "0x0",
        { from: proxyForOwner }
      );
      // Check that the recipient got the correct quantity
      const balanceUserA = await buildingAccessory.balanceOf(
        userA,
        toTokenId(vals.CLASS_COMMON)
      );
      assert.isOk(balanceUserA.eq(total));
      // Check that balance is correct
      const balanceOf = await myProvider.balanceOf(owner, vals.CLASS_COMMON);
      assert.isOk(balanceOf.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(total)));
      // Check that total supply is correct
      const premintedRemaining = await buildingAccessory.balanceOf(
        owner,
        toTokenId(vals.CLASS_COMMON)
      );
      assert.isOk(premintedRemaining.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(total)));
    });
  });

  /**
   * NOTE: This check is difficult to test in a development
   * environment, due to the OwnableDelegateProxy. To get around
   * this, in order to test this function below, you'll need to:
   *
   * 1. go to BuildingAccessoryProvider.sol, and
   * 2. modify _isOwnerOrProxy
   *
   * --> Modification is:
   *      comment out
   *         return owner() == _address || address(proxyRegistry.proxies(owner())) == _address;
   *      replace with
   *         return true;
   * Then run, you'll get the reentrant error, which passes the test
   **/

  describe('Re-Entrancy Check', () => {
    it('Should have the correct provider address set',
       async () => {
         assert.equal(await attacker.providerAddress(), myProvider.address);
       });

    // With unmodified code, this fails with:
    //   BuildingAccessoryProvider#_mint: CANNOT_MINT_MORE
    // which is the correct behavior (no reentrancy) for the wrong reason
    // (the attacker is not the owner or proxy).

    xit('Minting from provider should disallow re-entrancy attack',
       async () => {
         await truffleAssert.passes(
           myProvider.mint(1, userA, 1, "0x0", { from: owner })
         );
         await truffleAssert.passes(
           myProvider.mint(1, userA, 1, "0x0", { from: userA })
         );
         await truffleAssert.fails(
           myProvider.mint(
             1,
             attacker.address,
             1,
             "0x0",
             { from: attacker.address }
           ),
           truffleAssert.ErrorType.revert,
           'ReentrancyGuard: reentrant call'
         );
       });
  });
});
