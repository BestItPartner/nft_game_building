import Web3 from "web3";
import BuildingResourceProvider from "../src/contracts/BuildingResourceProvider.json";
import BuildingResource from "../src/contracts/BuildingResource.json";
import BigNumber from 'bignumber.js/bignumber'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

function getWeb3() {
    let web3;
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
    } 
    return web3;
}

export async function presaleBuy(items, price) {    
    let web3 = getWeb3();    
    if (web3 != undefined) {        
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            const accountAddress = accounts[0];
            const balanceWei = await web3.eth.getBalance(accountAddress);
            const priceWei = web3.utils.toWei(price.toString(), "Ether");
            const networkId = await web3.eth.net.getId();
            const networkData = BuildingResourceProvider.networks[networkId];

            if (balanceWei < priceWei) {
                // window.alert("The balance is insufficient for buying items");
            }
            else if (networkData == undefined) {
                return "The contract information is not correct.";
            }

            const BRPContract = new web3.eth.Contract(
                BuildingResourceProvider.abi,
                networkData.address
                );

            let _ids = [];
            let _amounts = [];
            
            items.forEach(currentItem => {
                _ids.push(currentItem.id);
                _amounts.push(currentItem.count);
            })
            
            await BRPContract.methods
                .presaleBuyBatch(_ids, _amounts, "0x00")
                .send({ from: accountAddress, gas: "1000000", gasPrice: "5000000000", value: priceWei})
                .on("confirmation", () => {                        
                });
            
            return "Awesome, Your presale request is completed.";
        }
    }
    else {
        return "Non-Ethereum browser detected. You should consider trying MetaMask!";
    }

    return "Presale request was failed with some reasons.";
}


export async function getNFTtokens() {  
    let web3 = getWeb3();    
    let tokens = [];
    
    if (web3 != undefined) {        
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            const accountAddress = accounts[0];
            const networkId = await web3.eth.net.getId();
            const networkData = BuildingResource.networks[networkId];

            const BRContract = new web3.eth.Contract(
                BuildingResource.abi,
                networkData.address
                );

            let _addresses = [];
            let _ids = [];
            for (let tokenId = 1; tokenId <= 15; tokenId++) {
                _ids.push(tokenId);
                _addresses.push(accountAddress);
            }

            let _amounts = await BRContract.methods
                .balanceOfBatch(_addresses, _ids)
                .call();

            _amounts.map((item, index) => {
                if (item > 0) {
                    tokens.push({'id': _ids[index], 'amount': item});
                }
            });
        }
    }

    return tokens;
}