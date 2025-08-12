// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockOffRamp {
    event PayoutInitiated(string phone, uint256 amount, string currency);

    function initiatePayout(string calldata phone, uint256 amount, string calldata currency) external {
        emit PayoutInitiated(phone, amount, currency);
    }
}