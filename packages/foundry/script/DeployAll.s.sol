//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";
import {Swap} from "../contracts/Swap.sol";
import {EvmDustTokens} from "../contracts/EvmDustTokens.sol";
import {ISwapRouter} from "../contracts/ISwapRouter.sol";
import {IPermit2} from "../contracts/lib/permit2/IPermit2.sol";
import {ZetachainUtils} from "./ZetachainUtils.s.sol";

struct LocalnetAddress {
    address address2;
    string chain;
    string type2;
}

struct Localnet {
    LocalnetAddress[] addresses;
    uint256 pid;
}

contract DeployAll is ScaffoldETHDeploy, ZetachainUtils {
    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {
        address ZETA_SYSTEM_CONTRACT_ADDRESS = readLocalnetAddresses(
            "zetachain",
            "systemContract"
        );

        address ZETA_GATEWAY_ADDRESS = readLocalnetAddresses(
            "zetachain",
            "gatewayZEVM"
        );

        address GATEWAY_ADDRESS = readLocalnetAddresses(
            "ethereum",
            "gatewayEVM"
        );

        console.log(ZETA_SYSTEM_CONTRACT_ADDRESS);
        console.log(ZETA_GATEWAY_ADDRESS);
        console.log(GATEWAY_ADDRESS);

        //Defaults to Arbitrum addresses
        address permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

        address uniswapRouterV3 = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
        address uniswapQuoterV3 = 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6;
        address weth = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
        address dai = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;
        address usdc = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
        address uni = 0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0;
        address wbtc = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f;
        address link = 0xf97f4df75117a78c1A5a0DBb814Af92458539FB4;

        (, address _deployer, ) = vm.readCallers();

        Swap swap = new Swap(
            ZETA_SYSTEM_CONTRACT_ADDRESS,
            payable(ZETA_GATEWAY_ADDRESS)
        );
        EvmDustTokens evmDustTokens = new EvmDustTokens(
            payable(GATEWAY_ADDRESS),
            ISwapRouter(uniswapRouterV3),
            payable(weth),
            _deployer,
            IPermit2(permit2)
        );
        console.logString(
            string.concat("Swap deployed at: ", vm.toString(address(swap)))
        );

        console.logString(
            string.concat(
                "EvmDustTokens deployed at: ",
                vm.toString(address(evmDustTokens))
            )
        );

        writeAddressToFile("zetachain", "Swap", address(swap));

        writeAddressToFile("ethereum", "EvmDustTokens", address(evmDustTokens));
        writeAddressToFile("ethereum", "uniswapRouterV3", uniswapRouterV3);
        writeAddressToFile("ethereum", "uniswapQuoterV3", uniswapQuoterV3);
        writeAddressToFile("ethereum", "weth", weth);
        writeAddressToFile("ethereum", "dai", dai);
        writeAddressToFile("ethereum", "usdc", usdc);
        writeAddressToFile("ethereum", "uni", uni);
        writeAddressToFile("ethereum", "wbtc", wbtc);
        writeAddressToFile("ethereum", "link", link);
    }
}
