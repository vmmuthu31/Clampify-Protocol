// governance/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, formatDistanceToNow } from "date-fns";
import { Navbar } from "@/components/navbar";
import { usePrivy } from "@privy-io/react-auth";

// This would be imported from your contract artifacts
const GOVERNANCE_ABI = [
  "function getGovernanceTokens() external view returns (address[] memory)",
  "function tokenGovernance(address) external view returns (address tokenAddress, uint256 proposalThreshold, uint256 quorum, uint256 votingPeriod, bool isActive)",
  "function proposalCount(address) external view returns (uint256)",
  "function getProposalDetails(address tokenAddress, uint256 proposalId) external view returns (string memory, string memory, address, uint256, uint256, bool, address, uint256, uint256)",
  "function createProposal(address tokenAddress, string memory title, string memory description, address targetContract, bytes memory callData) external returns (uint256)",
  "function castVote(address tokenAddress, uint256 proposalId, bool support) external",
  "function executeProposal(address tokenAddress, uint256 proposalId) external",
  "function hasVoted(address tokenAddress, uint256 proposalId, address voter) external view returns (bool)",
];

const TOKEN_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
];

const GOVERNANCE_ADDRESS = "0xE383A8EFDC5D0E7a5474da69EBA775ac506953ef";

// Form schema for creating proposals
const proposalFormSchema = z.object({
  tokenAddress: z
    .string()
    .startsWith("0x", { message: "Must be a valid Ethereum address" }),
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  targetContract: z
    .string()
    .startsWith("0x", { message: "Must be a valid Ethereum address" }),
  callData: z
    .string()
    .startsWith("0x", { message: "Must be valid call data starting with 0x" }),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

type TokenInfo = {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  proposalThreshold: string;
  quorum: number;
  votingPeriod: number;
  activeProposals: number;
};

type ProposalInfo = {
  id: number;
  title: string;
  description: string;
  proposer: string;
  createdAt: Date;
  votingEndsAt: Date;
  isActive: boolean;
  executed: boolean;
  targetContract: string;
  yesVotes: string;
  noVotes: string;
  yesPercentage: number;
  noPercentage: number;
  quorumReached: boolean;
  hasVoted: boolean | null;
  userVoteDirection: boolean | null;
};

export default function GovernancePage() {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [proposals, setProposals] = useState<ProposalInfo[]>([]);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const { authenticated, login, user } = usePrivy();
  const userAddress = user?.wallet?.address;

  // Form handler for creating new proposals
  const proposalForm = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      tokenAddress: selectedToken || "",
      title: "",
      description: "",
      targetContract: "",
      callData: "",
    },
  });

  useEffect(() => {
    // Update form value when selected token changes
    if (selectedToken) {
      proposalForm.setValue("tokenAddress", selectedToken);
    }
  }, [selectedToken, proposalForm]);

  const onProposalSubmit = async (values: ProposalFormValues) => {};

  // Vote on a proposal
  const handleVote = async (proposalId: number, support: boolean) => {};

  // Execute a proposal
  const handleExecute = async (proposalId: number) => {};

  // Handle token selection change
  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
  };

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Clampify Governance</h1>
        <p className="text-lg mb-8">
          Please connect your wallet to access governance features.
        </p>
        <Button size="lg" onClick={() => login()}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto min-h-screen px-4 py-20">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Clampify Governance
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Vote on proposals and shape the future of the platform
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {tokens.length === 0 ? (
              <div className="text-center p-12 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">
                  No Governance Tokens Found
                </h2>
                <p className="text-muted-foreground">
                  There are no tokens with governance activated yet.
                </p>
              </div>
            ) : (
              <>
                {/* Token Selection and Info Card */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <Card className="w-full md:w-1/3">
                    <CardHeader>
                      <CardTitle>Select Token</CardTitle>
                      <CardDescription>
                        Choose a token to view and participate in governance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedToken || ""}
                        onValueChange={handleTokenChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a token" />
                        </SelectTrigger>
                        <SelectContent>
                          {tokens.map((token) => (
                            <SelectItem
                              key={token.address}
                              value={token.address}
                            >
                              {token.name} ({token.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {selectedToken && (
                    <Card className="w-full md:w-2/3">
                      <CardHeader>
                        <CardTitle>
                          {
                            tokens.find((t) => t.address === selectedToken)
                              ?.name
                          }{" "}
                          Governance
                        </CardTitle>
                        <CardDescription>
                          Token governance parameters and your voting power
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Your Balance
                            </h3>
                            <p className="text-2xl font-bold">
                              {parseFloat(
                                tokens.find((t) => t.address === selectedToken)
                                  ?.balance || "0"
                              ).toLocaleString()}{" "}
                              {
                                tokens.find((t) => t.address === selectedToken)
                                  ?.symbol
                              }
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Proposal Threshold
                            </h3>
                            <p className="text-2xl font-bold">
                              {parseFloat(
                                tokens.find((t) => t.address === selectedToken)
                                  ?.proposalThreshold || "0"
                              ).toLocaleString()}{" "}
                              {
                                tokens.find((t) => t.address === selectedToken)
                                  ?.symbol
                              }
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Quorum Required
                            </h3>
                            <p className="text-2xl font-bold">
                              {
                                tokens.find((t) => t.address === selectedToken)
                                  ?.quorum
                              }
                              %
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Voting period:{" "}
                          {tokens.find((t) => t.address === selectedToken)
                            ?.votingPeriod
                            ? formatDuration(
                                tokens.find((t) => t.address === selectedToken)
                                  ?.votingPeriod || 0
                              )
                            : "N/A"}
                        </span>
                        <Dialog
                          open={proposalDialogOpen}
                          onOpenChange={setProposalDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              disabled={
                                !userAddress ||
                                parseFloat(
                                  tokens.find(
                                    (t) => t.address === selectedToken
                                  )?.balance || "0"
                                ) <
                                  parseFloat(
                                    tokens.find(
                                      (t) => t.address === selectedToken
                                    )?.proposalThreshold || "0"
                                  )
                              }
                            >
                              Create Proposal
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Create New Proposal</DialogTitle>
                              <DialogDescription>
                                Submit a proposal for the community to vote on.
                                You need at least{" "}
                                {parseFloat(
                                  tokens.find(
                                    (t) => t.address === selectedToken
                                  )?.proposalThreshold || "0"
                                ).toLocaleString()}{" "}
                                {
                                  tokens.find(
                                    (t) => t.address === selectedToken
                                  )?.symbol
                                }{" "}
                                to create a proposal.
                              </DialogDescription>
                            </DialogHeader>

                            <Form {...proposalForm}>
                              <form
                                onSubmit={proposalForm.handleSubmit(
                                  onProposalSubmit
                                )}
                                className="space-y-4"
                              >
                                <FormField
                                  control={proposalForm.control}
                                  name="title"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Proposal Title</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter a descriptive title"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={proposalForm.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Provide details about your proposal"
                                          className="min-h-[120px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={proposalForm.control}
                                  name="targetContract"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Target Contract</FormLabel>
                                      <FormControl>
                                        <Input placeholder="0x..." {...field} />
                                      </FormControl>
                                      <FormDescription>
                                        The contract address that will be called
                                        if the proposal passes
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={proposalForm.control}
                                  name="callData"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Call Data</FormLabel>
                                      <FormControl>
                                        <Input placeholder="0x..." {...field} />
                                      </FormControl>
                                      <FormDescription>
                                        The encoded function call data (use
                                        ethers.utils.encodeFunctionData)
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <DialogFooter>
                                  <Button type="submit">Submit Proposal</Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  )}
                </div>

                {/* Proposals Section */}
                {selectedToken && (
                  <div>
                    <Tabs defaultValue="active">
                      <TabsList>
                        <TabsTrigger value="active">
                          Active Proposals
                        </TabsTrigger>
                        <TabsTrigger value="past">Past Proposals</TabsTrigger>
                      </TabsList>

                      <TabsContent value="active" className="space-y-6 mt-6">
                        {proposals.filter((p) => p.isActive).length === 0 ? (
                          <div className="text-center p-12 border rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">
                              No Active Proposals
                            </h2>
                            <p className="text-muted-foreground">
                              There are no active proposals for this token at
                              the moment.
                            </p>
                          </div>
                        ) : (
                          proposals
                            .filter((p) => p.isActive)
                            .map((proposal) => (
                              <ProposalCard
                                key={`${selectedToken}-${proposal.id}`}
                                proposal={proposal}
                                onVote={handleVote}
                                onExecute={handleExecute}
                                userAddress={userAddress}
                                selectedToken={selectedToken}
                                quorum={
                                  tokens.find(
                                    (t) => t.address === selectedToken
                                  )?.quorum || 0
                                }
                              />
                            ))
                        )}
                      </TabsContent>

                      <TabsContent value="past" className="space-y-6 mt-6">
                        {proposals.filter((p) => !p.isActive).length === 0 ? (
                          <div className="text-center p-12 border rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">
                              No Past Proposals
                            </h2>
                            <p className="text-muted-foreground">
                              There are no past proposals for this token.
                            </p>
                          </div>
                        ) : (
                          proposals
                            .filter((p) => !p.isActive)
                            .map((proposal) => (
                              <ProposalCard
                                key={`${selectedToken}-${proposal.id}`}
                                proposal={proposal}
                                onVote={handleVote}
                                onExecute={handleExecute}
                                userAddress={userAddress}
                                selectedToken={selectedToken}
                                quorum={
                                  tokens.find(
                                    (t) => t.address === selectedToken
                                  )?.quorum || 0
                                }
                              />
                            ))
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

// Helper component for proposals
function ProposalCard({
  proposal,
  onVote,
  onExecute,
  userAddress,
  quorum,
}: {
  proposal: ProposalInfo;
  onVote: (proposalId: number, support: boolean) => Promise<void>;
  onExecute: (proposalId: number) => Promise<void>;
  userAddress: string | undefined;
  selectedToken: string;
  quorum: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              #{proposal.id}: {proposal.title}
              {proposal.executed ? (
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  Executed
                </Badge>
              ) : !proposal.isActive ? (
                <Badge
                  variant="outline"
                  className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                >
                  Expired
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  Active
                </Badge>
              )}
            </CardTitle>

            <CardDescription>
              Proposed by:{" "}
              {proposal.proposer === userAddress
                ? "You"
                : `${proposal.proposer.substring(
                    0,
                    6
                  )}...${proposal.proposer.substring(38)}`}
              <span className="mx-2">•</span>
              Created{" "}
              {formatDistanceToNow(proposal.createdAt, { addSuffix: true })}
            </CardDescription>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium">
              {proposal.isActive ? (
                <>
                  Voting Ends:{" "}
                  <span className="text-muted-foreground">
                    {format(proposal.votingEndsAt, "MMM d, yyyy HH:mm")}
                  </span>
                </>
              ) : (
                <>
                  Ended:{" "}
                  <span className="text-muted-foreground">
                    {format(proposal.votingEndsAt, "MMM d, yyyy HH:mm")}
                  </span>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(proposal.votingEndsAt, { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm">{proposal.description}</div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Voting Progress</h4>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Yes: {parseFloat(proposal.yesVotes).toLocaleString()} (
                {proposal.yesPercentage}%)
              </span>
              <span>
                No: {parseFloat(proposal.noVotes).toLocaleString()} (
                {proposal.noPercentage}%)
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${proposal.yesPercentage}%` }}
              ></div>
            </div>

            <div className="mt-2 text-sm text-muted-foreground flex justify-between">
              <span>
                Quorum:{" "}
                {proposal.quorumReached ? (
                  <span className="text-green-600 dark:text-green-400">
                    Reached
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    Needed: {quorum}% of total supply
                  </span>
                )}
              </span>
              <span>
                {proposal.hasVoted &&
                  `You voted: ${proposal.userVoteDirection ? "Yes" : "No"}`}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {proposal.isActive && !proposal.hasVoted && userAddress && (
              <>
                <Button
                  onClick={() => onVote(proposal.id, true)}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  Vote Yes
                </Button>
                <Button
                  onClick={() => onVote(proposal.id, false)}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Vote No
                </Button>
              </>
            )}

            {!proposal.isActive &&
              !proposal.executed &&
              proposal.yesPercentage > proposal.noPercentage &&
              proposal.quorumReached && (
                <Button
                  onClick={() => onExecute(proposal.id)}
                  variant="default"
                >
                  Execute Proposal
                </Button>
              )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <div>
          Target Contract: {proposal.targetContract.substring(0, 6)}...
          {proposal.targetContract.substring(38)}
        </div>
      </CardFooter>
    </Card>
  );
}

// Helper function to format time duration
function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    return `${seconds} seconds`;
  }
}
