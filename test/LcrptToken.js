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
});
