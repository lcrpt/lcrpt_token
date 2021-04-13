const LcrptToken = artifacts.require('./LcrptToken');

contract('LcrptToken', (accounts) => {
  let token;

  before(async () => {
    token = await LcrptToken.deployed();
  });

  it('Initilizes contracts with the correct values', async () => {
    const name = await token.name();
    const symbol = await token.symbol();
    const standard = await token.standard();

    assert.equal(name, 'Lcrpt Token', 'Sets the name to Lcrpt Token');
    assert.equal(symbol, 'LCRPT', 'It sets the symbole to LCRPT');
    assert.equal(standard, 'Lcrpt Token v1.0');
  });

  it('Sets the total supply upon deployment', async () => {
    const supply = await token.totalSupply();
    const adminBalance = await token.balanceOf(accounts[0]);

    assert.equal(supply.toNumber(), 1000000, 'Sets the total supply to 1.000.000');
    assert.equal(adminBalance.toNumber(), 1000000, 'It allocate the initial supply to the admin account');
  });

  describe('Transfer LcrptToken', async () => {
    it('Transfer token must throw when sender doesnt have enough', () => {
      return token.transfer.call(accounts[1], 99999999999999)
        .then(assert.fail)
        .catch(e => {
          console.log('E.MESSAGE', e.message)
          assert(e.message.indexOf('revert') >= 0, 'Error message must contain revert');
        });
    });

    it('Transfer token balances', async () => {
      await token.transfer(accounts[1], 250000, { from: accounts[0] });
      const receiver = await token.balanceOf(accounts[1]);
      const sender = await token.balanceOf(accounts[0]);

      assert.equal(receiver.toNumber(), 250000, 'Adds the amount to the receiving account');
      assert.equal(sender.toNumber(), 750000, 'Deducts the amount to the sending account');
    });

    it('Should emit event on transfer tokens', async () => {
      const receipt = await token.transfer(accounts[1], 250000, { from: accounts[0] });

      assert.equal(receipt.logs.length, 1, 'trigger one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'Should be a "Transfer" event');
      assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transfered from');
      assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transfered to');
      assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
    });

    it('Transfer token should return success', async () => {
      const transfer = await token.transfer.call(accounts[1], 250000, { from: accounts[0] });

      assert.equal(transfer, true, 'Expect transfer to return true');
    });
  });
});
