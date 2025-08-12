// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LocalTokenSwapper {
    address public owner;
    mapping(string => uint256) public localTokenRates;

    event TokensSwapped(
        address indexed sender,
        uint256 stablecoinAmount,
        uint256 localAmount,
        string currency
    );

    constructor() {
        owner = msg.sender;
        // Mock rates
        localTokenRates["PHP"] = 55;
        localTokenRates["NGN"] = 1500;
        localTokenRates["GHS"] = 14;
    }

    function receiveRemittance(
        address sender,
        uint256 amount,
        string calldata /* phone */,       // Not used in MVP, reserved for AWM payload
        string calldata country,
        uint256 /* nonce */                // Not used, but part of message for replay protection
    ) external {
        uint256 localAmount = amount * localTokenRates[country];
        emit TokensSwapped(sender, amount, localAmount, country);
    }
}