// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
// import "../contracts/YourContract.sol";
import {SimpleSwap} from "../contracts/SimpleSwap.sol";
import {TestHelpers} from "./TestHelpers.t.sol";
import {ISwapRouter} from "../contracts/ISwapRouter.sol";

contract YourContractTest is Test, TestHelpers {
    address UNISWAP_ROUTER;
    address UNISWAP_QUOTER;
    address WETH_ADDRESS;

    function setUp() public {
        // UNISWAP_ROUTER = readLocalnetAddresses("ethereum", "uniswapRouterV3");
        // UNISWAP_QUOTER = readLocalnetAddresses("ethereum", "uniswapQuoterV3");
        // WETH_ADDRESS = readLocalnetAddresses("ethereum", "weth");
    }

    function testSimpleSwap() public {
        // string memory jsonObj = "0x1234";
        // vm.writeJson(jsonObj, getLocalnetPath("localnet.json"), ".addresses");

        writeAddressToFile("momma", "WETH", address(0));
        // SimpleSwap swap = new SimpleSwap(
        //     ISwapRouter(UNISWAP_ROUTER),
        //     payable(WETH_ADDRESS)
        // );
    }

    /* YourContract public yourContract;

  function setUp() public {
    yourContract = new YourContract(vm.addr(1));
  }

  function testMessageOnDeployment() public view {
    require(
      keccak256(bytes(yourContract.greeting()))
        == keccak256("Building Unstoppable Apps!!!")
    );
  } */
}
