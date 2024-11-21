// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
// import "../contracts/YourContract.sol";
import {EvmDustTokens, SwapInput} from "../contracts/EvmDustTokens.sol";
import {SimpleSwap} from "../contracts/SimpleSwap.sol";
import {Swap} from "../contracts/Swap.sol";
import {IQuoter} from "./IQuoter.sol";

import {ZetachainUtils} from "../script/ZetachainUtils.s.sol";
import {ISwapRouter} from "../contracts/ISwapRouter.sol";
import {IPermit2} from "../contracts/lib/permit2/IPermit2.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

import {WETH9} from "./WETH9.sol";
import {ISignatureTransfer} from "../contracts/lib/permit2/ISignatureTransfer.sol";

contract YourContractTest is Test, ZetachainUtils {
    using stdJson for string;

    address ZETA_ETH_ADDRESS;
    address ZETA_SYSTEM_CONTRACT_ADDRESS;
    address ZETA_GATEWAY_ADDRESS;
    address GATEWAY_ADDRESS;
    address UNISWAP_ROUTER;
    address UNISWAP_QUOTER;

    address WETH_ADDRESS;
    address DAI_ADDRESS;
    address LINK_ADDRESS;
    address UNI_ADDRESS;
    address WBTC_ADDRESS;
    address USDC_ADDRESS;

    WETH9 WETH;
    IERC20 DAI;
    IERC20 USDC;
    IERC20 LINK;
    IERC20 UNI;
    IERC20 WBTC;

    address permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    address deployer;
    address user1;
    address user2;

    SimpleSwap simpleSwap;
    EvmDustTokens dustTokens;
    Swap universalApp;

    string json;

    address[] DEFAULT_SWAPS;
    uint256 DEFAULT_AMOUNT = 1;
    uint256 DEFAULT_SLIPPAGE = 50;

    function setUp() public {
        UNISWAP_ROUTER = readLocalnetAddresses("ethereum", "uniswapRouterV3");
        UNISWAP_QUOTER = readLocalnetAddresses("ethereum", "uniswapQuoterV3");
        GATEWAY_ADDRESS = readLocalnetAddresses("ethereum", "gatewayEVM");

        WETH_ADDRESS = readLocalnetAddresses("ethereum", "weth");
        DAI_ADDRESS = readLocalnetAddresses("ethereum", "dai");
        USDC_ADDRESS = readLocalnetAddresses("ethereum", "usdc");
        UNI_ADDRESS = readLocalnetAddresses("ethereum", "uni");
        LINK_ADDRESS = readLocalnetAddresses("ethereum", "link");
        WBTC_ADDRESS = readLocalnetAddresses("ethereum", "wbtc");

        ZETA_ETH_ADDRESS = readLocalnetAddresses(
            "zetachain",
            "ZRC-20 ETH on 5"
        );
        ZETA_SYSTEM_CONTRACT_ADDRESS = readLocalnetAddresses(
            "zetachain",
            "systemContract"
        );
        ZETA_GATEWAY_ADDRESS = readLocalnetAddresses(
            "zetachain",
            "gatewayZEVM"
        );

        deployer = makeAddr("DEPLOYER");
        user1 = makeAddr("USER1");
        user2 = makeAddr("USER2");

        simpleSwap = new SimpleSwap(
            ISwapRouter(UNISWAP_ROUTER),
            payable(WETH_ADDRESS)
        );

        // (, address _deployer, ) = vm.readCallers();

        dustTokens = new EvmDustTokens(
            payable(GATEWAY_ADDRESS),
            ISwapRouter(UNISWAP_ROUTER),
            payable(WETH_ADDRESS),
            deployer,
            IPermit2(permit2)
        );

        vm.startPrank(deployer);
        dustTokens.addToken(DAI_ADDRESS);
        dustTokens.addToken(LINK_ADDRESS);
        dustTokens.addToken(UNI_ADDRESS);
        dustTokens.addToken(WBTC_ADDRESS);
        vm.stopPrank();

        WETH = WETH9(payable(WETH_ADDRESS));
        DAI = IERC20(DAI_ADDRESS);
        USDC = IERC20(USDC_ADDRESS);
        LINK = IERC20(LINK_ADDRESS);
        UNI = IERC20(UNI_ADDRESS);
        WBTC = IERC20(WBTC_ADDRESS);

        universalApp = new Swap(
            ZETA_SYSTEM_CONTRACT_ADDRESS,
            payable(ZETA_GATEWAY_ADDRESS)
        );

        vm.deal(user1, 50 ether);

        vm.startPrank(user1);
        WETH.approve(permit2, type(uint256).max);
        DAI.approve(permit2, type(uint256).max);
        USDC.approve(permit2, type(uint256).max);
        LINK.approve(permit2, type(uint256).max);
        UNI.approve(permit2, type(uint256).max);
        WBTC.approve(permit2, type(uint256).max);
        vm.stopPrank();

        domainSeparator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("UniversalApp")),
                keccak256(bytes("1.0")),
                block.chainid,
                address(this)
            )
        );

        DEFAULT_SWAPS.push(address(DAI));
        DEFAULT_SWAPS.push(address(LINK));
        DEFAULT_SWAPS.push(address(UNI));
    }

    uint256 WETHAmount = 10 ether;

    modifier beforeEach() {
        vm.startPrank(user1);
        WETH.deposit{value: WETHAmount}();
        WETH.approve(address(simpleSwap), WETHAmount);

        uint256 swapAmount = 1 ether;
        address[] memory erc20s = new address[](5);
        erc20s[0] = DAI_ADDRESS;
        erc20s[1] = USDC_ADDRESS;
        erc20s[2] = LINK_ADDRESS;
        erc20s[3] = UNI_ADDRESS;
        erc20s[4] = WBTC_ADDRESS;

        simpleSwap.ExecuteMultiSwapFromWETH(erc20s, swapAmount);
        vm.stopPrank();
        _;
    }

    function testSwapInputTokensAndOutputSpecifiedTokenOnDestinationChain()
        public
        beforeEach
    {
        vm.startPrank(user1);

        bytes memory destinationPayload = encodeDestinationPayload(
            user2,
            address(UNI)
        );
        bytes memory encodedParameters = encodeZetachainPayload(
            ZETA_ETH_ADDRESS,
            address(dustTokens),
            user2,
            destinationPayload
        );
        SwapInput[] memory swaps = getTokenSwaps(
            DEFAULT_SWAPS,
            DEFAULT_AMOUNT,
            DEFAULT_SLIPPAGE
        );
        // (
        //     CompletePermitData memory permit,
        //     bytes memory hash
        // ) = preparePermitData(
        //         30 seconds * 60 seconds * 1000,
        //         swaps,
        //         address(dustTokens)
        //     );

        signPermit(swaps);
        // uint256 receiverStartBalance = UNI.balanceOf(receiver);

        // for (uint256 i = 0; i < DEFAULT_SWAPS.length; i++) {
        //     console.log()
        // }
        for (uint256 i = 0; i < swaps.length; i++) {
            console.log(swaps[i].token);
            console.log(swaps[i].amount);
            console.log(IERC20(swaps[i].token).balanceOf(user1));
        }

        // dustTokens.SwapAndBridgeTokens(
        //     swaps,
        //     address(universalApp),
        //     encodedParameters,
        //     permit.nonce,
        //     permit.deadline,
        //     hash
        // );
        vm.stopPrank();
    }

    // function testSwapInputTokensAndOutputNativeTokenOnDestinationChain()
    //     public
    //     beforeEach
    // {
    //     vm.startPrank(user1);

    //     bytes memory destinationPayload = encodeDestinationPayload(
    //         user2,
    //         address(0)
    //     );
    //     bytes memory encodedParameters = encodeZetachainPayload(
    //         ZETA_ETH_ADDRESS,
    //         address(dustTokens),
    //         user2,
    //         destinationPayload
    //     );
    //     SwapInput[] memory swaps = getTokenSwaps(
    //         DEFAULT_SWAPS,
    //         DEFAULT_AMOUNT,
    //         DEFAULT_SLIPPAGE
    //     );
    //     (
    //         CompletePermitData memory permit,
    //         bytes memory hash
    //     ) = preparePermitData(
    //             30 seconds * 60 seconds * 1000,
    //             swaps,
    //             address(dustTokens)
    //         );

    //     dustTokens.SwapAndBridgeTokens(
    //         swaps,
    //         address(universalApp),
    //         encodedParameters,
    //         permit.nonce,
    //         permit.deadline,
    //         hash
    //     );
    //     vm.stopPrank();
    // }

    function signPermit(
        SwapInput[] memory swaps
    ) public returns (uint256, uint256, bytes memory) {
        (
            bytes32 domain,
            bytes memory types, // Replace with your actual type definition for `types`
            bytes memory values, // Replace with your actual type definition for `values`
            uint256 deadline,
            uint256 nonce
        ) = preparePermitData(swaps, address(dustTokens));

        bytes memory signature; // generate signature
        return (deadline, nonce, signature);

        // bytes memory hash = getHash(complete);
    }

    function preparePermitData(
        SwapInput[] memory swaps,
        address spender
    )
        public
        view
        returns (
            bytes32,
            bytes memory, // Replace with your actual type definition for `types`
            bytes memory, // Replace with your actual type definition for `values`
            uint256,
            uint256
        )
    {
        uint256 nonce = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % 1e15;

        uint256 deadline = calculateDeadline(
            30 seconds * 60 seconds * 1000 seconds
        );

        PreparedPermitData memory permit = PreparedPermitData({
            deadline: deadline,
            nonce: nonce,
            permitted: swaps,
            spender: spender
        });

        (
            bytes32 domain,
            bytes memory types, // Replace with your actual type definition for `types`
            bytes memory values // Replace with your actual type definition for `values`
        ) = getPermitDataBatchTransferFrom(
                permit,
                permit2,
                block.chainid,
                Witness("")
            );

        return (domain, types, values, deadline, nonce);
    }

    // Example function to calculate a deadline
    function calculateDeadline(uint256 duration) public view returns (uint256) {
        return block.timestamp + duration;
    }

    struct PreparedPermitData {
        uint256 deadline;
        uint256 nonce;
        SwapInput[] permitted;
        address spender;
    }

    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 private domainSeparator;

    function getHash(
        CompletePermitData memory complete
    ) public view returns (bytes memory) {
        bytes32 COMPLETE_PERMIT_DATA_TYPEHASH = keccak256(
            "CompletePermitData(uint256 deadline,uint256 nonce,bytes32 domain,bytes32 types,bytes32 values)"
        );

        // Hash the data
        bytes32 structHash = keccak256(
            abi.encode(
                COMPLETE_PERMIT_DATA_TYPEHASH,
                complete.deadline,
                complete.nonce,
                complete.domain,
                complete.types,
                complete.values
            )
        );

        // Return the final hash using EIP-712 encoding
        return abi.encodePacked("\x19\x01", domainSeparator, structHash);
    }

    function encodeZetachainPayload(
        address targetChainToken,
        address targetChainCounterparty,
        address recipient,
        bytes memory destinationPayload
    ) public pure returns (bytes memory) {
        bytes memory encodedParameters = abi.encode(
            targetChainToken,
            targetChainCounterparty,
            recipient,
            destinationPayload
        );

        return encodedParameters;
    }

    /**
     * @dev Encodes the destination payload.
     * @param recipient The address of the recipient.
     * @param outputToken The address of the output token.
     * @return The encoded destination payload.
     */
    function encodeDestinationPayload(
        address recipient,
        address outputToken
    ) public pure returns (bytes memory) {
        // Encode the destination function parameters: outputToken and recipient
        bytes memory destinationFunctionParams = abi.encode(
            outputToken,
            recipient
        );

        // Define the function signature for "ReceiveTokens(address,address)"
        bytes4 functionSignature = bytes4(
            keccak256("ReceiveTokens(address,address)")
        );

        // Concatenate the function signature and the encoded parameters
        bytes memory destinationPayload = abi.encodePacked(
            functionSignature,
            destinationFunctionParams
        );

        return destinationPayload;
    }

    // struct TokenSwap {
    //     uint256 amount;
    //     uint256 minAmountOut;
    //     address token;
    // }

    function getTokenSwaps(
        address[] memory tokens,
        uint256 swapAmount,
        uint256 slippageBPS
    ) public returns (SwapInput[] memory swaps) {
        swaps = new SwapInput[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20Metadata token = IERC20Metadata(tokens[i]);

            // Calculate the input amount in token decimals
            uint8 decimals = token.decimals();

            uint256 amount = swapAmount * (10 ** decimals);

            // Get the estimated amount out from Uniswap Quoter
            uint256 estimatedAmountOut = IQuoter(UNISWAP_QUOTER)
                .quoteExactInputSingle(
                    tokens[i],
                    address(WETH),
                    3000, // Assuming a 0.3% fee tier
                    amount,
                    0 // No price limit
                );

            // Calculate the minimum amount out accounting for slippage
            uint256 minAmountOut = (estimatedAmountOut *
                (10000 - slippageBPS)) / 10000;

            swaps[i] = SwapInput({
                amount: amount,
                minAmountOut: minAmountOut,
                token: tokens[i]
            });
        }
    }

    uint256 public constant MaxSigDeadline = type(uint256).max; // Replace with the actual max deadline value
    uint256 public constant MaxUnorderedNonce = type(uint256).max; // Replace with the actual max nonce value

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

    struct CompletePermitData {
        bytes32 domain;
        bytes types; // Replace with your actual type definition for `types`
        bytes values; // Replace with your actual type definition for `values`
        uint256 deadline;
        uint256 nonce;
    }

    struct PermitData {
        bytes32 domain;
        bytes types; // Replace with your actual type definition for `types`
        bytes values; // Replace with your actual type definition for `values`
    }

    function getPermitDataBatchTransferFrom(
        PreparedPermitData memory permit,
        address permit2Address,
        uint256 chainId,
        Witness memory witness
    )
        public
        view
        returns (
            bytes32 domain,
            bytes memory types, // Replace with your actual type definition for `types`
            bytes memory values // Replace with your actual type definition for `values`
        )
    {
        require(permit.deadline <= MaxSigDeadline, "SIG_DEADLINE_OUT_OF_RANGE");
        require(permit.nonce <= MaxUnorderedNonce, "NONCE_OUT_OF_RANGE");

        domain = getPermit2Domain(permit2Address, chainId);

        for (uint256 i = 0; i < permit.permitted.length; i++) {
            validateTokenPermissions(permit.permitted[i]);
        }

        types = witness.witness.length > 0
            ? getPermitTransferFromWithWitnessType(witness)
            : getPermitTransferFromTypes();

        values = witness.witness.length > 0
            ? abi.encode(permit, witness.witness)
            : abi.encode(permit);
    }

    // function getPermitDataTransferFrom(
    //     PreparedPermitData memory permit,
    //     address permit2Address,
    //     uint256 chainId,
    //     Witness memory witness
    // ) public view returns (PermitData memory) {
    //     require(permit.deadline <= MaxSigDeadline, "SIG_DEADLINE_OUT_OF_RANGE");
    //     require(permit.nonce <= MaxUnorderedNonce, "NONCE_OUT_OF_RANGE");

    //     bytes32 domain = getPermit2Domain(permit2Address, chainId);

    //     validateTokenPermissions(permit.permitted);

    //     bytes memory types = witness.witness.length > 0
    //         ? getPermitTransferFromWithWitnessType(witness)
    //         : getPermitTransferFromTypes();

    //     bytes memory values = witness.witness.length > 0
    //         ? abi.encode(permit, witness.witness)
    //         : abi.encode(permit);

    //     return PermitData({domain: domain, types: types, values: values});
    // }

    function getPermit2Domain(
        address permit2Address,
        uint256 chainId
    ) internal pure returns (bytes32) {
        // Implement the logic to generate domain separator
        return keccak256(abi.encode(permit2Address, chainId));
    }

    function validateTokenPermissions(
        SwapInput memory permission
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
