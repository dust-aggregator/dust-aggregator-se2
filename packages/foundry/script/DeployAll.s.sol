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

        address uniswapRouterV3 = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
        address weth = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
        address permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

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
    }
}
