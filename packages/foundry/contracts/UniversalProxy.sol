//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC1967Proxy, ERC1967Utils} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract UniversalProxy is ERC1967Proxy {
    error NotAdmin(address);

    modifier onlyAdmin() {
        if (ERC1967Utils.getAdmin() != msg.sender) revert NotAdmin(msg.sender);
        _;
    }
    
    constructor(address _impl, address _admin) ERC1967Proxy(_impl, "") payable {
        ERC1967Utils.changeAdmin(_admin);
    }

    function getAdmin() external view returns (address) {
        return ERC1967Utils.getAdmin();
    }

    function changeAdmin(address _newAdmin) external onlyAdmin {
        ERC1967Utils.changeAdmin(_newAdmin);
    }

    function getImplementation() external view returns (address) {
        return ERC1967Utils.getImplementation();
    }

    function changeImplementation(address _newImpl, bytes calldata _data) external onlyAdmin {
        ERC1967Utils.upgradeToAndCall(_newImpl, _data);
    }
}