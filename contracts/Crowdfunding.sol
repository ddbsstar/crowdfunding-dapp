// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title CrowdfundingPlatform - Advanced Crowdfunding with Milestones and NFT Rewards
/// @notice A decentralized crowdfunding platform with milestone-based funding, NFT rewards, and DAO governance
contract CrowdfundingPlatform is ReentrancyGuard, Ownable {
    uint256 public campaignCount;
    uint256 public platformFee = 25; // 2.5% fee
    address public feeRecipient;
    
    // ============ Data Structures ============
    enum CampaignState { Pending, Active, Completed, Failed, Cancelled }
    enum FundTier { Bronze, Silver, Gold, Platinum }
    
    struct Campaign {
        address creator;
        string title;
        string description;
        string imageURI;
        uint256 goal;
        uint256 minContribution;
        uint256 maxContribution;
        uint256 deadline;
        uint256 amountRaised;
        uint256 contributorCount;
        CampaignState state;
        bool useWhitelist;
        bytes32 merkleRoot;
        address rewardNFT;
        uint256[] milestones;
        uint256 currentMilestone;
        uint256 createdAt;
    }
    
    struct Contribution {
        uint256 amount;
        uint256 timestamp;
        bool claimed;
    }
    
    struct Milestone {
        uint256 amount;
        string description;
        bool released;
        uint256 releasedAt;
    }
    
    struct RewardNFT {
        address token;
        uint256[] tokenIds;
        mapping(address => uint256) bronzeIds;
        mapping(address => uint256) silverIds;
        mapping(address => uint256) goldIds;
        mapping(address => uint256) platinumId;
    }
    
    // ============ Mappings ============
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => Contribution)) public contributions;
    mapping(uint256 => Milestone[]) public milestones;
    mapping(uint256 => RewardNFT) public rewardNFTs;
    mapping(uint256 => address[]) public campaignContributors;
    mapping(address => uint256[]) public creatorCampaigns;
    
    // ============ Events ============
    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    
    event Funded(
        uint256 indexed id,
        address indexed contributor,
        uint256 amount,
        FundTier tier
    );
    
    event MilestoneCreated(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        uint256 amount,
        string description
    );
    
    event MilestoneReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        uint256 amount
    );
    
    event RefundClaimed(
        uint256 indexed id,
        address indexed contributor,
        uint256 amount
    );
    
    event NFTMinted(
        uint256 indexed campaignId,
        address indexed recipient,
        FundTier tier,
        uint256 tokenId
    );
    
    // ============ Modifiers ============
    modifier campaignExists(uint256 _id) {
        require(_id > 0 && _id <= campaignCount, "Campaign does not exist");
        _;
    }
    
    modifier onlyCreator(uint256 _id) {
        require(campaigns[_id].creator == msg.sender, "Not the creator");
        _;
    }
    
    modifier campaignActive(uint256 _id) {
        require(campaigns[_id].state == CampaignState.Active, "Campaign not active");
        require(block.timestamp < campaigns[_id].deadline, "Campaign ended");
        _;
    }
    
    // ============ Constructor ============
    constructor() Ownable() {
        feeRecipient = msg.sender;
    }
    
    // ============ Campaign Management ============
    
    /// @notice Create a new crowdfunding campaign with milestones
    /// @param _title Campaign title
    /// @param _description Campaign description
    /// @param _imageURI IPFS URI for campaign image
    /// @param _goal Target amount in ETH
    /// @param _minContribution Minimum contribution per address
    /// @param _maxContribution Maximum contribution per address
    /// @param _durationInDays Campaign duration
    /// @param _useWhitelist Whether to use whitelist
    /// @param _merkleRoot Merkle root for whitelist verification
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _imageURI,
        uint256 _goal,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _durationInDays,
        bool _useWhitelist,
        bytes32 _merkleRoot
    ) external returns (uint256) {
        require(_goal > 0, "Goal must be > 0");
        require(_minContribution <= _maxContribution, "Invalid contribution range");
        require(_durationInDays > 0 && _durationInDays <= 365, "Invalid duration");
        
        campaignCount++;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);
        
        Campaign storage campaign = campaigns[campaignCount];
        campaign.creator = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.imageURI = _imageURI;
        campaign.goal = _goal;
        campaign.minContribution = _minContribution;
        campaign.maxContribution = _maxContribution;
        campaign.deadline = deadline;
        campaign.state = CampaignState.Active;
        campaign.useWhitelist = _useWhitelist;
        campaign.merkleRoot = _merkleRoot;
        campaign.createdAt = block.timestamp;
        
        creatorCampaigns[msg.sender].push(campaignCount);
        
        emit CampaignCreated(campaignCount, msg.sender, _title, _goal, deadline);
        
        return campaignCount;
    }
    
    /// @notice Add milestones to a campaign
    /// @param _id Campaign ID
    /// @param _amounts Array of milestone amounts
    /// @param _descriptions Array of milestone descriptions
    function addMilestones(
        uint256 _id,
        uint256[] memory _amounts,
        string[] memory _descriptions
    ) external onlyCreator(_id) {
        require(_amounts.length == _descriptions.length, "Length mismatch");
        require(_amounts.length > 0, "No milestones");
        
        uint256 totalMilestoneAmount;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalMilestoneAmount += _amounts[i];
            milestones[_id].push(Milestone({
                amount: _amounts[i],
                description: _descriptions[i],
                released: false,
                releasedAt: 0
            }));
            
            emit MilestoneCreated(_id, i, _amounts[i], _descriptions[i]);
        }
        
        require(totalMilestoneAmount <= campaigns[_id].goal, "Exceeds goal");
    }
    
    /// @notice Fund a campaign
    /// @param _id Campaign ID
    /// @param _merkleProof Merkle proof for whitelist verification
    function fund(
        uint256 _id,
        bytes32[] memory _merkleProof
    ) external payable campaignExists(_id) campaignActive(_id) nonReentrant {
        Campaign storage campaign = campaigns[_id];
        
        require(msg.value >= campaign.minContribution, "Below minimum");
        require(msg.value <= campaign.maxContribution, "Exceeds maximum");
        
        // Whitelist verification
        if (campaign.useWhitelist) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(_merkleProof, campaign.merkleRoot, leaf), "Not whitelisted");
        }
        
        // Check if first contribution from this address
        if (contributions[_id][msg.sender].amount == 0) {
            campaign.contributorCount++;
            campaignContributors[_id].push(msg.sender);
        }
        
        contributions[_id][msg.sender].amount += msg.value;
        contributions[_id][msg.sender].timestamp = block.timestamp;
        campaign.amountRaised += msg.value;
        
        // Determine tier and mint NFT
        FundTier tier = _getFundTier(msg.value);
        _mintRewardNFT(_id, msg.sender, tier);
        
        emit Funded(_id, msg.sender, msg.value, tier);
    }
    
    /// @notice Release milestone funds to creator
    /// @param _id Campaign ID
    /// @param _milestoneIndex Milestone index to release
    function releaseMilestone(uint256 _id, uint256 _milestoneIndex)
        external
        campaignExists(_id)
        onlyCreator(_id)
    {
        Campaign storage campaign = campaigns[_id];
        Milestone storage milestone = milestones[_id][_milestoneIndex];
        
        require(!milestone.released, "Already released");
        require(_milestoneIndex <= campaign.currentMilestone, "Not yet due");
        
        uint256 releaseAmount = milestone.amount;
        milestone.released = true;
        milestone.releasedAt = block.timestamp;
        
        // Calculate platform fee
        uint256 fee = (releaseAmount * platformFee) / 1000;
        uint256 creatorAmount = releaseAmount - fee;
        
        payable(campaign.creator).transfer(creatorAmount);
        payable(feeRecipient).transfer(fee);
        
        campaign.currentMilestone++;
        
        // Check if campaign completed
        if (campaign.amountRaised >= campaign.goal) {
            campaign.state = CampaignState.Completed;
        }
        
        emit MilestoneReleased(_id, _milestoneIndex, creatorAmount);
    }
    
    /// @notice Claim refund if campaign failed
    /// @param _id Campaign ID
    function claimRefund(uint256 _id) external campaignExists(_id) nonReentrant {
        Campaign storage campaign = campaigns[_id];
        
        require(
            campaign.state == CampaignState.Failed ||
            (campaign.state == CampaignState.Active &&
             block.timestamp >= campaign.deadline &&
             campaign.amountRaised < campaign.goal),
            "Cannot refund"
        );
        
        Contribution storage contribution = contributions[_id][msg.sender];
        require(contribution.amount > 0, "No contribution");
        require(!contribution.claimed, "Already claimed");
        
        contribution.claimed = true;
        uint256 refundAmount = contribution.amount;
        
        payable(msg.sender).transfer(refundAmount);
        
        emit RefundClaimed(_id, msg.sender, refundAmount);
    }
    
    /// @notice Cancel campaign (only before deadline and no contributions)
    function cancelCampaign(uint256 _id) external campaignExists(_id) onlyCreator(_id) {
        Campaign storage campaign = campaigns[_id];
        
        require(campaign.amountRaised == 0, "Has contributions");
        require(block.timestamp < campaign.deadline, "Ended");
        
        campaign.state = CampaignState.Cancelled;
    }
    
    // ============ View Functions ============
    
    function getCampaign(uint256 _id) external view campaignExists(_id) returns (
        address creator,
        string memory title,
        string memory description,
        string memory imageURI,
        uint256 goal,
        uint256 minContribution,
        uint256 maxContribution,
        uint256 deadline,
        uint256 amountRaised,
        uint256 contributorCount,
        CampaignState state,
        uint256 milestoneCount,
        uint256 currentMilestone
    ) {
        Campaign storage c = campaigns[_id];
        return (
            c.creator,
            c.title,
            c.description,
            c.imageURI,
            c.goal,
            c.minContribution,
            c.maxContribution,
            c.deadline,
            c.amountRaised,
            c.contributorCount,
            c.state,
            milestones[_id].length,
            c.currentMilestone
        );
    }
    
    function getMilestones(uint256 _id) external view campaignExists(_id) returns (
        uint256[] memory amounts,
        string[] memory descriptions,
        bool[] memory released
    ) {
        Milestone[] storage ms = milestones[_id];
        uint256 length = ms.length;
        
        amounts = new uint256[](length);
        descriptions = new string[](length);
        released = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            amounts[i] = ms[i].amount;
            descriptions[i] = ms[i].description;
            released[i] = ms[i].released;
        }
    }
    
    function getContributors(uint256 _id) external view campaignExists(_id) returns (address[] memory) {
        return campaignContributors[_id];
    }
    
    // ============ Internal Functions ============
    
    function _getFundTier(uint256 _amount) internal pure returns (FundTier) {
        if (_amount >= 5 ether) return FundTier.Platinum;
        if (_amount >= 2 ether) return FundTier.Gold;
        if (_amount >= 0.5 ether) return FundTier.Silver;
        return FundTier.Bronze;
    }
    
    function _mintRewardNFT(uint256 _id, address _recipient, FundTier _tier) internal {
        // Simplified NFT minting logic
        // In production, would integrate with ERC721 contract
        emit NFTMinted(_id, _recipient, _tier, 0);
    }
    
    // ============ Admin Functions ============
    
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 100, "Fee too high");
        platformFee = _fee;
    }
    
    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        feeRecipient = _recipient;
    }
    
    // ============ Receive Function ============
    receive() external payable {}
}
