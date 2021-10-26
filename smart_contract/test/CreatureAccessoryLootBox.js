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
const BuildingAccessoryLootBox = artifacts.require(
  "../contracts/BuildingAccessoryLootBox.sol"
);


/* Useful aliases */

const toBN = web3.utils.toBN;


/* Utility Functions */

// Not a function, the fields of the TransferSingle event.

const TRANSFER_SINGLE_FIELDS = [
  { type: 'address', name: '_operator', indexed: true },
  { type: 'address', name: '_from', indexed: true },
  { type: 'address', name: '_to', indexed: true },
  { type: 'uint256', name: '_id' },
  { type: 'uint256', name: '_amount' }
];

// Not a function, the keccak of the TransferSingle event.

const TRANSFER_SINGLE_SIG = web3.eth.abi.encodeEventSignature({
  name: 'TransferSingle',
  type: 'event',
  inputs: TRANSFER_SINGLE_FIELDS
});

// Total the number of tokens in the transaction's emitted TransferSingle events
// Keep a total for each token id number (1:..2:..)
// and a total for *all* tokens as total:.

const totalEventTokens = (receipt, recipient) => {
  // total is our running total for all tokens
  const totals = {total: toBN(0)};
  // Parse each log from the event
  for (let i = 0; i < receipt.receipt.rawLogs.length; i++) {
    const raw = receipt.receipt.rawLogs[i];
    // Filter events so we process only the TransferSingle events
    // Note that topic[0] is the event signature hash
    if (raw.topics[0] === TRANSFER_SINGLE_SIG) {
      // Fields of TransferSingle
      let parsed = web3.eth.abi.decodeLog(
        TRANSFER_SINGLE_FIELDS,
        raw.data,
        // Exclude event signature hash from topics that we process here.
        raw.topics.slice(1)
      );
      // Make sure the address that we are watching got the tokens.
      // Burnt tokens go to address zero, for example
      if (parsed._to == recipient) {
        // Keep a running total for each token id.
        const id = parsed._id;
        if (! totals[id]) {
          totals[id] = toBN(0);
        }
        const amount = toBN(parsed._amount);
        totals[id] = totals[id].add(amount);
        // Keep a running total for all token ids.
        totals.total = totals.total.add(amount);
      }
    }
  }
  return totals;
};

// Compare the token amounts map generated by totalEventTokens to a spec object.
// The spec should match the guarantees[] array for the option.

const compareTokenTotals = (totals, spec, option) => {
  Object.keys(spec).forEach(key => {
    assert.isOk(
      // Because it's an Object.keys() value, key is a string.
      // We want that for the spec, as it is the correct key.
      // But to add one we want a number, so we parse it then add one.
      // Why do we want to add one?
      totals[parseInt(key)] || toBN(0).gte(spec[key]),
      `Mismatch for option ${option} guarantees[${key}]`
    );
  });
};


/* Tests */

contract("BuildingAccessoryLootBox", (accounts) => {
  const owner = accounts[0];
  const userA = accounts[1];
  const userB = accounts[2];
  const proxyForOwner = accounts[8];

  let lootBox;
  let provider;
  let buildingAccessory;
  let proxy;

  before(async () => {
    proxy = await MockProxyRegistry.new();
    await proxy.setProxy(owner, proxyForOwner);
    buildingAccessory = await BuildingAccessory.new(proxy.address);
    BuildingAccessoryLootBox.link(LootBoxRandomness);
    lootBox = await BuildingAccessoryLootBox.new(
      proxy.address,
      { gas: 6721975 }
    );
    provider = await BuildingAccessoryProvider.new(
      proxy.address,
      buildingAccessory.address,
      lootBox.address
    );
    await setup.setupAccessory(buildingAccessory, owner);
    await buildingAccessory.setApprovalForAll(
      provider.address,
      true,
      { from: owner }
    );
    await buildingAccessory.transferOwnership(provider.address);
    await setup.setupAccessoryLootBox(lootBox, provider);
  });

  // Calls _mint()

  describe('#mint()', () => {
    it('should work for owner()', async () => {
      const option = toBN(vals.LOOTBOX_OPTION_BASIC);
      const amount = toBN(1);
      const receipt = await lootBox.mint(
        userB,
        option,
        amount,
        "0x0",
        { from: owner }
      );
      truffleAssert.eventEmitted(
        receipt,
        'TransferSingle',
        {
          from: testVals.ADDRESS_ZERO,
          to: userB,
          id: option,
          value: amount
        }
      );
    });

    it('should work for proxy', async () => {
      const option = vals.LOOTBOX_OPTION_BASIC;
      const amount = toBN(1);
      const receipt = await lootBox.mint(
          userB,
          option,
          amount,
          "0x0",
          { from: proxyForOwner }
      );
      truffleAssert.eventEmitted(
        receipt,
        'TransferSingle',
        {
          from: testVals.ADDRESS_ZERO,
          to: userB,
          //_id: option.add(toBN(1)),
          value: amount
        }
      );
    });

    it('should not be callable by non-owner() and non-proxy', async () => {
      const amount = toBN(1);
      await truffleAssert.fails(
        lootBox.mint(
          userB,
          vals.LOOTBOX_OPTION_PREMIUM,
          amount,
          "0x0",
          { from: userB }
        ),
        truffleAssert.ErrorType.REVERT,
        'Lootbox: owner or proxy only'
      );
    });

    it('should not work for invalid option', async () => {
      const amount = toBN(1);
      await truffleAssert.fails(
        lootBox.mint(
          userB,
          vals.NO_SUCH_LOOTBOX_OPTION,
          amount,
          "0x0",
          { from: owner }
        ),
        truffleAssert.ErrorType.REVERT,
        'Lootbox: Invalid Option'
      );
    });
  });

  describe('#unpack()', () => {
    it('should mint guaranteed class amounts for each option', async () => {
      for (let i = 0; i < vals.NUM_LOOTBOX_OPTIONS; i++) {
        const option = vals.LOOTBOX_OPTIONS[i];
        const amount = toBN(1);
        //console.log(i);
        await lootBox.mint(
          userB,
          option,
          amount,
          "0x0",
          { from: proxyForOwner }
        );
        const receipt = await lootBox.unpack(
          // Token IDs are option IDs
          option,
          userB,
          amount,
          { from: userB }
        );
        truffleAssert.eventEmitted(
          receipt,
          'LootBoxOpened',
          {
            boxesPurchased: amount,
            optionId: toBN(option),
            buyer: userB,
            itemsMinted: toBN(vals.LOOTBOX_OPTION_AMOUNTS[option])
          }
        );

        const totals = totalEventTokens(receipt, userB);
        assert.ok(totals.total.eq(toBN(vals.LOOTBOX_OPTION_AMOUNTS[option])));
        compareTokenTotals(totals, vals.LOOTBOX_OPTION_GUARANTEES[option], option);
      }
    });
  });
});