// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SystemContract} from "./helpers/SystemContract.sol";
import "./interfaces/IZRC20.sol";
import {SwapHelperLib} from "./helpers/SwapHelperLib.sol";
import {BytesHelperLib} from "./helpers/BytesHelperLib.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {RevertContext, RevertOptions} from "./zetachain/Revert.sol";
import {
    IUniversalContract,
    MessageContext
} from "./interfaces/IUniversalContract.sol";
import {IGatewayZEVM, CallOptions} from "./interfaces/IGatewayZEVM.sol";

contract UniversalDApp is IUniversalContract {
    SystemContract public systemContract;
    IGatewayZEVM public gateway;
    uint256 constant BITCOIN = 18332;

    event Reverted(bytes recipient, address asset, uint256 amount);

    error InvalidAddress();
    error InvalidChainToken();
    error NotGateway();

    modifier onlyGateway() {
        if (msg.sender != address(gateway)) revert NotGateway();
        _;
    }

    constructor(address _systemContract, address _gateway) payable {
        if (_systemContract == address(0) || _gateway == address(0)) revert InvalidAddress();
        systemContract = SystemContract(_systemContract);
        gateway = IGatewayZEVM(_gateway);
    }

    struct Params {
        address targetChainToken;
        uint256 gasLimit;
        bytes targetChainCounterparty;
        bytes recipient;
        bytes destinationPayload;
    }

    function onCall(MessageContext calldata, address zrc20, uint256 amount, bytes calldata message)
        external
        onlyGateway
    {
        Params memory params;
        (params.targetChainToken, params.targetChainCounterparty, params.recipient, params.destinationPayload) =
            abi.decode(message, (address, bytes, bytes, bytes));

        if (params.targetChainToken == address(0)) revert InvalidChainToken();

        swapAndWithdraw(zrc20, amount, params);
    }

    function onRevert(RevertContext calldata revertContext) external onlyGateway {
        address targetToken = revertContext.asset;
        uint256 amount = revertContext.amount;

        (address gasZRC20, uint256 gasFee) = IZRC20(targetToken).withdrawGasFee();

        uint256 outputAmount;
        if (gasZRC20 == targetToken) {
            outputAmount = amount - gasFee;
            IZRC20(gasZRC20).approve(address(gateway), amount);
        } else {
            outputAmount =
                amount - SwapHelperLib.swapTokensForExactTokens(systemContract, targetToken, gasFee, gasZRC20, amount);
            IZRC20(gasZRC20).approve(address(gateway), gasFee);
            IZRC20(targetToken).approve(address(gateway), outputAmount);
        }

        // Decode the revert message
        bytes memory recipient = abi.decode(revertContext.revertMessage, (bytes));

        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: "",
            onRevertGasLimit: 0
        });

        // Withdraw the tokens to the original recipient
        gateway.withdraw(recipient, outputAmount, targetToken, revertOptions);

        emit Reverted(recipient, targetToken, outputAmount);
    }

    function swapAndWithdraw(address inputToken, uint256 amount, Params memory params) internal {
        // Get the gas fee required for withdrawal and call
        (address gasZRC20, uint256 gasFee) = IZRC20(params.targetChainToken).withdrawGasFeeWithGasLimit(params.gasLimit);
        uint256 swapAmount;
        // Calculate the amount left after covering gas fees
        if (gasZRC20 == inputToken) {
            swapAmount = amount - gasFee;
        } else {
            swapAmount =
                amount - SwapHelperLib.swapTokensForExactTokens(systemContract, inputToken, gasFee, gasZRC20, amount);
        }

        // Perform the token swap if the input and target tokens are different
        uint256 outputAmount = swapAmount;
        if (inputToken != params.targetChainToken) {
            outputAmount = SwapHelperLib.swapExactTokensForTokens(
                systemContract, inputToken, swapAmount, params.targetChainToken, 0
            );
        }

        // Approve the gateway to spend the tokens
        if (gasZRC20 == params.targetChainToken) {
            IZRC20(gasZRC20).approve(address(gateway), outputAmount + gasFee);
        } else {
            IZRC20(gasZRC20).approve(address(gateway), gasFee);
            IZRC20(params.targetChainToken).approve(address(gateway), outputAmount);
        }

        // Prepare the revert options
        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(params.recipient),
            onRevertGasLimit: 0
        });

        // Execute the withdrawal and call operation via the gateway
        CallOptions memory callOptions = CallOptions(params.gasLimit, true);
        gateway.withdrawAndCall(
            params.targetChainCounterparty,
            outputAmount,
            params.targetChainToken,
            params.destinationPayload,
            callOptions,
            revertOptions
        );
    }
}
