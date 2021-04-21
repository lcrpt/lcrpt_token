const LcrptToken = artifacts.require('./LcrptToken');
const LcrptTokenSale = artifacts.require('./LcrptTokenSale');

contract('LcrptTokenSale', (accounts) => {
  let token;
  let saleToken;
  const tokenPrice = 1000000000000000; // in wei
  const admin = accounts[0];
  const buyer = accounts[1];
  const numberOfTokens = 10;
  const tokensAvailbale = 750000;

  before(async () => {
    token = await LcrptToken.deployed();
    saleToken = await LcrptTokenSale.deployed();
  });

  describe('Init Token', async () => {
    it('Initilizes contracts with the correct values', async () => {
      const address = await saleToken.address;
      const contract = await saleToken.tokenContract();
      const price = await saleToken.tokenPrice();

      assert.notEqual(address, 0x0, 'has contract address');
      assert.notEqual(contract, 0x0, 'has a token contract address');
      assert.equal(price, tokenPrice, 'has a token contract address');
    });
  });

  describe('buyTokens', async () => {
    it('Should increments the number of tokens', async () => {
      await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      });

      const amount = await saleToken.tokensSold();
      console.log('AMOUNT', amount)

      assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens');
    });

    it('Should emit Sell event', async () => {
      const receipt = await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      });

      assert.equal(receipt.logs.length, 1);
      assert.equal(receipt.logs[0].event, 'Sell');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'Log the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'log the amount of tokens that have been purchased');
    });

    it('Should require the same amount of tokens', async () => {
      await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      }).then(assert.fail).catch(err => {
        assert(err.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      });
    });

    it('Should not be able to purchase more tokens than available in the total supply', async () => {
      await saleToken.buyTokens(800000, {
        from: admin,
        value: numberOfTokens * tokenPrice,
      }).then(assert.fail).catch(err => {
        assert(err.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
      });;
    });

    it('Should buy the good amount of tokens', async () => {
      await saleToken.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      });

      const buyerBalance = await token.balanceOf(buyer);
      const balance = await token.balanceOf(saleToken.address);

      assert.equal(buyerBalance.toNumber(), tokensAvailbale - numberOfTokens);
      assert.equal(balance.toNumber(), tokensAvailbale - numberOfTokens);
    });
  });
});
























//
