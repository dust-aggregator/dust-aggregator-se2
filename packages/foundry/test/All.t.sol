// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
// import "../contracts/YourContract.sol";
import {EvmDustTokens} from "../contracts/EvmDustTokens.sol";
import {SimpleSwap} from "../contracts/SimpleSwap.sol";
import {Swap} from "../contracts/Swap.sol";

import {ZetachainUtils} from "../script/ZetachainUtils.s.sol";
import {ISwapRouter} from "../contracts/ISwapRouter.sol";
import {IPermit2} from "../contracts/lib/permit2/IPermit2.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {WETH9} from "./WETH9.sol";

contract YourContractTest is Test, ZetachainUtils {
    address ZETA_SYSTEM_CONTRACT_ADDRESS;
    address ZETA_GATEWAY_ADDRESS;
    address GATEWAY_ADDRESS;
    address UNISWAP_ROUTER;
    address UNISWAP_QUOTER;

    address WETH_ADDRESS;
    address DAI_ADDRESS;
    address LINK_ADDRESS;
    address UNI_ADDRESS;
    address WBTC_ADDRESS;
    address USDC_ADDRESS;

    WETH9 WETH;
    IERC20 DAI;
    IERC20 USDC;
    IERC20 LINK;
    IERC20 UNI;
    IERC20 WBTC;

    address permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    address deployer;

    function setUp() public {
        UNISWAP_ROUTER = readLocalnetAddresses("ethereum", "uniswapRouterV3");
        UNISWAP_QUOTER = readLocalnetAddresses("ethereum", "uniswapQuoterV3");
        GATEWAY_ADDRESS = readLocalnetAddresses("ethereum", "gatewayEVM");

        WETH_ADDRESS = readLocalnetAddresses("ethereum", "weth");
        DAI_ADDRESS = readLocalnetAddresses("ethereum", "dai");
        USDC_ADDRESS = readLocalnetAddresses("ethereum", "usdc");
        UNI_ADDRESS = readLocalnetAddresses("ethereum", "uni");
        LINK_ADDRESS = readLocalnetAddresses("ethereum", "link");
        WBTC_ADDRESS = readLocalnetAddresses("ethereum", "wbtc");

        ZETA_SYSTEM_CONTRACT_ADDRESS = readLocalnetAddresses(
            "zetachain",
            "systemContract"
        );
        ZETA_GATEWAY_ADDRESS = readLocalnetAddresses(
            "zetachain",
            "gatewayZEVM"
        );

        deployer = vm.addr(1);

        SimpleSwap simpleSwap = new SimpleSwap(
            ISwapRouter(UNISWAP_ROUTER),
            payable(WETH_ADDRESS)
        );

        // (, address _deployer, ) = vm.readCallers();

        EvmDustTokens dustTokens = new EvmDustTokens(
            payable(GATEWAY_ADDRESS),
            ISwapRouter(UNISWAP_ROUTER),
            payable(WETH_ADDRESS),
            deployer,
            IPermit2(permit2)
        );

        vm.startPrank(deployer);
        dustTokens.addToken(DAI_ADDRESS);
        dustTokens.addToken(LINK_ADDRESS);
        dustTokens.addToken(UNI_ADDRESS);
        dustTokens.addToken(WBTC_ADDRESS);
        vm.stopPrank();

        WETH = WETH9(payable(WETH_ADDRESS));
        DAI = IERC20(DAI_ADDRESS);
        USDC = IERC20(USDC_ADDRESS);
        LINK = IERC20(LINK_ADDRESS);
        UNI = IERC20(UNI_ADDRESS);
        WBTC = IERC20(WBTC_ADDRESS);

        Swap swap = new Swap(
            ZETA_SYSTEM_CONTRACT_ADDRESS,
            payable(ZETA_GATEWAY_ADDRESS)
        );

        vm.deal(deployer, 15 ether);

        vm.startPrank(deployer);
        WETH.approve(permit2, type(uint256).max);
        DAI.approve(permit2, type(uint256).max);
        USDC.approve(permit2, type(uint256).max);
        LINK.approve(permit2, type(uint256).max);
        UNI.approve(permit2, type(uint256).max);
        WBTC.approve(permit2, type(uint256).max);

        WETH.deposit{value: 10 ether}();
        vm.stopPrank();
    }

    function testSimpleSwap() public {
        // uint256 balanceOf = WETH.balanceOf(deployer);
        // console.log(balanceOf);

        console.log("Hello!");
        // string memory jsonObj = "0x1234";
        // vm.writeJson(jsonObj, getLocalnetPath("localnet.json"), ".addresses");
        // writeAddressToFile("momma", "WETH", address(0));
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
