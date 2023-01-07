//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract BUSD is ERC20, Ownable{

    constructor(uint maxTokenSupply, address NFTAddress)ERC20("BUSD Token", "BUSD"){
        _mint(address(this), maxTokenSupply);
        _approve(address(this), NFTAddress, maxTokenSupply);
    }
}
