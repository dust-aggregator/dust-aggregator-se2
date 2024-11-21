// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PermitHandler {
    uint256 public constant MaxSigDeadline = type(uint256).max; // Replace with the actual max deadline value
    uint256 public constant MaxUnorderedNonce = type(uint256).max; // Replace with the actual max nonce value

    struct PermitTransferFrom {
        uint256 deadline;
        uint256 nonce;
        TokenPermission permitted;
    }

    struct PermitBatchTransferFrom {
        uint256 deadline;
        uint256 nonce;
        TokenPermission[] permitted;
    }

    struct TokenPermission {
        address token;
        uint256 amount;
    }

    struct Witness {
        bytes witness;
    }

    struct PermitData {
        bytes32 domain;
        bytes types; // Replace with your actual type definition for `types`
        bytes values; // Replace with your actual type definition for `values`
    }

    function getPermitData(
        PermitTransferFrom memory permit,
        address permit2Address,
        uint256 chainId,
        Witness memory witness
    ) public view returns (PermitData memory) {
        require(permit.deadline <= MaxSigDeadline, "SIG_DEADLINE_OUT_OF_RANGE");
        require(permit.nonce <= MaxUnorderedNonce, "NONCE_OUT_OF_RANGE");

        bytes32 domain = getPermit2Domain(permit2Address, chainId);

        validateTokenPermissions(permit.permitted);

        bytes memory types = witness.witness.length > 0
            ? getPermitTransferFromWithWitnessType(witness)
            : getPermitTransferFromTypes();

        bytes memory values = witness.witness.length > 0
            ? abi.encode(permit, witness.witness)
            : abi.encode(permit);

        return PermitData({domain: domain, types: types, values: values});
    }

    function getPermit2Domain(
        address permit2Address,
        uint256 chainId
    ) internal pure returns (bytes32) {
        // Implement the logic to generate domain separator
        return keccak256(abi.encode(permit2Address, chainId));
    }

    function validateTokenPermissions(
        TokenPermission memory permission
    ) internal pure {
        // Implement validation logic for token permissions
        require(permission.token != address(0), "INVALID_TOKEN");
        require(permission.amount > 0, "INVALID_AMOUNT");
    }

    function getPermitTransferFromTypes() internal pure returns (bytes memory) {
        // Replace with actual PermitTransferFrom type definition
        return abi.encode("PermitTransferFrom");
    }

    function getPermitTransferFromWithWitnessType(
        Witness memory witness
    ) internal pure returns (bytes memory) {
        // Replace with actual PermitTransferFromWithWitness type definition
        return abi.encode("PermitTransferFromWithWitness", witness.witness);
    }
}
