// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "./AccessoryProvider.sol";
import "./BuildingResource.sol";
contract BuildingResourceProvider is AccessoryProvider{

    uint256 private constant NUM_ITEM_OPTIONS = 15;

    uint256 private constant ID_B_HOUSE = 1;
    uint256 private constant ID_B_APART = 2;
    uint256 private constant ID_B_STORE = 3;
    uint256 private constant ID_B_OFFICE = 4;
    uint256 private constant ID_B_SKYSCRAPER = 5;

    uint256 private constant ID_T_DRILL = 6;
    uint256 private constant ID_T_HAMMER = 7;
    uint256 private constant ID_T_WRENCH = 8;
    uint256 private constant ID_T_SAW = 9;
    uint256 private constant ID_T_TORCH = 10;

    uint256 private constant ID_M_NAIL = 11;
    uint256 private constant ID_M_WOOD = 12;
    uint256 private constant ID_M_PAINT = 13;
    uint256 private constant ID_M_GLASS = 14;
    uint256 private constant ID_M_METAL = 15;

    mapping(uint => uint256) public maxSupplies;
    mapping(uint => uint256) public prices;


    address public immutable deployer;

    bool public presaleLive;
    bool public saleLive;
    bool public locked;
    mapping(uint256 => mapping(address => uint256)) public presalerListPurchases;
    mapping(uint256 => uint256) public  presalePurchaseLimit;
    mapping(string => bool) private _usedNonces;

    address  private proxyRegistryAddress;
    address public nftAddress;
    address  private lootBoxAddress;
    string  public baseMetadataURI = "https://buildings-api.opensea.io/api/";
    bool public isProxyUseForLive = false;


    constructor(
        address _proxyRegistryAddress,
        address _nftAddress,
        address _lootBoxAddress
    )
    //AccessoryProvider(_proxyRegistryAddress, _nftAddress, _lootBoxAddress) {
    {
        proxyRegistryAddress = _proxyRegistryAddress;
        nftAddress = _nftAddress;
        lootBoxAddress = _lootBoxAddress;
        //nftContract = ERC1155Tradable(_nftAddress);
        //lootBox = ERC1155Tradable(_lootBoxAddress);
        presaleLive = true;
        saleLive = false;

        maxSupplies[ID_B_HOUSE] = 1400;
        maxSupplies[ID_B_APART] = 1200;
        maxSupplies[ID_B_STORE] = 1000;
        maxSupplies[ID_B_OFFICE] = 800;
        maxSupplies[ID_B_SKYSCRAPER] = 600;

        prices[ID_B_HOUSE]   = 0.50 ether;
        prices[ID_B_APART]   = 0.75 ether;
        prices[ID_B_STORE]  = 1.00 ether;
        prices[ID_B_OFFICE]  = 1.25 ether;
        prices[ID_B_SKYSCRAPER]  = 1.5 ether;

        presalePurchaseLimit[ID_B_HOUSE] = 14;
        presalePurchaseLimit[ID_B_APART] = 12;
        presalePurchaseLimit[ID_B_STORE] = 10;
        presalePurchaseLimit[ID_B_OFFICE] = 8;
        presalePurchaseLimit[ID_B_SKYSCRAPER] = 6;

        //------------------------------------

        maxSupplies[ID_T_DRILL] = 32000;
        maxSupplies[ID_T_HAMMER] = 30000;
        maxSupplies[ID_T_WRENCH] = 20000;
        maxSupplies[ID_T_SAW] = 25000;
        maxSupplies[ID_T_TORCH] = 12000;

        prices[ID_T_DRILL]   = 0.05 ether;
        prices[ID_T_HAMMER]   = 0.0675 ether;
        prices[ID_T_WRENCH]  = 0.075 ether;
        prices[ID_T_SAW]  = 0.087 ether;
        prices[ID_T_TORCH]  = 0.1 ether;

        presalePurchaseLimit[ID_T_DRILL] = 320;
        presalePurchaseLimit[ID_T_HAMMER] = 300;
        presalePurchaseLimit[ID_T_WRENCH] = 200;
        presalePurchaseLimit[ID_T_SAW] = 250;
        presalePurchaseLimit[ID_T_TORCH] = 120;

        //------------------------------------


        maxSupplies[ID_M_NAIL] = 225000;
        maxSupplies[ID_M_WOOD] = 130000;
        maxSupplies[ID_M_PAINT] = 75000;
        maxSupplies[ID_M_GLASS] = 40000;
        maxSupplies[ID_M_METAL] = 60000;

        prices[ID_M_NAIL]   = 0.01 ether;
        prices[ID_M_WOOD]   = 0.02 ether;
        prices[ID_M_PAINT]  = 0.03 ether;
        prices[ID_M_GLASS]  = 0.05 ether;
        prices[ID_M_METAL]  = 0.07 ether;

        presalePurchaseLimit[ID_M_NAIL] = 2250;
        presalePurchaseLimit[ID_M_WOOD] = 1300;
        presalePurchaseLimit[ID_M_PAINT] = 750;
        presalePurchaseLimit[ID_M_GLASS] = 400;
        presalePurchaseLimit[ID_M_METAL] = 600;
        
        deployer = _msgSender();
    }
    
    function setPurchaseLimit(uint256 _option, uint256 _value) external onlyOwner onlyValidOption(_option) {
        presalePurchaseLimit[_option] = _value;
    }
    function setPrice(uint256 _option, uint256 _value) external onlyOwner onlyValidOption(_option) {
        prices[_option] = _value;
    }
    function name() override external pure returns (string memory) {
        return "Material Pre-Sale";
    }

    function symbol() override external pure returns (string memory) {
        return "F5MNFT";
    }

    function supportsProviderInterface() override external pure returns (bool) {
        return true;
    }

    function providerSchemaName() override external pure returns (string memory) {
        return "ERC1155";
    }

    function numOptions() override external pure returns (uint256) {
        return NUM_ITEM_OPTIONS;
    }

    function uri(uint256 _optionId) override external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    baseMetadataURI,
                    Strings.toString(_optionId)
                    )
                );
    }
   
    /**
     * Get the provider's ownership of Option.
     * Should be the amount it can still mint.
     * NOTE: Called by `canMint`
     */
    function balanceOf(address _owner, uint256 _optionId)
        internal
        view
        returns (uint256)
    {
            // The pre-minted balance belongs to the address that minted this contract
            BuildingResource nftContract = BuildingResource(nftAddress);
            // OptionId is used as a token ID here
            uint256 currentSupply = nftContract.balanceOf(_owner, _optionId);
            return currentSupply;
    }
    function _presaleBuy(uint256 _option, uint256 tokenQuantity, bytes memory _data) internal onlyValidOption(_option) {
        address toBuyer = _msgSender();
        BuildingResource nftContract = BuildingResource(nftAddress);
        address fromAddress = nftContract.tokenPool();

        require(!saleLive && presaleLive, "PRESALE_CLOSED");
        require(tokenQuantity < balanceOf(fromAddress, _option), "OUT_OF_STOCK");
        require(presalerListPurchases[_option][toBuyer] + tokenQuantity <= presalePurchaseLimit[_option], "EXCEED_ALLOC");

            // Option is used as a token ID here
            nftContract.safeTransferFrom(
                fromAddress,
                toBuyer,
                _option,
                tokenQuantity,
                _data
            );
        presalerListPurchases[_option][toBuyer] += tokenQuantity;
        

    }
    function presaleBuy(uint256 _option, uint256 tokenQuantity, bytes memory _data) 
            external nonReentrant payable {

        require(prices[_option] * tokenQuantity <= msg.value, "INSUFFICIENT_ETH");
       _presaleBuy(_option,tokenQuantity, _data);
    }
    function _presaleBatchBuy(uint256[] memory _options, uint256[] memory _values, bytes memory _data) internal onlyValidOptions(_options) {
        address toBuyer = _msgSender();
        BuildingResource nftContract = BuildingResource(nftAddress);
        address fromAddress = nftContract.tokenPool();
        require(!saleLive && presaleLive, "PRESALE_CLOSED");
        require(_options.length == _values.length, "The lengths of ID and value arrays should be same");
        require(fromAddress != address(0), "A creator by ID doesnt exist");
        for(uint i = 0; i < _values.length; i++) {
            uint256 id = _options[i];
            uint256 qt = _values[i];
            require(_values[i] < balanceOf(fromAddress, _options[i]), "OUT_OF_STOCK");
            require(presalerListPurchases[id][toBuyer] + qt <= presalePurchaseLimit[id], "EXCEED_ALLOC");
        }
            // Option is used as a token ID here
            nftContract.safeBatchTransferFrom(
                fromAddress,
                toBuyer,
                _options,
                _values,
                _data
            );

        for(uint i = 0; i < _values.length; i++) {
            uint256 id = _options[i];
            uint256 qt = _values[i];
            presalerListPurchases[id][toBuyer] += qt;
        }            
    }

    function presaleBuyBatch(uint256[] memory _ids,uint256[] memory _quantities, bytes memory _data) 
            external nonReentrant payable {
        uint256 totalPay = 0;
        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 _id = _ids[i];
            uint256 quantity = _quantities[i];
            totalPay += prices[_id] * quantity;
        }
        require(totalPay <= msg.value, "INSUFFICIENT_ETH");
        //for (uint256 i = 0; i < _ids.length; i++) {
        //    _presaleBuy(_ids[i],_quantities[i], _data);
        //}
        _presaleBatchBuy(_ids, _quantities, _data);
    }
    /*
    function buy(bytes32 hash, bytes memory signature, string memory nonce, uint256 tokenQuantity) external payable {
        require(saleLive, "SALE_CLOSED");
        require(!presaleLive, "ONLY_PRESALE");
        require(matchAddresSigner(hash, signature), "DIRECT_MINT_DISALLOWED");
        require(!_usedNonces[nonce], "HASH_USED");
        require(hashTransaction(msg.sender, tokenQuantity, nonce) == hash, "HASH_FAIL");
        require(totalSupply() < SVS_MAX, "OUT_OF_STOCK");
        require(publicAmountMinted + tokenQuantity <= SVS_PUBLIC, "EXCEED_PUBLIC");
        require(tokenQuantity <= SVS_PER_MINT, "EXCEED_SVS_PER_MINT");
        require(SVS_PRICE * tokenQuantity <= msg.value, "INSUFFICIENT_ETH");
        
        for(uint256 i = 0; i < tokenQuantity; i++) {
            publicAmountMinted++;
            _safeMint(msg.sender, totalSupply() + 1);
        }
        
        _usedNonces[nonce] = true;
    }
    */
     function setBaseMetadataURI(string memory _uri) public onlyOwner{
        baseMetadataURI = _uri;
    }

    /*
     * Note: make sure code that calls this is non-reentrant.
     * Note: this is the token _id *within* the ERC1155 contract, not the option
     *       id from this contract.
     */
    function _createOrMint(
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes memory _data
    ) internal {
        ERC1155Tradable tradable = ERC1155Tradable(nftAddress);
        // Lazily create the token
        if (!tradable.exists(_id)) {
            tradable.create(_to, _id, _amount, "", _data);
        } else {
            tradable.mint(_to, _id, _amount, _data);
        }
    }

    // function _isOwnerOrProxy(address _address) internal view returns (bool) {
    //     ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
    //     return
    //         owner() == _address || (isProxyUseForLive && (address(proxyRegistry.proxies(owner())) == _address));
    // }
    function setProxyUseForLive(bool _bUse) external onlyOwner {
        isProxyUseForLive = _bUse;
    }
    modifier onlyValidOption(uint _option) {
        require(_option > 0 && _option <= NUM_ITEM_OPTIONS, "NFT Type ID is invalid");
        _;
    }
    modifier onlyValidOptions(uint[] memory _options) {
        for (uint256 i = 0; i < _options.length; i++) {
            uint256 _id = _options[i];
            require(_id > 0 && _id <= NUM_ITEM_OPTIONS, "NFT Type ID is invalid in ID list");
        }
        _;
    }
    modifier notLocked {
        require(!locked, "Contract metadata methods are locked");
        _;
    }
    modifier onlyOwners() {
        require(owner() == _msgSender() || owner() == lootBoxAddress, "Ownable: caller is not the owner");
        _;
    }

    function toggleLockedStatus() external onlyOwners {
        locked = !locked;
    }
    function togglePresaleStatus() external onlyOwners {
        presaleLive = !presaleLive;
    }
    
    function toggleSaleStatus() external onlyOwners {
        saleLive = !saleLive;
    }
    function withdraw() public payable onlyOwners {
        //(bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        payable(msg.sender).transfer(address(this).balance);
        //  require(success);
    }
}