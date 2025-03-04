const { ethers } = require("ethers");
const moment = require("moment");
const portfolioFactoryAbi = require("./portfolioFactory.json");
const portfolioTokensAbi = require("./portfolioTokens.json");
let polygonFactoryAddress = process.env.POLYGON_FACTORY_ADDRESS;
let kardiaFactoryAddress = process.env.KARDIA_FACTORY_ADDRESS;
const polygonProvider = new ethers.providers.WebSocketProvider(
  process.env.POLYGON_WEBSOCKETPROVIDER
);
const kardiaProvider = new ethers.providers.JsonRpcProvider(
  process.env.KARDIAPROVIDER
);
const polygonSigner = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  polygonProvider
);
const kardiaSigner = new ethers.Wallet(process.env.PRIVATE_KEY, kardiaProvider);
try {
  var factoryContract1, factoryContract2;
  factoryContract1 = new ethers.Contract(
    polygonFactoryAddress,
    portfolioFactoryAbi,
    polygonSigner
  );
  factoryContract2 = new ethers.Contract(
    kardiaFactoryAddress,
    portfolioFactoryAbi,
    kardiaSigner
  );
} catch (e) {
  console.log(e.message);
}
async function setMinter(
  polygonportfolioaddress,
  polygontokenaddress,
  kardiaportfolioaddress,
  kardiatokenaddress
) {
  let contract = new ethers.Contract(
    polygontokenaddress,
    portfolioTokensAbi,
    polygonSigner
  );
  let wait = await contract.addMinter(polygonportfolioaddress);
  await wait.wait();
  contract = new ethers.Contract(
    kardiatokenaddress,
    portfolioTokensAbi,
    kardiaSigner
  );
  wait = await contract.addMinter(kardiaportfolioaddress);
  await wait.wait();
  console.log("minter set");
}
async function deployContracts(name, eventsymbol) {
  const wait1 = await factoryContract1.create_portfolio(
    name,
    eventsymbol,
    moment().unix(),
    process.env.CONTRACT_OWNER_ADDRESS
  );
  const wait2 = await factoryContract2.create_portfolio(
    name,
    eventsymbol,
    moment().unix(),
    process.env.CONTRACT_OWNER_ADDRESS
  );
  await wait1.wait();
  await wait2.wait();
  const index1 = await factoryContract1.showIndexes(name);
  const polygonportfolioaddress = await factoryContract1.buyerDeployedInfo(
    index1
  );
  const polygontokenaddress = await factoryContract1.tokenDeployedInfo(index1);
  // const owner1 = await factoryContract1.owner();
  const index2 = await factoryContract2.showIndexes(name);
  const kardiaportfolioaddress = await factoryContract2.buyerDeployedInfo(
    index2
  );
  const kardiatokenaddress = await factoryContract2.tokenDeployedInfo(index2);
  console.log("INDEX", index1, index2);
  console.log(
    "portfolioaddress",
    polygonportfolioaddress,
    kardiaportfolioaddress
  );
  console.log("tokenaddress", polygontokenaddress, kardiatokenaddress);
  await setMinter(
    polygonportfolioaddress,
    polygontokenaddress,
    kardiaportfolioaddress,
    kardiatokenaddress
  );
  return {
    polygonportfolioaddress,
    polygontokenaddress,
    kardiaportfolioaddress,
    kardiatokenaddress,
  };
}
module.exports = {
  deployContracts,
  factoryContract1,
  factoryContract2,
  setMinter,
};
