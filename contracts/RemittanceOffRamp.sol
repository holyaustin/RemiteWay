// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RemittanceOffRamp
 * @dev Gas-optimized remittance dApp for Morph Testnet
 * Emits event to trigger Nigerian bank transfer
 */
contract RemittanceOffRamp {
    address public immutable owner;

    event PayoutInitiated(
        address indexed sender,
        uint256 usdcAmount,
        uint256 ngAmount,
        uint256 exchangeRate,
        string bankAccount,
        string accountName,
        string referenceId,
        uint256 timestamp
    );

    string private constant REF_PREFIX = "RMW";

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}

    /**
     * @dev Initiate payout to Nigerian bank account
     * @param usdcAmount Amount in USDC (6 decimals)
     * @param ngAmount Amount in NGN
     * @param exchangeRate Rate used (e.g., 1520)
     * @param bankAccount 10-digit Nigerian account
     * @param accountName Full name
     */
    function initiatePayout(
        uint256 usdcAmount,
        uint256 ngAmount,
        uint256 exchangeRate,
        string calldata bankAccount,
        string calldata accountName
    ) external {
        if (usdcAmount == 0) revert("A0");
        if (ngAmount == 0) revert("N0");
        if (exchangeRate == 0) revert("R0");

        bytes memory bankBytes = bytes(bankAccount);
        bytes memory nameBytes = bytes(accountName);

        if (bankBytes.length != 10) revert("BA10");
        if (nameBytes.length == 0) revert("NM?");

        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender
                )
            )
        );

        uint256 refId = rand % 1000000;
        bytes memory refBytes = new bytes(6);
        for (uint256 i = 5; i != type(uint256).max; i--) {
            refBytes[i] = bytes1(uint8(48 + refId % 10));
            refId /= 10;
            if (refId == 0) break;
        }

        string memory referenceId = string(abi.encodePacked(REF_PREFIX, refBytes));

        emit PayoutInitiated(
            msg.sender,
            usdcAmount,
            ngAmount,
            exchangeRate,
            bankAccount,
            accountName,
            referenceId,
            block.timestamp
        );
    }

    /**
     * @dev Owner can withdraw accumulated ETH
     */
    function withdraw() external {
        if (msg.sender != owner) revert("NotOwner");
        (bool sent, ) = owner.call{value: address(this).balance}("");
        if (!sent) revert("SendFail");
    }
}