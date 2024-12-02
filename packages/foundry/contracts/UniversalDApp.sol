// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SystemContract} from "./helpers/SystemContract.sol";
import "./interfaces/IZRC20.sol";
import {SwapHelperLib} from "./helpers/SwapHelperLib.sol";
import {BytesHelperLib} from "./helpers/BytesHelperLib.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {RevertContext, RevertOptions} from "./zetachain/Revert.sol";
import {IUniversalContract, MessageContext} from "./interfaces/IUniversalContract.sol";
import {IGatewayZEVM, CallOptions} from "./interfaces/IGatewayZEVM.sol";

contract UniversalDApp is IUniversalContract {
    using SwapHelperLib for SystemContract;
    using BytesHelperLib for bytes;

    SystemContract public immutable systemContract;
    IGatewayZEVM public immutable gateway;
    address constant BITCOIN = 0x65a45c57636f9BcCeD4fe193A602008578BcA90b;
    uint256 constant BITCOIN_CHAIN_ID = 18332;

    event Reverted(bytes indexed recipient, address asset, uint256 amount);
    event SwappedAndWithdrawn(bytes indexed recipient, address asset, uint256 amount);

    error InvalidAddress();
    error InvalidChainToken();
    error NotGateway();
    error NotSupportedChainID();

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
        uint256 minAmount;
        address originalSender;
        bytes targetChainCounterparty;
        bytes destinationPayload;
    }

    function onCall(MessageContext calldata context, address zrc20, uint256 amount, bytes calldata message)
        external
        onlyGateway
    {
        if (context.chainID == BITCOIN_CHAIN_ID) {
            revert NotSupportedChainID();
        }

        Params memory params = abi.decode(message, (Params));
        if (params.targetChainToken == address(0)) {
            revert InvalidChainToken();
        } else if (params.targetChainToken == BITCOIN) {
            swapAndWithdrawBTC(zrc20, amount, params);
        } else {
            swapAndWithdrawEVM(zrc20, amount, params);
        }
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
            outputAmount = amount - systemContract.swapTokensForExactTokens(targetToken, gasFee, gasZRC20, amount);
            IZRC20(gasZRC20).approve(address(gateway), gasFee);
            IZRC20(targetToken).approve(address(gateway), outputAmount);
        }

        bytes memory recipient = revertContext.revertMessage;

        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: false,
            abortAddress: address(0),
            revertMessage: "",
            onRevertGasLimit: 0
        });

        // Withdraw the tokens to the original recipient
        gateway.withdraw(recipient, outputAmount, targetToken, revertOptions);

        emit Reverted(recipient, targetToken, outputAmount);
    }

    function swapAndWithdrawEVM(address inputToken, uint256 amount, Params memory params) internal {
        // Get the gas fee required for withdrawal and call
        (address gasZRC20, uint256 gasFee) = IZRC20(params.targetChainToken).withdrawGasFeeWithGasLimit(params.gasLimit);

        (uint256 outputAmount, RevertOptions memory revertOptions) =
            swapAndApprove(gasZRC20, gasFee, inputToken, amount, params);

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

        emit SwappedAndWithdrawn(params.targetChainCounterparty, params.targetChainToken, outputAmount);
    }

    function swapAndWithdrawBTC(address inputToken, uint256 amount, Params memory params) internal {
        // Get the gas fee required for withdrawal and call
        (address gasZRC20, uint256 gasFee) = IZRC20(params.targetChainToken).withdrawGasFee();

        (uint256 outputAmount, RevertOptions memory revertOptions) =
            swapAndApprove(gasZRC20, gasFee, inputToken, amount, params);

        // Execute the withdrawal via the gateway
        gateway.withdraw(params.targetChainCounterparty, outputAmount, params.targetChainToken, revertOptions);

        emit SwappedAndWithdrawn(params.targetChainCounterparty, params.targetChainToken, outputAmount);
    }

    function swapAndApprove(address gasZRC20, uint256 gasFee, address inputToken, uint256 amount, Params memory params)
        internal
        returns (uint256 outputAmount, RevertOptions memory revertOptions)
    {
        uint256 swapAmount;
        // Calculate the amount left after covering gas fees
        if (gasZRC20 == inputToken) {
            swapAmount = amount - gasFee;
        } else {
            swapAmount = amount - systemContract.swapTokensForExactTokens(inputToken, gasFee, gasZRC20, amount);
        }

        // Perform the token swap if the input and target tokens are different
        outputAmount = inputToken != params.targetChainToken
            ? systemContract.swapExactTokensForTokens(inputToken, swapAmount, params.targetChainToken, params.minAmount)
            : swapAmount;

        // Approve the gateway to spend the tokens
        if (gasZRC20 == params.targetChainToken) {
            IZRC20(gasZRC20).approve(address(gateway), outputAmount + gasFee);
        } else {
            IZRC20(gasZRC20).approve(address(gateway), gasFee);
            IZRC20(params.targetChainToken).approve(address(gateway), outputAmount);
        }

        // Prepare the revert options
        revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: bytes.concat(bytes20(params.originalSender)),
            onRevertGasLimit: 0
        });
    }
}
