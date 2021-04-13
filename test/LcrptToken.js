const LcrptToken = artifacts.require('./LcrptToken');

contract('LcrptToken', () => {
  it('Sets the total supply upon deployment', async () => {
    const tokenDeploy = await LcrptToken.deployed();
    const supply = await tokenDeploy.totalSupply();

    assert.equal(supply.toNumber(), 1000000, 'Sets the total supply to 1.000.000');
  });
});
