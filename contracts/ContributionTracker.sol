// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ContributionTracker {
    struct Project{
        uint id;
        string name;
        address admin;
        bool isActive;
        address[] members;
    }

    struct Contribution {
        uint id;
        uint projectId;
        address contributor;
        string taskTitle;
        uint8 contribType;
        string ipfsCID;
        bytes32 fileHash;
        uint timestamp;
        uint points;
        bool disputed;
    }

    struct Dispute {
        uint contribId;
        address raisedBy;
        string reason;
        uint votesFor;
        uint votesAgainst;
        bool resolved;
        mapping(address => bool) hasVoted;
    }

    //state var 
    uint public projectCount;
    uint public contributionCount;
    uint public disputeCount;

    mapping(uint => Project) public projects;
    mapping(uint => Contribution) public contributions;
    mapping(uint => Dispute) public disputes;

    mapping(uint => mapping(address => uint)) public memberScores;
    mapping(bytes32 => uint) public fileHashToContribId;

    uint8[6] public contributionPoints = [5, 4, 3, 3, 2, 2];

    //events
    event ProjectCreated(uint projectId, string name, address admin);
    event ContributionSubmitted(uint contribId, address contributor, uint points);
    event DisputeRaised(uint disputeId, uint contribId, address raisedBy);
    event DisputeResolved(uint disputeId, bool contributionKept);
    event ScoreUpdated(uint projectId, address member, uint newScore);

    //conditons and modifiers
    modifier onlyAdmin(uint projectId) {
        require(projects[projectId].admin == msg.sender, "Only admin can do this");
        _;
    }

    modifier onlyMember(uint projectId) {
        bool isMember = false;
        for (uint i = 0; i < projects[projectId].members.length; i++) {
            if (projects[projectId].members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Only project members can do this");
        _;
    }

    modifier projectExists(uint projectId) {
        require(projectId < projectCount, "Project does not exist");
        _;
    }


    function createProject(string memory name, address[] memory members) public {
        uint projectId = projectCount;

        projects[projectId].id = projectId;
        projects[projectId].name = name;
        projects[projectId].admin = msg.sender;
        projects[projectId].isActive = true;

        for (uint i = 0; i < members.length; i++) {
            projects[projectId].members.push(members[i]);
        }

        projectCount++;

        emit ProjectCreated(projectId, name, msg.sender);
    }

    function addMember(uint projectId, address newMember) public 
        projectExists(projectId) 
        onlyAdmin(projectId) 
    {
        require(newMember != address(0), "Invalid member address");
        
        // Check if member already exists
        for (uint i = 0; i < projects[projectId].members.length; i++) {
            require(projects[projectId].members[i] != newMember, "Member already exists");
        }
        
        projects[projectId].members.push(newMember);
    }

    function removeMember(uint projectId, address member) public 
        projectExists(projectId) 
        onlyAdmin(projectId) 
    {
        require(member != address(0), "Invalid member address");
        
        uint index = projects[projectId].members.length;
        for (uint i = 0; i < projects[projectId].members.length; i++) {
            if (projects[projectId].members[i] == member) {
                index = i;
                break;
            }
        }
        
        require(index < projects[projectId].members.length, "Member not found");
        
        // Remove member by swapping with last element and popping
        projects[projectId].members[index] = projects[projectId].members[projects[projectId].members.length - 1];
        projects[projectId].members.pop();
    }

    function submitContribution(
        uint projectId,
        string memory taskTitle,
        uint8 contribType,
        string memory ipfsCID,
        bytes32 fileHash
    ) public projectExists(projectId) onlyMember(projectId) {
        require(projects[projectId].isActive, "Project is not active");
        require(contribType < 6, "Invalid contribution type");
        require(fileHashToContribId[fileHash] == 0, "File already submitted");

        uint points = contributionPoints[contribType];
        uint contribId = contributionCount;

        contributions[contribId].id = contribId;
        contributions[contribId].projectId = projectId;
        contributions[contribId].contributor = msg.sender;
        contributions[contribId].taskTitle = taskTitle;
        contributions[contribId].contribType = contribType;
        contributions[contribId].ipfsCID = ipfsCID;
        contributions[contribId].fileHash = fileHash;
        contributions[contribId].timestamp = block.timestamp;
        contributions[contribId].points = points;
        contributions[contribId].disputed = false;

        memberScores[projectId][msg.sender] += points;
        fileHashToContribId[fileHash] = contribId;
        contributionCount++;

        emit ContributionSubmitted(contribId, msg.sender, points);
        emit ScoreUpdated(projectId, msg.sender, memberScores[projectId][msg.sender]);
    }

    function getLeaderboard(uint projectId) 
        public 
        view 
        projectExists(projectId) 
        returns (address[] memory, uint[] memory) 
    {
        address[] memory members = projects[projectId].members;
        uint[] memory scores = new uint[](members.length);

        for (uint i = 0; i < members.length; i++) {
            scores[i] = memberScores[projectId][members[i]];
        }

        return (members, scores);
    }

    function raiseDispute(
        uint contributionId,
        string memory reason
    ) public projectExists(contributions[contributionId].projectId) 
      onlyMember(contributions[contributionId].projectId) {
        require(contributionId < contributionCount, "Contribution does not exist");
        require(!contributions[contributionId].disputed, "Already disputed");
        require(contributions[contributionId].contributor != msg.sender, "Cannot dispute your own contribution");

        uint projectId = contributions[contributionId].projectId;
        uint disputeId = disputeCount;

        disputes[disputeId].contribId = contributionId;
        disputes[disputeId].raisedBy = msg.sender;
        disputes[disputeId].reason = reason;
        disputes[disputeId].votesFor = 0;
        disputes[disputeId].votesAgainst = 0;
        disputes[disputeId].resolved = false;

        contributions[contributionId].disputed = true;

        memberScores[projectId][contributions[contributionId].contributor] -= contributions[contributionId].points;

        disputeCount++;

        emit DisputeRaised(disputeId, contributionId, msg.sender);
    }

    function voteOnDispute(
        uint disputeId,
        bool keepContribution
    ) public {
        require(disputeId < disputeCount, "Dispute does not exist");
        require(!disputes[disputeId].resolved, "Dispute already resolved");
        require(!disputes[disputeId].hasVoted[msg.sender], "Already voted");
        require(disputes[disputeId].raisedBy != msg.sender, "Dispute raiser cannot vote");

        uint contribId = disputes[disputeId].contribId;
        uint projectId = contributions[contribId].projectId;

        require(contributions[contribId].contributor != msg.sender, "Contributor cannot vote on own dispute");

        bool isMember = false;
        for (uint i = 0; i < projects[projectId].members.length; i++) {
            if (projects[projectId].members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Only members can vote");

        disputes[disputeId].hasVoted[msg.sender] = true;

        if (keepContribution) {
            disputes[disputeId].votesFor++;
        } else {
            disputes[disputeId].votesAgainst++;
        }

        uint totalMembers = projects[projectId].members.length;
        uint totalVotes = disputes[disputeId].votesFor + disputes[disputeId].votesAgainst;

        if (totalVotes > totalMembers / 2) {
            _resolveDispute(disputeId);
        }
    }

    function _resolveDispute(uint disputeId) internal {
        disputes[disputeId].resolved = true;

        uint contribId = disputes[disputeId].contribId;
        uint projectId = contributions[contribId].projectId;
        address contributor = contributions[contribId].contributor;
        uint points = contributions[contribId].points;

        if (disputes[disputeId].votesFor >= disputes[disputeId].votesAgainst) {
            // Keep contribution and restore points
            contributions[contribId].disputed = false;
            memberScores[projectId][contributor] += points;
            emit DisputeResolved(disputeId, true);
            emit ScoreUpdated(projectId, contributor, memberScores[projectId][contributor]);
        } else {
            // Remove contribution and keep points deducted
            emit DisputeResolved(disputeId, false);
            emit ScoreUpdated(projectId, contributor, memberScores[projectId][contributor]);
        }
    }
    function verifyFile(bytes32 fileHash) 
        public 
        view 
        returns (bool, uint) 
    {
        uint contribId = fileHashToContribId[fileHash];
        if (contribId == 0) {
            return (false, 0);
        }
        return (true, contribId);
    }

    function closeProject(uint projectId) 
        public 
        projectExists(projectId) 
        onlyAdmin(projectId) 
    {
        require(projects[projectId].isActive, "Project already closed");
        projects[projectId].isActive = false;
    }
}