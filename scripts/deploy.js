const hre = require("hardhat");

async function main() {
  console.log("部署众筹合约...");
  
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();
  
  await crowdfunding.waitForDeployment();
  const address = await crowdfunding.getAddress();
  
  console.log("合约已部署到:", address);
  
  if (hre.network.name !== "localhost") {
    console.log("验证合约...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: []
      });
      console.log("验证成功!");
    } catch (e) {
      console.log("验证失败:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
