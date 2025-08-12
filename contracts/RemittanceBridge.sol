// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAWMBridge {
    function sendMessage(
        uint256 chainId,
        address contractAddress,
        bytes memory data,
        uint256 gasLimit,
        uint256 value
    ) external;
}

contract RemittanceBridge {
    address public owner;
    IAWMBridge public awmBridge;

    event RemittanceSent(
        address indexed sender,
        uint256 amount,
        string recipientPhone,
        string destinationCountry,
        uint256 indexed nonce
    );

    uint256 public nonce;

    constructor(address _awmBridge) {
        owner = msg.sender;
        awmBridge = IAWMBridge(_awmBridge);
    }

    function sendRemittance(
        uint256 amount,
        string calldata recipientPhone,
        string calldata destinationCountry
    ) external {
        uint256 currentNonce = ++nonce;

        bytes memory payload = abi.encode(
            msg.sender,
            amount,
            recipientPhone,
            destinationCountry,
            currentNonce
        );

        awmBridge.sendMessage(
            2710, // Morph Testnet
            address(this),
            payload,
            100000,
            0
        );

        emit RemittanceSent(msg.sender, amount, recipientPhone, destinationCountry, currentNonce);
    }
}