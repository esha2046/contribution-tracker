export const CONTRIBUTION_TRACKER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "contribId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "points", "type": "uint256" }
    ],
    "name": "ContributionSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "disputeId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "contribId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "raisedBy", "type": "address" }
    ],
    "name": "DisputeRaised",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "disputeId", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "contributionKept", "type": "bool" }
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "admin", "type": "address" }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "member", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "newScore", "type": "uint256" }
    ],
    "name": "ScoreUpdated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "address", "name": "newMember", "type": "address" }
    ],
    "name": "addMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" }
    ],
    "name": "closeProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contributionCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "contributionPoints",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "contributions",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "address", "name": "contributor", "type": "address" },
      { "internalType": "string", "name": "taskTitle", "type": "string" },
      { "internalType": "uint8", "name": "contribType", "type": "uint8" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "points", "type": "uint256" },
      { "internalType": "bool", "name": "disputed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "address[]", "name": "members", "type": "address[]" }
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "disputeCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "disputes",
    "outputs": [
      { "internalType": "uint256", "name": "contribId", "type": "uint256" },
      { "internalType": "address", "name": "raisedBy", "type": "address" },
      { "internalType": "string", "name": "reason", "type": "string" },
      { "internalType": "uint256", "name": "votesFor", "type": "uint256" },
      { "internalType": "uint256", "name": "votesAgainst", "type": "uint256" },
      { "internalType": "bool", "name": "resolved", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "fileHashToContribId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "projectId", "type": "uint256" }],
    "name": "getLeaderboard",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" },
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "memberScores",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "projectCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "projects",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "address", "name": "admin", "type": "address" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "contributionId", "type": "uint256" },
      { "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "removeMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "string", "name": "taskTitle", "type": "string" },
      { "internalType": "uint8", "name": "contribType", "type": "uint8" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "bytes32", "name": "fileHash", "type": "bytes32" }
    ],
    "name": "submitContribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "fileHash", "type": "bytes32" }],
    "name": "verifyFile",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "disputeId", "type": "uint256" },
      { "internalType": "bool", "name": "keepContribution", "type": "bool" }
    ],
    "name": "voteOnDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];