const LcrptToken = artifacts.require('./LcrptToken');

contract('LcrptToken', (accounts) => {
  let token;

  before(async () => {
    token = await LcrptToken.deployed();
  });

  describe('Init Token', async () => {
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
  });

  describe('Transfer LcrptToken', async () => {
    it('Transfer token must throw when sender doesnt have enough', () => {
      return token.transfer.call(accounts[1], 99999999999999)
        .then(assert.fail)
        .catch(e => {
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

  describe('Approval', async () => {
    it('Approve tokens for dedicated transfer', async () => {
      const success = await token.approve.call(accounts[1], 100);

      assert.equal(success, true, 'appreve transfer return true');
    });

    it('Should emit event on approve tokens', async () => {
      const receipt = await token.approve(accounts[1], 100);

      assert.equal(receipt.logs.length, 1, 'trigger one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'Should be a "Approval" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
      assert.equal(receipt.logs[0].args._value, 100, 'logs the approval amount');
    });

    it('Allowance', async () => {
      await token.approve(accounts[1], 100, { from: accounts[0] });
      const allowance = await token.allowance(accounts[0], accounts[1]);

      assert.equal(allowance.toNumber(), 100, 'Store the allowance for delegated transfer');
    });
  });

  describe('Approval', async () => {
    it('Handles delegated token transfers', async () => {
      const fromAccount = accounts[2];
      const toAccount = accounts[3];
      const spendingAccount = accounts[4];

      // transfer some token to fromAccount
      await token.transfer(fromAccount, 100, { from: accounts[0] });

      // approve spendingAccount to spend 10 tokens from fromAccount
      await token.approve(spendingAccount, 10, { from: fromAccount });

      // try to send something larger than serder balance
      await token.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount })
        .then(assert.fail)
        .catch(err => {
          assert(err.message.indexOf('revert') >= 0, 'Can not transfer value to larger amount');
        });

      // try to send something larger than approved amount
      await token.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount })
        .then(assert.fail)
        .catch(err => {
          assert(err.message.indexOf('revert') >= 0, 'Can not transfer value to larger amount');
        });

      const success = await token.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
      assert.equal(success, true);

      // should emit transfer events
      const receipt = await token.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });

      assert.equal(receipt.logs.length, 1, 'trigger one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'Should be a "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transfered from');
      assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transfered to');
      assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');

      // update the balance
      const balanceOfFromAccount = await token.balanceOf(fromAccount);
      assert.equal(balanceOfFromAccount, 90, 'deduct the amount from the sending account');

      const balanceOfToAccount = await token.balanceOf(toAccount);
      assert.equal(balanceOfToAccount, 10, 'adds the amount from the receiving account');

      // update the allowance
      const allowance = await token.allowance(fromAccount, spendingAccount);
      assert.equal(allowance, 0, 'deducts the amount from the allowance');
    });
  });
});
