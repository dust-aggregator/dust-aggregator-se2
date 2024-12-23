// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

struct LocalnetAddress {
    address address2;
    string chain;
    string type2;
}

struct Localnet {
    LocalnetAddress[] addresses;
    uint256 pid;
}

contract ZetachainUtils is Script {
    function getLocalnetPath(
        string memory fileName
    ) public view returns (string memory path) {
        string memory root = vm.projectRoot();
        path = string.concat(root, "/", fileName);
    }

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

    function _writeAddresses(LocalnetAddress[] memory addresses) public {
        string memory finalObj;
        for (uint256 i = 0; i < addresses.length; i++) {
            string memory comma;
            if (i < addresses.length - 1) {
                comma = ",";
            }

            string memory element = string.concat(
                '{ "address2": "',
                vm.toString(addresses[i].address2),
                '", ',
                '"chain": "',
                addresses[i].chain,
                '", ',
                '"type2": "',
                addresses[i].type2,
                '" }',
                comma
            );

            finalObj = string.concat(finalObj, element);
        }

        vm.writeJson(
            string.concat("[", finalObj, "]"),
            getLocalnetPath("localnet.json"),
            ".addresses"
        );
    }

    function writeAddressToFile(
        string memory chain,
        string memory contractType,
        address address2
    ) public {
        Localnet memory ln = getJson("localnet.json");

        bool doesExist = false;
        for (uint256 i = 0; i < ln.addresses.length; i++) {
            if (
                keccak256(bytes((ln.addresses[i].chain))) ==
                keccak256(bytes(chain)) &&
                keccak256(bytes(ln.addresses[i].type2)) ==
                keccak256(bytes(contractType))
            ) {
                doesExist = true;

                ln.addresses[i] = LocalnetAddress(
                    address2,
                    ln.addresses[i].chain,
                    ln.addresses[i].type2
                );
                break;
            }
        }

        if (doesExist) {
            _writeAddresses(ln.addresses);
        } else {
            //add a new entry
            LocalnetAddress[] memory newAddressesArr = new LocalnetAddress[](
                ln.addresses.length + 1
            );
            for (uint256 i = 0; i < ln.addresses.length; i++) {
                newAddressesArr[i] = LocalnetAddress(
                    ln.addresses[i].address2,
                    ln.addresses[i].chain,
                    ln.addresses[i].type2
                );
            }

            newAddressesArr[ln.addresses.length] = LocalnetAddress(
                address2,
                chain,
                contractType
            );

            _writeAddresses(newAddressesArr);
        }
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
}
