// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title ClampifyGovernance
 * @dev Governance contract for the Clampify platform
 */
contract ClampifyGovernance is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // Reference to the launchpad
    address public launchpad;

    // Events
    event LaunchpadUpdated(address indexed oldLaunchpad, address indexed newLaunchpad);

    /**
     * @dev Constructor for ClampifyGovernance
     * @param _token IVotes token used for voting
     * @param _timelock TimelockController used for governance
     * @param _launchpad Clampify Launchpad address
     * @param _votingDelay Delay before voting on proposals can begin (in blocks)
     * @param _votingPeriod Time for voting on proposals (in blocks)
     * @param _proposalThreshold Minimum number of votes to create proposal
     * @param _quorumNumerator Fraction of total supply required for quorum
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        address _launchpad,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumNumerator
    )
        Governor("ClampifyGovernance")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumNumerator)
        GovernorTimelockControl(_timelock)
    {
        require(_launchpad != address(0), "ClampifyGovernance: Launchpad cannot be zero address");
        launchpad = _launchpad;
    }
    
    /**
     * @dev Update the launchpad address
     * @param _newLaunchpad New launchpad address
     */
    function updateLaunchpad(address _newLaunchpad) external onlyGovernance {
        require(_newLaunchpad != address(0), "ClampifyGovernance: New launchpad cannot be zero address");
        
        address oldLaunchpad = launchpad;
        launchpad = _newLaunchpad;
        
        emit LaunchpadUpdated(oldLaunchpad, _newLaunchpad);
    }

    // The following functions are overrides required by Solidity

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }
    
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }
    
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }
    
    function proposalNeedsQueuing(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    // Queue operations override
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    // Execute operations override
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    // Cancel operations override
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    // Executor getter override
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    // Interface support
    function supportsInterface(bytes4 interfaceId) 
        public view override(Governor) returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Time functions
    function clock() public view override(Governor, GovernorVotes) returns (uint48) {
        return super.clock();
    }

    function CLOCK_MODE() public view override(Governor, GovernorVotes) returns (string memory) {
        return super.CLOCK_MODE();
    }
}