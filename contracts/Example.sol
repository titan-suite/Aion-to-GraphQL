pragma solidity ^0.4.9;
contract Example {
    uint128 public num = 5;
    function add(uint128 a) public returns (uint128) {
    return uint128(num+a);
    }
    function setA(uint128 a) public {
        num = a;
    }
}