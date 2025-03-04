require("dotenv").config();
const { ethers } = require("ethers");
const moment = require("moment");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const types = {
  Whitelist: [
    { name: "sender", type: "address" },
    { name: "tokens", type: "uint256" },
    { name: "timestamp", type: "uint256" },
    { name: "amount", type: "uint256" },
  ],
};
async function signTransaction(
  contractaddress,
  sender,
  maticUserPay,
  tokensUserGet
) {
  console.log(contractaddress, sender, maticUserPay, tokensUserGet);
  const domain = {
    name: "PREDICTRAM_WHITELIST_SERVICE",
    version: "1",
    chainId: 24,
    verifyingContract: contractaddress,
  };
  const timestamp = moment().unix();
  const value = {
    sender,
    tokens: parseInt(tokensUserGet * 1000),
    timestamp,
    amount: parseInt(maticUserPay * 100),
  };
  console.log(value);
  const sign = await wallet._signTypedData(domain, types, value);
  console.log(sign);
  return [
    sender,
    parseInt(tokensUserGet * 1000),
    timestamp,
    parseInt(maticUserPay * 100),
    sign,
  ];
}
module.exports = { signTransaction };
