const LcrptToken = artifacts.require('./LcrptToken');
const LcrptTokenSale = artifacts.require('./LcrptTokenSale');

contract('LcrptTokenSale', async (accounts) => {
  let token, saleToken;
  const tokenPrice = 1000000000000000; // in wei
  const admin = accounts[0];
  const buyer = accounts[1];
  const numberOfTokens = 10;
  const tokensAvailable = 750000;

  before(async () => {
    token = await LcrptToken.deployed();
    saleToken = await LcrptTokenSale.deployed();
  });

  describe('Init Token', async () => {
    it('Initilizes contracts with the correct values', async () => {
      const token = await LcrptToken.deployed();
      const saleToken = await LcrptTokenSale.deployed();
      const address = await saleToken.address;
      const contract = await saleToken.tokenContract();
      const price = await saleToken.tokenPrice();

      assert.notEqual(address, 0x0, 'has contract address');
      assert.notEqual(contract, 0x0, 'has a token contract address');
      assert.equal(price, tokenPrice, 'has a token contract address');
    });
  });

  describe('buyTokens', async () => {
    it('Should buy the good amount of tokens', async () => {
      await token.transfer(saleToken.address, tokensAvailable, { from: admin });

      // should buy good amount of token
      await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      });

      const buyerBalance = await token.balanceOf(buyer);
      const balance = await token.balanceOf(saleToken.address);

      assert.equal(buyerBalance.toNumber(), numberOfTokens);
      assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);

      // Should increments the number of tokens
      await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      });

      const amount = await saleToken.tokensSold();

      // to fix: x2 because there is two buyToken action called in that function
      assert.equal(amount.toNumber(), numberOfTokens * 2, 'increments the number of tokens');

      // Should emit Sell event
      const receipt = await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      });

      assert.equal(receipt.logs.length, 1);
      assert.equal(receipt.logs[0].event, 'Sell');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'Log the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'log the amount of tokens that have been purchased');

      // Should require the same amount of tokens
      await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      }).then(assert.fail).catch(err => {
        assert(err.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      });

      // Should not be able to purchase more tokens than available in the total supply
      await saleToken.buyTokens(800000, {
        from: admin,
        value: numberOfTokens * tokenPrice,
      }).then(assert.fail).catch(err => {
        assert(err.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
      });
    });
  });

  describe('endSale', async () => {
    it('Should end sale only by admin', async () => {
      return saleToken.endSale({ from: buyer }).then(assert.fail).catch(err => {
        assert(err.message.indexOf('revert') >= 0, 'Must be an admin to end sale');
      });
    });

    it('Should end sale only by admin', async () => {
      await saleToken.endSale({ from: admin });

      const balance = await token.balanceOf(admin);

      // to fix: buyer bought 3 times 10 tokens in the last
      assert.equal(balance.toNumber(), 999970, 'returns all unsold tokens to admin');
    });
  });
});
