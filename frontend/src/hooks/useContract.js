import { useState, useCallback } from 'react';
import { useWeb3 } from './useWeb3';

export const useContract = () => {
  const { contract } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all projects
  const getAllProjects = useCallback(async () => {
    if (!contract) return [];
    setLoading(true);
    setError(null);
    try {
      const count = await contract.projectCount();
      const projects = [];
      for (let i = 1; i <= count; i++) {
        const project = await contract.projects(i);
        projects.push({
          id: project.id.toString(),
          name: project.name,
          admin: project.admin,
          isActive: project.isActive,
        });
      }
      return projects;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Get project contributions
  const getProjectContributions = useCallback(
    async (projectId) => {
      if (!contract) return [];
      setLoading(true);
      setError(null);
      try {
        const count = await contract.contributionCount();
        const contributions = [];
        for (let i = 1; i <= count; i++) {
          const contrib = await contract.contributions(i);
          if (contrib.projectId.toString() === projectId.toString()) {
            contributions.push({
              id: contrib.id.toString(),
              projectId: contrib.projectId.toString(),
              contributor: contrib.contributor,
              taskTitle: contrib.taskTitle,
              contribType: contrib.contribType,
              ipfsCID: contrib.ipfsCID,
              fileHash: contrib.fileHash,
              timestamp: new Date(contrib.timestamp * 1000),
              points: contrib.points.toString(),
              disputed: contrib.disputed,
            });
          }
        }
        return contributions;
      } catch (err) {
        setError(err.message);
        console.error('Error fetching contributions:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  // Get user contributions
  const getUserContributions = useCallback(
    async (userAddress) => {
      if (!contract) return [];
      setLoading(true);
      setError(null);
      try {
        const count = await contract.contributionCount();
        const contributions = [];
        for (let i = 1; i <= count; i++) {
          const contrib = await contract.contributions(i);
          if (contrib.contributor.toLowerCase() === userAddress.toLowerCase()) {
            contributions.push({
              id: contrib.id.toString(),
              projectId: contrib.projectId.toString(),
              contributor: contrib.contributor,
              taskTitle: contrib.taskTitle,
              contribType: contrib.contribType,
              points: contrib.points.toString(),
              timestamp: new Date(contrib.timestamp * 1000),
              disputed: contrib.disputed,
            });
          }
        }
        return contributions;
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user contributions:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  // Get leaderboard
  const getLeaderboard = useCallback(
    async (projectId) => {
      if (!contract) return [];
      setLoading(true);
      setError(null);
      try {
        const [addresses, scores] = await contract.getLeaderboard(projectId);
        const leaderboard = addresses.map((addr, idx) => ({
          address: addr,
          score: scores[idx].toString(),
          rank: idx + 1,
        }));
        return leaderboard;
      } catch (err) {
        setError(err.message);
        console.error('Error fetching leaderboard:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  // Submit contribution
  const submitContribution = useCallback(
    async (projectId, taskTitle, contribType, ipfsCID, fileHash) => {
      if (!contract) throw new Error('Contract not initialized');
      setLoading(true);
      setError(null);
      try {
        const tx = await contract.submitContribution(
          projectId,
          taskTitle,
          contribType,
          ipfsCID,
          fileHash
        );
        await tx.wait();
        return tx.hash;
      } catch (err) {
        setError(err.message);
        console.error('Error submitting contribution:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  // Create project
  const createProject = useCallback(
    async (projectName, members) => {
      if (!contract) throw new Error('Contract not initialized');
      setLoading(true);
      setError(null);
      try {
        const tx = await contract.createProject(projectName, members);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        setError(err.message);
        console.error('Error creating project:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  return {
    getAllProjects,
    getProjectContributions,
    getUserContributions,
    getLeaderboard,
    submitContribution,
    createProject,
    loading,
    error,
  };
};
