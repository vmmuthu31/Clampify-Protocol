// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title ClampifyGovernance
 * @dev Governance system for the Clampify platform
 */
contract ClampifyGovernance is AccessControl, ReentrancyGuard {
    using SafeMath for uint256;
    
    // Roles
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    // State variables
    address public platformToken;
    address public clampifyContract;
    uint256 public proposalCount;
    uint256 public minVotingPeriod = 1 days;
    uint256 public maxVotingPeriod = 30 days;
    uint256 public proposalThreshold = 100 ether; // Min tokens to create proposal
    uint256 public quorum = 10; // 10% of total supply needed for quorum
    
    // Proposal struct
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        bytes callData;
        address targetContract;
        uint256 creationTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => VoteInfo) votes; // Address => vote info
    }
    
    // Vote information
    struct VoteInfo {
        uint256 amount; // Amount of votes
        bool support;   // True = for, False = against
        bool hasVoted;  // Has voted flag
    }
    
    // Mapping for proposals
    mapping(uint256 => Proposal) public proposals;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address targetContract,
        string description,
        uint256 endTime
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    event ProposalExecuted(
        uint256 indexed proposalId,
        address executor,
        bool success
    );
    event ProposalCancelled(
        uint256 indexed proposalId,
        address canceller
    );
    
    /**
     * @dev Constructor to initialize governance
     * @param _platformToken Platform token used for voting
     * @param _clampifyContract Address of the main Clampify contract
     */
    constructor(address _platformToken, address _clampifyContract) {
        require(_platformToken != address(0), "Platform token cannot be zero");
        require(_clampifyContract != address(0), "Clampify cannot be zero");
        
        platformToken = _platformToken;
        clampifyContract = _clampifyContract;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new governance proposal
     * @param _description Description of the proposal
     * @param _targetContract Contract to call if proposal passes
     * @param _callData Function call data for execution
     * @param _votingPeriod Voting period in seconds
     */
    function createProposal(
        string memory _description,
        address _targetContract,
        bytes memory _callData,
        uint256 _votingPeriod
    ) external nonReentrant {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_targetContract != address(0), "Target cannot be zero address");
        require(_votingPeriod >= minVotingPeriod, "Voting period too short");
        require(_votingPeriod <= maxVotingPeriod, "Voting period too long");
        
        // Check if proposer has enough tokens
        uint256 proposerBalance = IERC20(platformToken).balanceOf(msg.sender);
        require(proposerBalance >= proposalThreshold, "Below proposal threshold");
        
        // Create proposal
        uint256 proposalId = proposalCount;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = _description;
        proposal.callData = _callData;
        proposal.targetContract = _targetContract;
        proposal.creationTime = block.timestamp;
        proposal.endTime = block.timestamp.add(_votingPeriod);
        
        // Increment proposal counter
        proposalCount = proposalCount.add(1);
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            _targetContract,
            _description,
            proposal.endTime
        );
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param _proposalId ID of the proposal
     * @param _support True to vote in favor, false to vote against
     */
    function castVote(uint256 _proposalId, bool _support) external nonReentrant {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp < proposal.endTime, "Voting period ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.votes[msg.sender].hasVoted, "Already voted");
        
        // Get voter's balance
        uint256 votes = IERC20(platformToken).balanceOf(msg.sender);
        require(votes > 0, "No voting power");
        
        // Record vote
        proposal.votes[msg.sender].amount = votes;
        proposal.votes[msg.sender].support = _support;
        proposal.votes[msg.sender].hasVoted = true;
        
        if (_support) {
            proposal.forVotes = proposal.forVotes.add(votes);
        } else {
            proposal.againstVotes = proposal.againstVotes.add(votes);
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, votes);
    }
    
    /**
     * @dev Execute a successful proposal
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) external nonReentrant {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp >= proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        
        // Check if the proposal has enough votes
        uint256 totalSupply = IERC20(platformToken).totalSupply();
        uint256 quorumVotes = totalSupply.mul(quorum).div(100);
        
        require(proposal.forVotes.add(proposal.againstVotes) >= quorumVotes, "Quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Proposal defeated");
        
        // Mark as executed
        proposal.executed = true;
        
        // Execute the proposal
        (bool success, ) = proposal.targetContract.call(proposal.callData);
        
        emit ProposalExecuted(_proposalId, msg.sender, success);
    }
    
    /**
     * @dev Cancel a proposal (only by proposer or governance role)
     * @param _proposalId ID of the proposal
     */
    function cancelProposal(uint256 _proposalId) external {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        require(
            proposal.proposer == msg.sender || hasRole(GOVERNANCE_ROLE, msg.sender),
            "Not authorized"
        );
        require(!proposal.executed, "Already executed");
        
        // Mark as executed to prevent further actions
        proposal.executed = true;
        
        emit ProposalCancelled(_proposalId, msg.sender);
    }
    
    /**
     * @dev Change minimum proposal threshold
     * @param _newThreshold New threshold amount
     */
    function setProposalThreshold(uint256 _newThreshold) external onlyRole(GOVERNANCE_ROLE) {
        proposalThreshold = _newThreshold;
    }
    
    /**
     * @dev Change quorum requirement
     * @param _newQuorum New quorum percentage (1-100)
     */
    function setQuorum(uint256 _newQuorum) external onlyRole(GOVERNANCE_ROLE) {
        require(_newQuorum > 0 && _newQuorum <= 100, "Invalid quorum range");
        quorum = _newQuorum;
    }
    
    /**
     * @dev Change voting period limits
     * @param _minPeriod Minimum voting period
     * @param _maxPeriod Maximum voting period
     */
    function setVotingPeriodLimits(uint256 _minPeriod, uint256 _maxPeriod) external onlyRole(GOVERNANCE_ROLE) {
        require(_minPeriod > 0, "Minimum period must be > 0");
        require(_maxPeriod > _minPeriod, "Max must be > min");
        minVotingPeriod = _minPeriod;
        maxVotingPeriod = _maxPeriod;
    }
    
    /**
     * @dev Get the current status of a proposal
     * @param _proposalId Proposal ID
     * @return status 0=Pending, 1=Active, 2=Succeeded, 3=Defeated, 4=Executed, 5=Canceled
     */
    function getProposalStatus(uint256 _proposalId) external view returns (uint8) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.executed) {
            return 4; // Executed
        }
        
        if (proposal.forVotes == 0 && proposal.againstVotes == 0) {
            // No votes cast yet
            if (block.timestamp < proposal.endTime) {
                return 0; // Pending
            } else {
                return 3; // Defeated (no votes)
            }
        }
        
        if (block.timestamp < proposal.endTime) {
            return 1; // Active
        }
        
        uint256 totalSupply = IERC20(platformToken).totalSupply();
        uint256 quorumVotes = totalSupply.mul(quorum).div(100);
        
        // Check if quorum reached
        if (proposal.forVotes.add(proposal.againstVotes) < quorumVotes) {
            return 3; // Defeated (no quorum)
        }
        
        // Check if proposal passed
        if (proposal.forVotes > proposal.againstVotes) {
            return 2; // Succeeded
        } else {
            return 3; // Defeated (votes against)
        }
    }
    
    /**
     * @dev Get details about a specific proposal
     * @param _proposalId Proposal ID
     * @return proposer Creator of the proposal
     * @return description Description text
     * @return targetContract Contract to call
     * @return creationTime When proposal was created
     * @return endTime When voting ends
     * @return forVotes Total votes in favor
     * @return againstVotes Total votes against
     * @return executed Whether proposal was executed
     */
    function getProposalDetails(uint256 _proposalId) external view returns (
        address proposer,
        string memory description,
        address targetContract,
        uint256 creationTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed
    ) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        return (
            proposal.proposer,
            proposal.description,
            proposal.targetContract,
            proposal.creationTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed
        );
    }
    
    /**
     * @dev Check how a user voted on a proposal
     * @param _proposalId Proposal ID
     * @param _voter Voter address
     * @return hasVoted Whether the user voted
     * @return support Whether the user voted in support
     * @return voteAmount Amount of votes cast
     */
    function getUserVote(uint256 _proposalId, address _voter) external view returns (
        bool hasVoted,
        bool support,
        uint256 voteAmount
    ) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        VoteInfo storage voteInfo = proposals[_proposalId].votes[_voter];
        
        return (
            voteInfo.hasVoted,
            voteInfo.support,
            voteInfo.amount
        );
    }
}