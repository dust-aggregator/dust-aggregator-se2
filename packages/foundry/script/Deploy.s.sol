//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import {DeployYourContract} from "./DeployYourContract.s.sol";
import {DeployAll} from "./DeployAll.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        DeployAll deployAll = new DeployAll();
        deployAll.run();

        // DeployYourContract deployYourContract = new DeployYourContract();
        // deployYourContract.run();
        // deploy more contracts here
        // DeployMyContract deployMyContract = new DeployMyContract();
        // deployMyContract.run();
    }
}
