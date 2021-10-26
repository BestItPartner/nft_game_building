/* Contracts in this test */

const BuildingAccessory = artifacts.require(
  "../contracts/BuildingAccessory.sol"
);


contract("BuildingAccessory", (accounts) => {
  const URI_BASE = 'https://buildings-api.opensea.io';
  const CONTRACT_URI = `${URI_BASE}/contract/opensea-erc1155`;
  let buildingAccessory;

  before(async () => {
    buildingAccessory = await BuildingAccessory.deployed();
  });

  // This is all we test for now

  // This also tests contractURI()

  describe('#constructor()', () => {
    it('should set the contractURI to the supplied value', async () => {
      assert.equal(await buildingAccessory.contractURI(), CONTRACT_URI);
    });
  });
});
