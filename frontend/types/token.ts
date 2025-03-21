export interface Token {
  _id: string;
  address: string;
  name: string;
  symbol: string;
  creator: string;
  initialSupply: string;
  maxSupply: string;
  createdAt: string;
  balance?: string;
  proposalThreshold?: string;
  quorum?: number;
  votingPeriod?: number;
  __v?: number;
}

export interface GovernanceProposalData {
  id: number;
  title: string;
  description: string;
  proposer: string;
  createdAt: number;
  endTime: number;
  active: boolean;
  executed: boolean;
  target: string;
  forVotes: string;
  againstVotes: string;
  forPercentage: number;
  againstPercentage: number;
  quorumReached: boolean;
  hasVoted: boolean;
  userVoteDirection: boolean;
} 