// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Game2048ResultNFT is ERC721URIStorage {
    using Strings for uint256;

    error DuplicateGameId(string gameId);
    error InvalidScore();
    error InvalidPlayer();
    error InvalidGameId();

    uint256 private _nextTokenId;
    mapping(bytes32 => bool) private _mintedGameIds;

    event ResultMinted(
        address indexed player,
        uint256 indexed tokenId,
        string gameId,
        uint256 score,
        uint256 playedAt
    );

    constructor() ERC721("2048 Game Result", "G2048") {}

    function mintResult(
        address player,
        uint256 score,
        uint256 durationSeconds,
        string calldata gameId,
        uint256 playedAt
    ) external returns (uint256 tokenId) {
        if (player == address(0)) revert InvalidPlayer();
        if (score == 0) revert InvalidScore();
        if (bytes(gameId).length == 0) revert InvalidGameId();

        bytes32 gameHash = keccak256(bytes(gameId));
        if (_mintedGameIds[gameHash]) revert DuplicateGameId(gameId);

        tokenId = ++_nextTokenId;
        _mintedGameIds[gameHash] = true;

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, _buildTokenURI(player, score, durationSeconds, gameId, playedAt));

        emit ResultMinted(player, tokenId, gameId, score, playedAt);
    }

    function isGameIdMinted(string calldata gameId) external view returns (bool) {
        return _mintedGameIds[keccak256(bytes(gameId))];
    }

    function _buildTokenURI(
        address player,
        uint256 score,
        uint256 durationSeconds,
        string calldata gameId,
        uint256 playedAt
    ) private pure returns (string memory) {
        string memory json = string.concat(
            "{",
            '"name":"2048 Result #',
            score.toString(),
            '",',
            '"description":"On-chain 2048 game result.",',
            '"image":"https://placehold.co/600x600/png?text=2048+Result",',
            '"playerAddress":"',
            Strings.toHexString(player),
            '",',
            '"score":',
            score.toString(),
            ",",
            '"durationSeconds":',
            durationSeconds.toString(),
            ",",
            '"gameId":"',
            gameId,
            '",',
            '"playedAt":',
            playedAt.toString(),
            ",",
            '"attributes":[',
            '{"trait_type":"Score","value":',
            score.toString(),
            "},",
            '{"trait_type":"Duration","value":',
            durationSeconds.toString(),
            "},",
            '{"trait_type":"GameId","value":"',
            gameId,
            '"},',
            '{"trait_type":"PlayedAt","value":',
            playedAt.toString(),
            "}",
            "]",
            "}"
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }
}
