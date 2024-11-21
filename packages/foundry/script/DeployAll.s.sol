//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";
import {Swap} from "../contracts/Swap.sol";
import {EvmDustTokens} from "../contracts/EvmDustTokens.sol";
import {ISwapRouter} from "../contracts/ISwapRouter.sol";
import {IPermit2} from "../contracts/lib/permit2/IPermit2.sol";

struct LocalnetAddress {
    address address2;
    string chain;
    string type2;
}

struct Localnet {
    LocalnetAddress[] addresses;
    uint256 pid;
}

contract DeployAll is ScaffoldETHDeploy {
    function readLocalnetAddresses(
        string memory chain,
        string memory contractType
    ) public view returns (address addr) {
        Localnet memory ln = getJson("localnet.json");
        for (uint256 i = 0; i < ln.addresses.length; i++) {
            if (
                keccak256(bytes((ln.addresses[i].chain))) ==
                keccak256(bytes(chain)) &&
                keccak256(bytes(ln.addresses[i].type2)) ==
                keccak256(bytes(contractType))
            ) {
                addr = ln.addresses[i].address2;
                break;
            }
        }
    }

    function getLocalnetPath(
        string memory fileName
    ) public returns (string memory path) {
        string memory root = vm.projectRoot();
        path = string.concat(root, "/", fileName);
    }

    function getJson(
        string memory fileName
    ) internal view returns (Localnet memory) {
        string memory root = vm.projectRoot();

        string memory path = string.concat(root, "/", fileName);
        string memory json = vm.readFile(path);
        bytes memory data = vm.parseJson(json);

        return abi.decode(data, (Localnet));
    }

    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {
        Localnet memory ln = getJson("localnet.json");

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

        console.log(ln.pid);
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

        string memory jsonObj = '{ "pid": "This is a test" }';
        vm.writeJson(jsonObj, getLocalnetPath("localnet.json"));
    }
}
