const LcrptToken = artifacts.require("LcrptToken");

module.exports = function(deployer) {
  deployer.deploy(LcrptToken, 1000000);
};
