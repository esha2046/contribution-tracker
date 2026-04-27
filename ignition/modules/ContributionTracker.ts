import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ContributionTrackerModule = buildModule("ContributionTrackerModule", (m) => {
  const tracker = m.contract("ContributionTracker");
  return { tracker };
});

export default ContributionTrackerModule;
