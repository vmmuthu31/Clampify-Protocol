// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IClampifyGovernance
 * @dev Interface for Clampify governance functionality
 */
interface IClampifyGovernance {
    struct VoteInfo {
        uint256 amount;
        bool support;
        bool hasVoted;
    }
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address targetContract, string description, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId, address executor, bool success);
    event ProposalCancelled(uint256 indexed proposalId, address canceller);
    
    function createProposal(string memory _description, address _targetContract, bytes memory _callData, uint256 _votingPeriod) external;
    function castVote(uint256 _proposalId, bool _support) external;
    function executeProposal(uint256 _proposalId) external;
    function cancelProposal(uint256 _proposalId) external;
    function getProposalStatus(uint256 _proposalId) external view returns (uint8);
    function getProposalDetails(uint256 _proposalId) external view returns (
        address proposer,
        string memory description,
        address targetContract,
        uint256 creationTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed
    );
    function getUserVote(uint256 _proposalId, address _voter) external view returns (
        bool hasVoted,
        bool support,
        uint256 voteAmount
    );
}