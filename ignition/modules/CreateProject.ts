import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ContractModule = buildModule("CreateProjectModule", (m) => {
  const tracker = m.getContractAt("ContributionTracker", "0xcdd47b8Be84eC81bF58A385D6F07D1F32291a972");
  
  const createProjectTx = m.call(tracker, "createProject", [
    "Blockchain Tracker",  // project name
    ["0x22333b0ce5547bc629cf24635748170c83fc5a72"], // your wallet address as member
  ]);

  return { createProjectTx };
});

export default ContractModule;
