// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {TransferHelper} from "./uniswap/TransferHelper.sol";
import {RevertContext, RevertOptions} from "./zetachain/Revert.sol";
import {IGatewayEVM} from "./interfaces/IGatewayEVM.sol";
import "./interfaces/IPermit2.sol";

// Interface for a wrapped native token to allow deposits and withdrawals
interface IWTOKEN is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    receive() external payable;
}

/**
 * @title EvmDustTokens
 * This contract helps users to convert all their ERC20 tokens
 * from one supported chain to another.
 */
contract EvmDustTokens is Ownable2Step {
    using TransferHelper for *;

    uint24 public constant swapFee = 3000; // Uniswap fee
    uint256 public constant protocolFee = 100; // Our fee: 100 == 1%
    IGatewayEVM public immutable gateway;
    ISwapRouter public immutable swapRouter; // Uniswap router
    IPermit2 public immutable permit2;
    address public immutable universalDApp;
    address payable public immutable wNativeToken;
    uint256 public collectedFees;

    // Allowed tokens to receive
    mapping(address => bool) public isWhitelisted;
    address[] tokenList;

    struct SwapInput {
        address token;
        uint256 amount;
        uint256 minAmountOut;
    }

    struct SwapOutput {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
    }

    event FeesWithdrawn(uint256 amount);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event SwappedAndDeposited(address indexed executor, SwapOutput[] swaps, uint256 totalTokensReceived);
    event Withdrawn(address indexed receiver, address outputToken, uint256 totalTokensReceived);
    event Reverted(address indexed recipient, address asset, uint256 amount);

    error FeeWithdrawalFailed();
    error InvalidAddress();
    error InsufficientAllowance(address token);
    error InsufficientBalance(address token);
    error InvalidMsgValue();
    error InvalidToken(address token);
    error NotGateway();
    error NoSwaps();
    error SwapFailed(address token);
    error TransferFailed();
    error TokenIsNotWhitelisted(address token);
    error TokenIsWhitelisted(address token);
    error WrongIndex();

    constructor(
        IGatewayEVM _gateway,
        ISwapRouter _swapRouter,
        address _universalDApp,
        address payable _nativeToken,
        address _initialOwner,
        IPermit2 _permit2,
        address[] memory _tokenList
    ) payable Ownable(_initialOwner) {
        if (
            address(_gateway) == address(0) || address(_swapRouter) == address(0) || _nativeToken == address(0)
                || address(_permit2) == address(0)
        ) revert InvalidAddress();
        gateway = _gateway;
        swapRouter = _swapRouter;
        universalDApp = _universalDApp;
        permit2 = _permit2;
        wNativeToken = _nativeToken;
        isWhitelisted[_nativeToken] = true;
        tokenList.push(_nativeToken);
        emit TokenAdded(_nativeToken);

        uint256 tokenCount = _tokenList.length;
        address token;
        for (uint256 i; i < tokenCount; ++i) {
            token = _tokenList[i];
            if (token == address(0)) revert InvalidToken(token);
            isWhitelisted[token] = true;
            tokenList.push(token);
            emit TokenAdded(token);
        }
    }

    /**
     * Called by users to convert all their ERC20 tokens from one supported chain to another
     * @param swaps - Swaps to perform
     * @param message - Message to send to the Universal DApp
     * @param nonce - Permit2 nonce
     * @param deadline - Permit2 deadline
     * @param signature - Permit2 signature
     * @dev The message has to be abi.encode(UniversalDApp.Params)
     */
    function SwapAndBridgeTokens(
        SwapInput[] calldata swaps,
        bytes calldata message,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        uint256 swapsAmount = swaps.length;

        if (swapsAmount == 0) revert NoSwaps();

        // Batch transfer all input tokens using Permit2
        signatureBatchTransfer(swaps, nonce, deadline, signature);

        // Array to store performed swaps
        SwapOutput[] memory performedSwaps = new SwapOutput[](swapsAmount);
        SwapInput memory swap;
        uint256 totalTokensReceived;
        // Loop through each ERC-20 token address provided
        for (uint256 i; i < swapsAmount; ++i) {
            swap = swaps[i];
            address token = swap.token;
            uint256 amount = swap.amount;
            // Approve the swap router to spend the token
            token.safeApprove(address(swapRouter), amount);

            // Build Uniswap Swap to convert the token to the wrapped native token
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: token,
                tokenOut: wNativeToken,
                fee: swapFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amount,
                amountOutMinimum: swap.minAmountOut,
                sqrtPriceLimitX96: 0
            });

            // Try to perform the swap
            try swapRouter.exactInputSingle(params) returns (uint256 amountOut) {
                totalTokensReceived += amountOut;
                // Store performed swap details
                performedSwaps[i] =
                    SwapOutput({tokenIn: token, tokenOut: wNativeToken, amountIn: amount, amountOut: amountOut});
            } catch {
                revert SwapFailed(token);
            }
        }

        // Unwrap the native token and subtract the protocol fee
        IWTOKEN(wNativeToken).withdraw(totalTokensReceived);
        uint256 feeAmount = totalTokensReceived * protocolFee / 10000;
        totalTokensReceived -= feeAmount;
        collectedFees = collectedFees + feeAmount;

        // Prepare the revert options
        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(msg.sender),
            onRevertGasLimit: 0
        });
        gateway.depositAndCall{value: totalTokensReceived}(universalDApp, message, revertOptions);

        emit SwappedAndDeposited(msg.sender, performedSwaps, totalTokensReceived);
    }

    /**
     * Called by the Universal DApp to withdraw tokens on the destination chain
     * @param outputToken - The address of the output token
     * @param receiver - The address of the receiver
     * @param minAmount - The minimum amount of tokens to receive from the swap
     * @dev To receive native tokens, set outputToken to address(0)
     */
    function ReceiveTokens(address outputToken, address receiver, uint256 minAmount) external payable {
        if (msg.value == 0) revert InvalidMsgValue();
        // Check if the output token is native or whitelisted
        if (outputToken != address(0) && !isWhitelisted[outputToken]) revert TokenIsNotWhitelisted(outputToken);

        // If outputToken is 0x, send msg.value to the receiver
        if (outputToken == address(0)) {
            (bool s,) = receiver.call{value: msg.value}("");
            if (!s) revert TransferFailed();

            emit Withdrawn(receiver, outputToken, msg.value);
        } else if (outputToken == wNativeToken) {
            // Wrap native token to the wrapped native token (i.e: WETH, WPOL, etc)
            IWTOKEN(wNativeToken).deposit{value: msg.value}();
            wNativeToken.safeTransfer(receiver, msg.value);

            emit Withdrawn(receiver, wNativeToken, msg.value);
        } else {
            // Swap wrapped native token to the output token
            IWTOKEN(wNativeToken).deposit{value: msg.value}();
            wNativeToken.safeApprove(address(swapRouter), msg.value);

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: wNativeToken,
                tokenOut: outputToken,
                fee: swapFee,
                recipient: receiver,
                deadline: block.timestamp,
                amountIn: msg.value,
                amountOutMinimum: minAmount,
                sqrtPriceLimitX96: 0
            });

            uint256 amountOut = swapRouter.exactInputSingle(params);

            emit Withdrawn(receiver, outputToken, amountOut);
        }
    }

    /**
     * Add token to whitelist
     * @param token - The address of the ERC20 token
     */
    function addToken(address token) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        if (isWhitelisted[token]) revert TokenIsWhitelisted(token);
        isWhitelisted[token] = true;
        tokenList.push(token);
        emit TokenAdded(token);
    }

    /**
     * Remove token from whitelist
     * @param token - The address of the ERC20 token
     * @param index - The index of the token in tokenList
     */
    function removeToken(address token, uint256 index) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        if (!isWhitelisted[token]) revert TokenIsNotWhitelisted(token);
        delete isWhitelisted[token];

        if (tokenList[index] != token) revert WrongIndex();
        uint256 len = tokenList.length - 1;
        tokenList[index] = tokenList[len];
        assembly {
            sstore(tokenList.slot, len)
        }
        emit TokenRemoved(token);
    }

    /**
     * Withdraw all collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 fees = collectedFees;
        delete collectedFees;
        (bool s,) = msg.sender.call{value: fees}("");
        if (!s) revert FeeWithdrawalFailed();
        emit FeesWithdrawn(fees);
    }

    /**
     * Called by the gateway if the transaction reverts.
     * Returns the reverted tokens back to the original sender
     * @param revertContext - Revert context to pass to onRevert
     * @dev The gateway sends tokens to the contract and then calls onRevert
     */
    function onRevert(RevertContext calldata revertContext) external payable {
        if (msg.sender != address(gateway)) revert NotGateway();

        // Decode the revert message to get the original sender's address
        address originalSender = abi.decode(revertContext.revertMessage, (address));

        // Transfer the reverted tokens back to the original sender
        if (revertContext.asset == address(0)) {
            (bool s,) = originalSender.call{value: revertContext.amount}("");
            if (!s) revert TransferFailed();
        } else {
            revertContext.asset.safeTransfer(originalSender, revertContext.amount);
        }

        emit Reverted(originalSender, revertContext.asset, revertContext.amount);
    }

    /**
     * Get the list of whitelisted tokens
     */
    function getTokenList() external view returns (address[] memory) {
        return tokenList;
    }

    /**
     * Get the metadata of whitelisted tokens
     * @param user - The address of the user
     * @return addresses - The addresses of the whitelisted tokens
     * @return names - The names of the whitelisted tokens
     * @return symbols - The symbols of the whitelisted tokens
     * @return decimals - The decimals of the whitelisted tokens
     * @return balances - The balances of the whitelisted tokens
     */
    function getTokensMetadata(address user)
        external
        view
        returns (
            address[] memory addresses,
            string[] memory names,
            string[] memory symbols,
            uint8[] memory decimals,
            uint256[] memory balances
        )
    {
        uint256 tokenCount = tokenList.length;

        addresses = new address[](tokenCount);
        names = new string[](tokenCount);
        symbols = new string[](tokenCount);
        decimals = new uint8[](tokenCount);
        balances = new uint256[](tokenCount);
        IERC20Metadata token;
        for (uint256 i; i < tokenCount; ++i) {
            token = IERC20Metadata(tokenList[i]);
            addresses[i] = address(token);
            names[i] = token.name();
            symbols[i] = token.symbol();
            decimals[i] = token.decimals();
            balances[i] = token.balanceOf(user);
        }
    }

    /**
     * Batch SignatureTransfer to transfer tokens from msg.sender to this contract
     * @param swaps - Swaps to perform
     * @param nonce - Permit2 nonce
     * @param deadline - Permit2 deadline
     * @param signature - Permit2 signature
     */
    function signatureBatchTransfer(
        SwapInput[] calldata swaps,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) internal {
        uint256 len = swaps.length;

        // Create arrays for TokenPermissions and SignatureTransferDetails
        ISignatureTransfer.TokenPermissions[] memory permitted = new ISignatureTransfer.TokenPermissions[](len);
        ISignatureTransfer.SignatureTransferDetails[] memory transferDetails =
            new ISignatureTransfer.SignatureTransferDetails[](len);
        address token;
        uint256 amount;
        for (uint256 i; i < len; ++i) {
            SwapInput calldata swap = swaps[i];
            token = swap.token;
            amount = swap.amount;

            // Check allowance and balance
            if (IERC20(token).allowance(msg.sender, address(permit2)) < amount) revert InsufficientAllowance(token);
            if (IERC20(token).balanceOf(msg.sender) < amount) revert InsufficientBalance(token);

            permitted[i] = ISignatureTransfer.TokenPermissions({token: token, amount: amount});

            transferDetails[i] =
                ISignatureTransfer.SignatureTransferDetails({to: address(this), requestedAmount: amount});
        }

        // Create the PermitBatchTransferFrom struct
        ISignatureTransfer.PermitBatchTransferFrom memory permit =
            ISignatureTransfer.PermitBatchTransferFrom({permitted: permitted, nonce: nonce, deadline: deadline});

        // Execute the batched permit transfer
        permit2.permitTransferFrom(permit, transferDetails, msg.sender, signature);
    }

    receive() external payable {}
}
