// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Crowdfunding {
    // 众筹状态
    enum State { Active, Completed, Refunded }
    
    // 众筹项目结构
    struct Campaign {
        address owner;           // 项目方
        string title;           // 标题
        string description;     // 描述
        uint256 goal;           // 目标金额 (ETH)
        uint256 deadline;       // 截止时间
        uint256 amountRaised;  // 已筹集
        State state;           // 状态
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public campaignCount;
    
    // 事件
    event CampaignCreated(uint256 id, address owner, string title, uint256 goal);
    event Funded(uint256 id, address funder, uint256 amount);
    event Completed(uint256 id, uint256 amount);
    event Refunded(uint256 id, address funder, uint256 amount);
    
    // 创建众筹
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) public returns (uint256) {
        campaignCount++;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);
        
        campaigns[campaignCount] = Campaign(
            msg.sender,
            _title,
            _description,
            _goal,
            deadline,
            0,
            State.Active
        );
        
        emit CampaignCreated(campaignCount, msg.sender, _title, _goal);
        return campaignCount;
    }
    
    // 资助项目
    function fund(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(campaign.state == State.Active, "Campaign not active");
        require(block.timestamp < campaign.deadline, "Deadline passed");
        require(msg.value > 0, "Must send ETH");
        
        campaign.amountRaised += msg.value;
        contributions[_id][msg.sender] += msg.value;
        
        emit Funded(_id, msg.sender, msg.value);
    }
    
    // 完成众筹（项目方调用）
    function complete(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only owner");
        require(campaign.amountRaised >= campaign.goal, "Goal not reached");
        
        campaign.state = State.Completed;
        
        // 发送资金给项目方
        payable(campaign.owner).transfer(campaign.amountRaised);
        
        emit Completed(_id, campaign.amountRaised);
    }
    
    // 退款（资助者调用）
    function refund(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(campaign.state == State.Active, "Campaign not active");
        require(block.timestamp > campaign.deadline, "Not ended");
        require(campaign.amountRaised < campaign.goal, "Goal reached");
        
        uint256 amount = contributions[_id][msg.sender];
        require(amount > 0, "No contribution");
        
        contributions[_id][msg.sender] = 0;
        campaign.state = State.Refunded;
        
        payable(msg.sender).transfer(amount);
        
        emit Refunded(_id, msg.sender, amount);
    }
    
    // 获取项目详情
    function getCampaign(uint256 _id) public view returns (
        address owner,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 deadline,
        uint256 amountRaised,
        State state
    ) {
        Campaign storage c = campaigns[_id];
        return (c.owner, c.title, c.description, c.goal, c.deadline, c.amountRaised, c.state);
    }
}
