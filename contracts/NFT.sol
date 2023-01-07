//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BUSD.sol";


pragma solidity ^0.8.4;


contract NFT is ERC1155, Ownable{

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    BUSD busd;

    //Custom Error
    error notSending();

    //Pinata
    mapping(uint => string) public provenanceHash;

    mapping(uint=>bool) private tokenExist;
    mapping(uint=>uint) public tokenPrices;

    //After buy 1 token this will be setted in true and can't buy/receive anymore tokens
    mapping(address => bool)public stopBuy;

    constructor()ERC1155(""){

    }


    //Initialize BUSD address
    function initBUSDAddress(address BUSDAddress)public onlyOwner{
        busd = BUSD(BUSDAddress);
    }



    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        return provenanceHash[_tokenId];
    }



    function mint(
        uint id,
        uint amount,
        uint price,
        string memory _uri
        )external onlyOwner{
            require(!tokenExist[id], "Token Already Minted!");
            tokenExist[id] = true;
            string memory tokenId = Strings.toString(id);
            provenanceHash[id] = string(abi.encodePacked(_uri, "/" , tokenId, ".json"));
            tokenPrices[id] = price;
            _mint(msg.sender, id, amount, "0x00");
    }




    function buyBUSDTokens()external payable{
        require(msg.value == 1 ether, "Set Right price to buy 100000 BUSD!");
        uint busdToSend = 100000*10**18;
        busd.transferFrom(address(busd), msg.sender, busdToSend);
    }



    function buyNftToken(uint tokenId)external{
        require(stopBuy[msg.sender] == false, "Can't buy more tokens!");
        require(
            busd.balanceOf(msg.sender) >= tokenPrices[tokenId], "Set right price ti buy this nft!"
            );

        uint price = tokenPrices[tokenId];
        busd.transferFrom(msg.sender, address(this), price);
        _safeTransferFrom(owner(), msg.sender, tokenId, 1, "0x00");
    }



    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual override {
        if(stopBuy[to] == false){
            stopBuy[to] = true;
            super._safeTransferFrom(from, to, id, amount, data);
        }else{
            revert notSending();
        }
    }



    function withdraw()external onlyOwner{
        require(
            busd.balanceOf(address(this)) > 0,
            "Nothing to withdraw!"
            );

        uint amountToReceive = busd.balanceOf(address(this));

        busd.transfer(owner(), amountToReceive);
    }



    receive()external payable{}


}
