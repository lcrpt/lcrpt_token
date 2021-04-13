pragma solidity ^0.4.2;

contract LcrptToken {
  string public name = 'Lcrpt Token';
  string public symbol = 'LCRPT';
  string public standard = 'Lcrpt Token v1.0';
  uint256 public totalSupply;

  mapping(address => uint256) public balanceOf;

  constructor(uint256 _initialSupply) public {
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
  }
}
