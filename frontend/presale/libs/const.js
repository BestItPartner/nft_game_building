import BigNumber from 'bignumber.js/bignumber'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export const BSC_BLOCK_TIME = 3;
export const CAKE_PER_BLOCK = new BigNumber(40);
export const BLOCKS_PER_YEAR = new BigNumber((60 / BSC_BLOCK_TIME) * 60 * 24 * 365); // 10512000
export const BASE_EXCHANGE_URL = 'https://exchange.pancakeswap.finance';
export const BASE_BSC_SCAN_URL = 'https://bscscan.com';
export const BASE_TESTBSC_SCAN_URL = 'https://testnet.bscscan.com';

export const nftItems = [
  [
    {id: 1,   title: 'House',       price: 0.50,  name: 'house', count: 0 },
    {id: 2,    title: 'Apartment',   price: 0.75,  name: 'apartment', count: 0},
    {id: 3,    title: 'Storefronte', price: 1.00,  name: 'storefront', count: 0},
    {id: 4,    title: 'Office',      price: 1.25,  name: 'office', count: 0},
    {id: 5,    title: 'Skyscrapper', price: 1.50,  name: 'skyscrapper', count: 0}
  ],
  [
    {id: 6,    title: 'Drill',       price: 0.05,  name: 'drill', count: 0},
    {id: 7,    title: 'Hammer',      price: 0.0675,  name: 'hammer', count: 0},
    {id: 8,    title: 'Wrench',      price: 0.075,  name: 'wrench', count: 0},
    {id: 9,    title: 'Saw',         price: 0.087,  name: 'saw', count: 0},
    {id: 10,    title: 'Torch',       price: 0.1,  name: 'torch', count: 0}
  ],
  [
    {id: 11,    title: 'Nails',       price: 0.01,  name: 'nails', count: 0},
    {id: 12,    title: 'Wood',        price: 0.02,  name: 'wood', count: 0},
    {id: 13,    title: 'Paint',       price: 0.03,  name: 'paint', count: 0},
    {id: 14,    title: 'Glass',       price: 0.05,  name: 'glass', count: 0},
    {id: 15,    title: 'Metal',       price: 0.07,  name: 'metal', count: 0}
  ]
];

export function getItemNameFromId(id) {
  for (let index = 0; index < 3; index++) {
    const _item = nftItems[index].find(x => x.id === id);
    if (_item != undefined) {
      return _item.title;
    }
  }
  return '';
}