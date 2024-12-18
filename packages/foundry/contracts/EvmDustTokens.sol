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
    event TokenFeesWithdrawn(address token, uint256 amount);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event Swapped(address indexed executor, SwapOutput[] swaps, uint256 totalTokensReceived);
    event SwappedAndDeposited(address indexed executor, SwapOutput[] swaps, uint256 totalTokensReceived);
    event Withdrawn(address indexed recipient, address outputToken, uint256 totalTokensReceived);
    event WithdrawFailed(address indexed recipient, uint256 totalTokensReceived);
    event Reverted(address indexed recipient, address asset, uint256 amount);

    error FeeWithdrawalFailed();
    error InvalidAddress();
    error InsufficientAllowance(address token);
    error InsufficientBalance(address token);
    error InvalidMsgValue();
    error InvalidToken(address token);
    error NotGateway();
    error NoSwaps();
    error SwapFailed(address token, bytes revertData);
    error TransferFailed();
    error TokenIsNotWhitelisted(address token);
    error TokenIsWhitelisted(address token);
    error WrongIndex();

    constructor(
        IGatewayEVM _gateway,
        ISwapRouter _swapRouter,
        address _universalDApp,
        address payable _wNativeToken,
        address _initialOwner,
        IPermit2 _permit2,
        address[] memory _tokenList
    ) payable Ownable(_initialOwner) {
        if (
            address(_gateway) == address(0) || address(_swapRouter) == address(0) || _wNativeToken == address(0)
                || address(_permit2) == address(0)
        ) revert InvalidAddress();
        gateway = _gateway;
        swapRouter = _swapRouter;
        universalDApp = _universalDApp;
        permit2 = _permit2;
        wNativeToken = _wNativeToken;
        isWhitelisted[_wNativeToken] = true;
        tokenList.push(_wNativeToken);
        emit TokenAdded(_wNativeToken);

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
        if (swaps.length == 0) revert NoSwaps();

        // Batch transfer all input tokens using Permit2
        _signatureBatchTransfer(swaps, nonce, deadline, signature);

        // Perform the swaps
        (SwapOutput[] memory performedSwaps, uint256 totalTokensReceived) = _performSwaps(swaps, wNativeToken);

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
     * Called by users to convert all their ERC20 tokens on the same chain
     * @param swaps - Swaps to perform
     * @param outputToken - The address of the output token
     * @param nonce - Permit2 nonce
     * @param deadline - Permit2 deadline
     * @param signature - Permit2 signature
     */
    function SwapTokens(
        SwapInput[] calldata swaps,
        address outputToken,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (swaps.length == 0) revert NoSwaps();

        // Batch transfer all input tokens using Permit2
        _signatureBatchTransfer(swaps, nonce, deadline, signature);

        // Perform the swaps
        (SwapOutput[] memory performedSwaps, uint256 totalTokensReceived) = _performSwaps(swaps, outputToken);

        uint256 feeAmount = totalTokensReceived * protocolFee / 10000;
        if (outputToken == address(0)) {
            // Unwrap the native token, subtract the protocol fee, and send the tokens to the msg.sender
            IWTOKEN(wNativeToken).withdraw(totalTokensReceived);
            totalTokensReceived -= feeAmount;
            collectedFees = collectedFees + feeAmount;

            (bool s,) = msg.sender.call{value: totalTokensReceived}("");
            if (!s) revert TransferFailed();
        } else {
            // Subtract the protocol fee and send the tokens to the msg.sender
            totalTokensReceived -= feeAmount;
            outputToken.safeTransfer(msg.sender, totalTokensReceived);
        }

        emit Swapped(msg.sender, performedSwaps, totalTokensReceived);
    }

    /**
     * Called by the Universal DApp to withdraw tokens on the destination chain
     * @param outputToken - The address of the output token
     * @param recipient - The address of the recipient
     * @param minAmount - The minimum amount of tokens to receive from the swap
     * @dev To receive native tokens, set outputToken to address(0)
     */
    function ReceiveTokens(address outputToken, address recipient, uint256 minAmount) external payable {
        if (msg.value == 0) revert InvalidMsgValue();
        // Check if the output token is native or whitelisted
        if (outputToken != address(0) && !isWhitelisted[outputToken]) revert TokenIsNotWhitelisted(outputToken);

        // If outputToken is 0x, send msg.value to the recipient
        if (outputToken == address(0)) {
            (bool s,) = recipient.call{value: msg.value}("");
            if (s) {
                emit Withdrawn(recipient, outputToken, msg.value);
            } else {
                collectedFees = collectedFees + msg.value;
                emit WithdrawFailed(recipient, msg.value);
            }
        } else if (outputToken == wNativeToken) {
            // Wrap native token to the wrapped native token (i.e: WETH, WPOL, etc)
            IWTOKEN(wNativeToken).deposit{value: msg.value}();
            wNativeToken.safeTransfer(recipient, msg.value);

            emit Withdrawn(recipient, wNativeToken, msg.value);
        } else {
            // Swap wrapped native token to the output token
            IWTOKEN(wNativeToken).deposit{value: msg.value}();
            wNativeToken.safeApprove(address(swapRouter), msg.value);

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: wNativeToken,
                tokenOut: outputToken,
                fee: swapFee,
                recipient: recipient,
                amountIn: msg.value,
                amountOutMinimum: minAmount,
                sqrtPriceLimitX96: 0
            });

            uint256 amountOut = swapRouter.exactInputSingle(params);

            emit Withdrawn(recipient, outputToken, amountOut);
        }
    }

    /**
     * Add tokens to whitelist
     * @param tokens - The addresses of the ERC20 tokens
     */
    function addTokens(address[] calldata tokens) external onlyOwner {
        uint256 tokenCount = tokens.length;
        address token;
        for (uint256 i; i < tokenCount; ++i) {
            token = tokens[i];
            if (token == address(0)) revert InvalidAddress();
            if (isWhitelisted[token]) revert TokenIsWhitelisted(token);
            isWhitelisted[token] = true;
            tokenList.push(token);
            emit TokenAdded(token);
        }
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
     * Withdraw token fees
     * @param tokens - The addresses of the ERC20 tokens
     */
    function withdrawTokenFees(address[] calldata tokens) external onlyOwner {
        uint256 len = tokens.length;
        uint256 amount;
        address token;
        for (uint256 i; i < len; ++i) {
            token = tokens[i];
            amount = IERC20(token).balanceOf(address(this));
            token.safeTransfer(msg.sender, amount);
            emit TokenFeesWithdrawn(token, amount);
        }
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
    function _signatureBatchTransfer(
        SwapInput[] calldata swaps,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) internal {
        uint256 swapsAmount = swaps.length;

        // Create arrays for TokenPermissions and SignatureTransferDetails
        ISignatureTransfer.TokenPermissions[] memory permitted = new ISignatureTransfer.TokenPermissions[](swapsAmount);
        ISignatureTransfer.SignatureTransferDetails[] memory transferDetails =
            new ISignatureTransfer.SignatureTransferDetails[](swapsAmount);
        address token;
        uint256 amount;
        for (uint256 i; i < swapsAmount; ++i) {
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

    /**
     * Perform the swaps via Uniswap
     * @param swaps - Swaps to perform
     * @param outputToken - The address of the output token
     * @return performedSwaps - The performed swaps
     * @return totalTokensReceived - The total amount of the output token received
     */
    function _performSwaps(SwapInput[] calldata swaps, address outputToken)
        internal
        returns (SwapOutput[] memory performedSwaps, uint256 totalTokensReceived)
    {
        if (outputToken != address(0) && !isWhitelisted[outputToken]) revert TokenIsNotWhitelisted(outputToken);

        uint256 swapsAmount = swaps.length;
        performedSwaps = new SwapOutput[](swapsAmount);
        totalTokensReceived;
        if (outputToken == wNativeToken || outputToken == address(0)) {
            // Loop through each ERC-20 token address provided
            for (uint256 i; i < swapsAmount; ++i) {
                SwapInput calldata swap = swaps[i];
                address token = swap.token;
                if (token == wNativeToken) revert InvalidToken(wNativeToken);
                uint256 amount = swap.amount;
                // Approve the swap router to spend the token
                token.safeApprove(address(swapRouter), amount);

                // Build Uniswap Swap to convert the token to the wrapped native token
                ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                    tokenIn: token,
                    tokenOut: wNativeToken,
                    fee: swapFee,
                    recipient: address(this),
                    amountIn: amount,
                    amountOutMinimum: swap.minAmountOut,
                    sqrtPriceLimitX96: 0
                });

                // Try to perform the swap
                try swapRouter.exactInputSingle(params) returns (uint256 amountOut) {
                    totalTokensReceived += amountOut;
                    // Store performed swap details
                    performedSwaps[i] =
                        SwapOutput({tokenIn: token, tokenOut: outputToken, amountIn: amount, amountOut: amountOut});
                } catch (bytes memory revertData) {
                    revert SwapFailed(token, revertData);
                }
            }
        } else {
            bytes memory path;
            for (uint256 i; i < swapsAmount; ++i) {
                SwapInput calldata swap = swaps[i];
                address token = swap.token;
                if (token == wNativeToken) revert InvalidToken(wNativeToken);
                uint256 amount = swap.amount;
                // Approve the swap router to spend the token
                token.safeApprove(address(swapRouter), amount);

                // Build multihop Uniswap Swap to convert the token to the output token
                path = bytes.concat(
                    bytes20(token),
                    bytes3(swapFee),
                    bytes20(address(wNativeToken)),
                    bytes3(swapFee),
                    bytes20(outputToken)
                );
                ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
                    path: path,
                    recipient: address(this),
                    amountIn: amount,
                    amountOutMinimum: swap.minAmountOut
                });

                // Try to perform the swap
                try swapRouter.exactInput(params) returns (uint256 amountOut) {
                    totalTokensReceived += amountOut;
                    // Store performed swap details
                    performedSwaps[i] =
                        SwapOutput({tokenIn: token, tokenOut: outputToken, amountIn: amount, amountOut: amountOut});
                } catch (bytes memory revertData) {
                    revert SwapFailed(token, revertData);
                }
            }
        }
    }

    receive() external payable {}
}
