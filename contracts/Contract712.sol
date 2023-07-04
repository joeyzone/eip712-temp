// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract Contract712 is EIP712 {
    address public owner;

    constructor(
        string memory _name,
        string memory _version
    ) EIP712(_name, _version) {
        owner = msg.sender;
    }

    function verify(
        address mailTo,
        string calldata mailContents,
        bytes calldata signature
    ) public view returns (bool) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("Mail(address to,string contents)"),
                    mailTo,
                    keccak256(bytes(mailContents))
                )
            )
        );
        address signer = ECDSA.recover(digest, signature);
        return signer == owner;
    }
}
