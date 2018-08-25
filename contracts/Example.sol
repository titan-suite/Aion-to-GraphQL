pragma solidity ^0.4.9;


contract Example {

    uint128 public num = 5;
    event NumChanged (uint128);

    function add(uint128 a) public returns (uint128) {
        return num+a;
    }

    function setA(uint128 a) public {
        num = a;
        NumChanged(num);
    }
}