const { ethers } = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CrowdfundingPlatform", function () {
  let crowdfunding;
  let owner, creator, contributor1, contributor2, feeRecipient;
  const GOAL = ethers.parseEther("10");
  const MIN_CONTRIBUTION = ethers.parseEther("0.1");
  const MAX_CONTRIBUTION = ethers.parseEther("2");
  const DURATION = 30; // days

  beforeEach(async () => {
    [owner, creator, contributor1, contributor2, feeRecipient] = await ethers.getSigners();

    const Crowdfunding = await ethers.getContractFactory("CrowdfundingPlatform");
    crowdfunding = await Crowdfunding.deploy();
    await crowdfunding.waitForDeployment();
  });

  describe("Campaign Creation", () => {
    it("should create a campaign successfully", async () => {
      const tx = await crowdfunding.createCampaign(
        "Test Project",
        "A test crowdfunding project",
        "ipfs://QmTest",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000".padEnd(66, '0')
      );
      const receipt = await tx.wait();

      const campaignId = receipt.logs[0].args.id;
      expect(campaignId).to.equal(1);

      const campaign = await crowdfunding.getCampaign(campaignId);
      expect(campaign.creator).to.equal(owner.address);
      expect(campaign.title).to.equal("Test Project");
      expect(campaign.goal).to.equal(GOAL);
    });

    it("should fail with invalid goal", async () => {
      await expect(
        crowdfunding.createCampaign(
          "Test",
          "Desc",
          "ipfs://",
          0,
          MIN_CONTRIBUTION,
          MAX_CONTRIBUTION,
          DURATION,
          false,
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
      ).to.be.revertedWith("Goal must be > 0");
    });

    it("should fail with invalid contribution range", async () => {
      await expect(
        crowdfunding.createCampaign(
          "Test",
          "Desc",
          "ipfs://",
          GOAL,
          MAX_CONTRIBUTION,
          MIN_CONTRIBUTION, // reversed
          DURATION,
          false,
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
      ).to.be.revertedWith("Invalid contribution range");
    });

    it("should fail with invalid duration", async () => {
      await expect(
        crowdfunding.createCampaign(
          "Test",
          "Desc",
          "ipfs://",
          GOAL,
          MIN_CONTRIBUTION,
          MAX_CONTRIBUTION,
          0, // invalid
          false,
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
      ).to.be.revertedWith("Invalid duration");
    });

    it("should emit CampaignCreated event", async () => {
      const tx = await crowdfunding.createCampaign(
        "Test Project",
        "Description",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      
      const receipt = await tx.wait();
      const args = receipt.logs[0].args;
      expect(args.id).to.equal(1);
      expect(args.creator).to.equal(owner.address);
      expect(args.title).to.equal("Test Project");
      expect(args.goal).to.equal(GOAL);
      expect(args.deadline).to.be.gt(0);
    });
  });

  describe("Milestones", () => {
    let campaignId;

    beforeEach(async () => {
      const tx = await crowdfunding.createCampaign(
        "Test Project",
        "Description",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      const receipt = await tx.wait();
      campaignId = receipt.logs[0].args.id;
    });

    it("should add milestones successfully", async () => {
      const amounts = [ethers.parseEther("3"), ethers.parseEther("4"), ethers.parseEther("3")];
      const descriptions = ["Phase 1", "Phase 2", "Phase 3"];

      await crowdfunding.addMilestones(campaignId, amounts, descriptions);

      const milestones = await crowdfunding.getMilestones(campaignId);
      expect(milestones.amounts.length).to.equal(3);
      expect(milestones.amounts[0]).to.equal(amounts[0]);
      expect(milestones.descriptions[0]).to.equal(descriptions[0]);
    });

    it("should fail if not creator adds milestones", async () => {
      const amounts = [ethers.parseEther("5")];
      const descriptions = ["Phase 1"];

      await expect(
        crowdfunding.connect(contributor1).addMilestones(campaignId, amounts, descriptions)
      ).to.be.revertedWith("Not the creator");
    });

    it("should fail with mismatched array lengths", async () => {
      const amounts = [ethers.parseEther("3"), ethers.parseEther("4")];
      const descriptions = ["Phase 1"];

      await expect(
        crowdfunding.addMilestones(campaignId, amounts, descriptions)
      ).to.be.revertedWith("Length mismatch");
    });
  });

  describe("Funding", () => {
    let campaignId;

    beforeEach(async () => {
      const tx = await crowdfunding.createCampaign(
        "Test Project",
        "Description",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      const receipt = await tx.wait();
      campaignId = receipt.logs[0].args.id;
    });

    it("should fund a campaign successfully", async () => {
      const contribution = ethers.parseEther("0.5");

      await crowdfunding.connect(contributor1).fund(campaignId, [], {
        value: contribution,
      });

      const campaign = await crowdfunding.getCampaign(campaignId);
      expect(campaign.amountRaised).to.equal(contribution);
      expect(campaign.contributorCount).to.equal(1);
    });

    it("should fail with contribution below minimum", async () => {
      const contribution = ethers.parseEther("0.01"); // less than MIN_CONTRIBUTION

      await expect(
        crowdfunding.connect(contributor1).fund(campaignId, [], {
          value: contribution,
        })
      ).to.be.revertedWith("Below minimum");
    });

    it("should fail with contribution above maximum", async () => {
      const contribution = ethers.parseEther("5"); // more than MAX_CONTRIBUTION

      await expect(
        crowdfunding.connect(contributor1).fund(campaignId, [], {
          value: contribution,
        })
      ).to.be.revertedWith("Exceeds maximum");
    });

    it("should emit Funded event", async () => {
      const contribution = ethers.parseEther("0.5");

      await expect(
        crowdfunding.connect(contributor1).fund(campaignId, [], {
          value: contribution,
        })
      )
        .to.emit(crowdfunding, "Funded")
        .withArgs(campaignId, contributor1.address, contribution, 1); // Tier.Silver
    });

    it("should track multiple contributors", async () => {
      await crowdfunding.connect(contributor1).fund(campaignId, [], {
        value: ethers.parseEther("0.5"),
      });
      await crowdfunding.connect(contributor2).fund(campaignId, [], {
        value: ethers.parseEther("1"),
      });

      const campaign = await crowdfunding.getCampaign(campaignId);
      expect(campaign.contributorCount).to.equal(2);
    });

    it("should not increase contributor count for same address", async () => {
      await crowdfunding.connect(contributor1).fund(campaignId, [], {
        value: ethers.parseEther("0.5"),
      });
      await crowdfunding.connect(contributor1).fund(campaignId, [], {
        value: ethers.parseEther("0.5"),
      });

      const campaign = await crowdfunding.getCampaign(campaignId);
      expect(campaign.contributorCount).to.equal(1);
    });
  });

  describe("Milestone Release", () => {
    let campaignId;

    beforeEach(async () => {
      const tx = await crowdfunding.createCampaign(
        "Test Project",
        "Description",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      const receipt = await tx.wait();
      campaignId = receipt.logs[0].args.id;

      // Add milestones
      const amounts = [ethers.parseEther("3"), ethers.parseEther("4"), ethers.parseEther("3")];
      const descriptions = ["Phase 1", "Phase 2", "Phase 3"];
      await crowdfunding.addMilestones(campaignId, amounts, descriptions);

      // Fund the campaign to goal - need to fund multiple times since max contribution is 2 ETH
      for (let i = 0; i < 5; i++) {
        await crowdfunding.connect(contributor1).fund(campaignId, [], {
          value: ethers.parseEther("2"),
        });
      }
    });

    it("should release milestone successfully", async () => {
      const initialBalance = await ethers.provider.getBalance(owner.address);

      await crowdfunding.releaseMilestone(campaignId, 0);

      const milestones = await crowdfunding.getMilestones(campaignId);
      expect(milestones.released[0]).to.equal(true);
    });

    it("should fail if not creator tries to release", async () => {
      await expect(
        crowdfunding.connect(contributor1).releaseMilestone(campaignId, 0)
      ).to.be.revertedWith("Not the creator");
    });

    it("should fail to release already released milestone", async () => {
      await crowdfunding.releaseMilestone(campaignId, 0);

      await expect(
        crowdfunding.releaseMilestone(campaignId, 0)
      ).to.be.revertedWith("Already released");
    });
  });

  describe("Refund", () => {
    let campaignId;

    beforeEach(async () => {
      const tx = await crowdfunding.createCampaign(
        "Test Project",
        "Description",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      const receipt = await tx.wait();
      campaignId = receipt.logs[0].args.id;

      // Fund but don't reach goal
      await crowdfunding.connect(contributor1).fund(campaignId, [], {
        value: ethers.parseEther("1"),
      });
    });

    it("should allow refund after deadline when goal not reached", async () => {
      // Fast forward time past deadline
      await time.increase(DURATION * 24 * 60 * 60 + 1);

      await crowdfunding.connect(contributor1).claimRefund(campaignId);

      const contribution = await crowdfunding.contributions(campaignId, contributor1.address);
      expect(contribution.claimed).to.equal(true);
    });

    it("should fail if refund already claimed", async () => {
      await time.increase(DURATION * 24 * 60 * 60 + 1);

      await crowdfunding.connect(contributor1).claimRefund(campaignId);

      await expect(
        crowdfunding.connect(contributor1).claimRefund(campaignId)
      ).to.be.revertedWith("Already claimed");
    });

    it("should fail if no contribution", async () => {
      await time.increase(DURATION * 24 * 60 * 60 + 1);

      await expect(
        crowdfunding.connect(contributor2).claimRefund(campaignId)
      ).to.be.revertedWith("No contribution");
    });
  });

  describe("Campaign Cancellation", () => {
    let campaignId;

    beforeEach(async () => {
      const tx = await crowdfunding.createCampaign(
        "Test Project",
        "Description",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      const receipt = await tx.wait();
      campaignId = receipt.logs[0].args.id;
    });

    it("should cancel campaign successfully", async () => {
      await crowdfunding.cancelCampaign(campaignId);

      const campaign = await crowdfunding.getCampaign(campaignId);
      expect(campaign.state).to.equal(4); // CampaignState.Cancelled
    });

    it("should fail to cancel with contributions", async () => {
      await crowdfunding.connect(contributor1).fund(campaignId, [], {
        value: ethers.parseEther("1"),
      });

      await expect(
        crowdfunding.cancelCampaign(campaignId)
      ).to.be.revertedWith("Has contributions");
    });
  });

  describe("Admin Functions", () => {
    it("should set platform fee", async () => {
      await crowdfunding.setPlatformFee(50);
      expect(await crowdfunding.platformFee()).to.equal(50);
    });

    it("should fail if fee too high", async () => {
      await expect(
        crowdfunding.setPlatformFee(101)
      ).to.be.revertedWith("Fee too high");
    });

    it("should set fee recipient", async () => {
      await crowdfunding.setFeeRecipient(feeRecipient.address);
      expect(await crowdfunding.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("should fail with invalid fee recipient", async () => {
      await expect(
        crowdfunding.setFeeRecipient(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("View Functions", () => {
    it("should get contributors", async () => {
      const tx = await crowdfunding.createCampaign(
        "Test",
        "Desc",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      const receipt = await tx.wait();
      const campaignId = receipt.logs[0].args.id;

      await crowdfunding.connect(contributor1).fund(campaignId, [], {
        value: ethers.parseEther("0.5"),
      });
      await crowdfunding.connect(contributor2).fund(campaignId, [], {
        value: ethers.parseEther("1"),
      });

      const contributors = await crowdfunding.getContributors(campaignId);
      expect(contributors.length).to.equal(2);
      expect(contributors[0]).to.equal(contributor1.address);
    });

    it("should get campaign count", async () => {
      await crowdfunding.createCampaign(
        "Test1",
        "Desc",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      await crowdfunding.createCampaign(
        "Test2",
        "Desc",
        "ipfs://",
        GOAL,
        MIN_CONTRIBUTION,
        MAX_CONTRIBUTION,
        DURATION,
        false,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );

      expect(await crowdfunding.campaignCount()).to.equal(2);
    });
  });
});
