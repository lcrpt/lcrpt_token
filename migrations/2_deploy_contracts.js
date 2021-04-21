const LcrptToken = artifacts.require('LcrptToken');
const LcrptTokenSale = artifacts.require('LcrptTokenSale');

module.exports = async (deployer) => {
  const tokenPrice = 1000000000000000; // wei token pice is 0,001 ETH

  await deployer.deploy(LcrptToken, 1000000);
  await deployer.deploy(LcrptTokenSale, LcrptToken.address, tokenPrice);
};
