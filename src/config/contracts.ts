// Contract configuration
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' // Replace after deploy

export const CONTRACT_ABI = [
  // Campaign Management
  "function createCampaign(string memory _title, string memory _description, string memory _imageURI, uint256 _goal, uint256 _minContribution, uint256 _maxContribution, uint256 _durationInDays, bool _useWhitelist, bytes32 _merkleRoot) external returns (uint256)",
  "function addMilestones(uint256 _id, uint256[] memory _amounts, string[] memory _descriptions) external",
  "function cancelCampaign(uint256 _id) external",
  
  // Funding
  "function fund(uint256 _id, bytes32[] memory _merkleProof) external payable",
  "function releaseMilestone(uint256 _id, uint256 _milestoneIndex) external",
  "function claimRefund(uint256 _id) external",
  
  // View Functions
  "function campaignCount() external view returns (uint256)",
  "function campaigns(uint256 _id) external view returns (address creator, string memory title, string memory description, string memory imageURI, uint256 goal, uint256 minContribution, uint256 maxContribution, uint256 deadline, uint256 amountRaised, uint256 contributorCount, uint8 state, uint256 milestoneCount, uint256 currentMilestone)",
  "function getMilestones(uint256 _id) external view returns (uint256[] memory, string[] memory, bool[] memory)",
  "function getContributors(uint256 _id) external view returns (address[] memory)",
  "function contributions(uint256 _id, address _contributor) external view returns (uint256 amount, uint256 timestamp, bool claimed)",
  
  // Admin
  "function setPlatformFee(uint256 _fee) external",
  "function setFeeRecipient(address _recipient) external",
  "function platformFee() external view returns (uint256)",
  "function feeRecipient() external view returns (address)",
  
  // Events
  "event CampaignCreated(uint256 indexed id, address indexed creator, string title, uint256 goal, uint256 deadline)",
  "event Funded(uint256 indexed id, address indexed contributor, uint256 amount, uint8 tier)",
  "event MilestoneCreated(uint256 indexed campaignId, uint256 indexed milestoneIndex, uint256 amount, string description)",
  "event MilestoneReleased(uint256 indexed campaignId, uint256 indexed milestoneIndex, uint256 amount)",
  "event RefundClaimed(uint256 indexed id, address indexed contributor, uint256 amount)",
  "event NFTMinted(uint256 indexed campaignId, address indexed recipient, uint8 tier, uint256 tokenId)"
] as const

export const CAMPAIGN_STATES = ['Pending', 'Active', 'Completed', 'Failed', 'Cancelled'] as const

export const FUND_TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const
