//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import {UniversalDApp} from "../contracts/UniversalDApp.sol";
import {EvmDustTokens, IGatewayEVM} from "../contracts/EvmDustTokens.sol";
import {ISwapRouter} from "../contracts/interfaces/ISwapRouter.sol";
import {IPermit2} from "../contracts/interfaces/IPermit2.sol";
import {ZetachainUtils} from "./ZetachainUtils.s.sol";
import {SimpleSwap} from "../test/SimpleSwap.sol";

contract DeployAll is ScaffoldETHDeploy, ZetachainUtils {
    address constant uniswapRouterV3 = 0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4;
    address constant weth = 0x4200000000000000000000000000000000000006;

    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {

        (, address _deployer, ) = vm.readCallers();

        // UniversalDApp dApp = new UniversalDApp(
        //     ZETA_SYSTEM_CONTRACT_ADDRESS,
        //     payable(ZETA_GATEWAY_ADDRESS)
        // );

        // address[] memory tokenList = new address[](4);
        // tokenList[0] = dai;
        // tokenList[1] = link;
        // tokenList[2] = uni;
        // tokenList[3] = wbtc;
        SimpleSwap simpleSwap = new SimpleSwap(
            ISwapRouter(uniswapRouterV3),
            payable(weth)
        );

        console.logString(
            string.concat(
                "SimpleSwap deployed at: ",
                vm.toString(address(simpleSwap))
            )
        );

        // writeAddressToFile("zetachain", "dApp", address(dApp));

        // writeAddressToFile("ethereum", "EvmDustTokens", address(evmDustTokens));
        // writeAddressToFile("ethereum", "uniswapRouterV3", uniswapRouterV3);
        // writeAddressToFile("ethereum", "uniswapQuoterV3", uniswapQuoterV3);
        // writeAddressToFile("ethereum", "weth", weth);
        // writeAddressToFile("ethereum", "dai", dai);
        // writeAddressToFile("ethereum", "usdc", usdc);
        // writeAddressToFile("ethereum", "uni", uni);
        // writeAddressToFile("ethereum", "wbtc", wbtc);
        // writeAddressToFile("ethereum", "link", link);
    }
}
