/* Useful aliases */

// No, we don't have easy access to web3 here.
// And bn.js new BN() weirdly doesn't work with truffle-assertions
const toBN = a => a;
const toBNHex = a => a;


// Configfuration for our tokens

const NUM_ACCESSORIES = 15;
const INITIAL_SUPPLY = toBNHex('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

const ID_B_HOUSE = 1;
const ID_B_APART = 2;
const ID_B_STORE = 3;
const ID_B_OFFICE = 4;
const ID_B_SKYSCRAPER = 5;

const ID_T_DRILL = 6;
const ID_T_HAMMER = 7;
const ID_T_WRENCH = 8;
const ID_T_SAW = 9;
const ID_T_TORCH = 10;

const ID_M_NAIL = 11;
const ID_M_WOOD = 12;
const ID_M_PAINT = 13;
const ID_M_GLASS = 14;
const ID_M_METAL = 15;
/*

maxSupplies[ID_B_HOUSE] = 1400;
maxSupplies[ID_B_APART] = 1200;
maxSupplies[ID_B_STORE] = 1000;
maxSupplies[ID_B_OFFICE] = 800;
maxSupplies[ID_B_SKYSCRAPER] = 600;


maxSupplies[ID_T_DRILL] = 32000;
maxSupplies[ID_T_HAMMER] = 30000;
maxSupplies[ID_T_WRENCH] = 20000;
maxSupplies[ID_T_SAW] = 25000;
maxSupplies[ID_T_TORCH] = 12000;

maxSupplies[ID_M_NAIL] = 225000;
maxSupplies[ID_M_WOOD] = 130000;
maxSupplies[ID_M_PAINT] = 75000;
maxSupplies[ID_M_GLASS] = 40000;
maxSupplies[ID_M_METAL] = 60000;

*/
const M_MINT_INIT_SUPPLY_LIST = new Map([
  [ID_B_HOUSE,  toBN(1400)], 
  [ID_B_APART,  toBN(1200)],
  [ID_B_STORE, toBN(1000)],
  [ID_B_OFFICE, toBN(800)],
  [ID_B_SKYSCRAPER, toBN(600)],
  //--------------------
  [ID_T_DRILL, toBN(32000)],
  [ID_T_HAMMER, toBN(30000)],
  [ID_T_WRENCH, toBN(20000)],
  [ID_T_SAW, toBN(25000)],
  [ID_T_TORCH, toBN(12000)],
  //--------------------
  [ID_M_NAIL, toBN(225000)],
  [ID_M_WOOD, toBN(130000)],
  [ID_M_PAINT, toBN(75000)],
  [ID_M_GLASS, toBN(40000)],
  [ID_M_METAL, toBN(60000)],

]);
const M_MINT_INITIAL_SUPPLY = 
M_MINT_INIT_SUPPLY_LIST.get(ID_B_HOUSE)+
M_MINT_INIT_SUPPLY_LIST.get(ID_B_APART)+
M_MINT_INIT_SUPPLY_LIST.get(ID_B_STORE)+
M_MINT_INIT_SUPPLY_LIST.get(ID_B_OFFICE)+
M_MINT_INIT_SUPPLY_LIST.get(ID_B_SKYSCRAPER)+
M_MINT_INIT_SUPPLY_LIST.get(ID_M_NAIL) + 
M_MINT_INIT_SUPPLY_LIST.get(ID_M_WOOD) + 
M_MINT_INIT_SUPPLY_LIST.get(ID_M_PAINT) +
M_MINT_INIT_SUPPLY_LIST.get(ID_M_GLASS) +
M_MINT_INIT_SUPPLY_LIST.get(ID_M_METAL)+
M_MINT_INIT_SUPPLY_LIST.get(ID_T_DRILL)+
M_MINT_INIT_SUPPLY_LIST.get(ID_T_HAMMER)+
M_MINT_INIT_SUPPLY_LIST.get(ID_T_WRENCH)+
M_MINT_INIT_SUPPLY_LIST.get(ID_T_SAW)+
M_MINT_INIT_SUPPLY_LIST.get(ID_T_TORCH)
;

module.exports = {
  ID_M_NAIL,
  ID_M_WOOD,
  ID_M_PAINT,
  ID_M_GLASS,
  ID_M_METAL,
  NUM_ACCESSORIES,
  INITIAL_SUPPLY,
  M_MINT_INIT_SUPPLY_LIST,
  M_MINT_INITIAL_SUPPLY,

};
