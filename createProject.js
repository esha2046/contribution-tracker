import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [signer] = await ethers.getSigners();
  const contractAddress = "0xcdd47b8Be84eC81bF58A385D6F07D1F32291a972";
  
  const contract = await ethers.getContractAt(
    "ContributionTracker",
    contractAddress,
    signer
  );

  console.log("Creating project...");
  const tx = await contract.createProject(
    "Blockchain Tracker", 
    [signer.address]  // Add yourself as a member
  );
  
  await tx.wait();
  console.log("✅ Project created!");
  console.log("TX Hash:", tx.hash);
  
  // Get the project ID
  const projectCount = await contract.projectCount();
  console.log("Project ID:", projectCount.toString());
}

main().catch(console.error);
