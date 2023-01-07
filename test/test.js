const{expect} = require("chai");
const{expectRevert, ether} = require("@openzeppelin/test-helpers");


describe("Testing contracts functionalities", function(){

    let Busd, busd, Nft, nft, owner, account1, account2;

    const ipfs = "https://gateway.pinata.cloud/ipfs/QmTVHG1MvdRWWKQydTM3oEZ9GnUUTBuox2CJGmgNNFrEbn";


    before(async()=>{

        [owner, account1, account2] = await ethers.getSigners();


        Nft = await ethers.getContractFactory("NFT");
        nft = await Nft.deploy();
        await nft.deployed();


        Busd = await ethers.getContractFactory("BUSD");
        busd = await Busd.deploy(ethers.utils.parseEther("1000000"), nft.address);
        await busd.deployed();


        await nft.initBUSDAddress(busd.address);

        await nft.mint(1, 1000, ethers.utils.parseEther("50000"), ipfs);
        await nft.mint(2, 10000, ethers.utils.parseEther("10000"), ipfs);
        await nft.mint(3, 100000, ethers.utils.parseEther("1000"), ipfs);
        await nft.mint(4, 500000, ethers.utils.parseEther("500"), ipfs);
        await nft.mint(5, 1000000, ethers.utils.parseEther("100"), ipfs);

        let uriToken1 = await nft.uri(1);
        let uriToken2 = await nft.uri(2);
        let uriToken3 = await nft.uri(3);
        let uriToken4 = await nft.uri(4);
        let uriToken5 = await nft.uri(5);

        console.log("Uri Token1: ", uriToken1);
        console.log("Uri Token2: ", uriToken2);
        console.log("Uri Token3: ", uriToken3);
        console.log("Uri Token4: ", uriToken4);
        console.log("Uri Token5: ", uriToken5);
        console.log("");

    });



    it("should be able to buy 100000 BUSD for 1 ether", async()=>{
        await nft.connect(account1).buyBUSDTokens({value: ethers.utils.parseEther("1")});
    });



    it("should revert to buy 100000 BUSD for 2 ether", async()=>{
        await expectRevert(nft.connect(account1).buyBUSDTokens({value: ethers.utils.parseEther("2")}),
            "Set Right price to buy 100000 BUSD!");
    });



    it("should be able to buy 1 nft", async()=>{
        let balanceBeforeBuy = await busd.balanceOf(account1.address);
        console.log("Balance account 1 Before buy: ", balanceBeforeBuy/10**18, "ether");

        let tokenPrice = nft.tokenPrices(1);

        await busd.connect(account1).approve(nft.address, tokenPrice);
        await nft.connect(account1).buyNftToken(1);

        let balanceAfterBuy = await busd.balanceOf(account1.address);
        console.log("Balance account 1 After buy: ", balanceAfterBuy/10**18, "ether");
    });



    it("should revert to buy a new nft", async()=>{
        await expectRevert(nft.connect(account1).buyNftToken(1), "Can't buy more tokens!");
    });


    it("should revert to send nft to someone already have one", async()=>{
        await expect(
            nft.connect(owner).safeTransferFrom(owner.address, account1.address, 1, 1, "0x00"))
                .to.be.revertedWithCustomError(
                    nft,
                    'notSending'
            );
    });



    it("should be able to withdraw (only the owner)", async()=>{

        let balanceBeforeWithdraw = await busd.balanceOf(owner.address);
        console.log("Balance owner Before withdraw: ", balanceBeforeWithdraw/10**18, "ether");

        await nft.withdraw();

        let balanceAfterWithdraw = await busd.balanceOf(owner.address);
        console.log("Balance owner Before withdraw: ", balanceAfterWithdraw/10**18, "ether");
    })





})