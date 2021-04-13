pragma solidity ^0.4.2;

contract LcrptToken {
  // conctructor
  // set the total number of tokens
  // read the total number of tokens

  uint256 public totalSupply;

  constructor() public {
    totalSupply = 1000000;
  }
}
