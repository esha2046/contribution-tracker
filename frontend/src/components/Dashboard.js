import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { CONTRIBUTION_TYPES } from '../utils/constants';
import './Dashboard.css';

export const Dashboard = () => {
  const { account, isConnected } = useWeb3();
  const { getUserContributions, getLeaderboard, loading } = useContract();
  const [contributions, setContributions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userScore, setUserScore] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [contributionStats, setContributionStats] = useState({});

  useEffect(() => {
    if (!isConnected || !account) return;

    const fetchData = async () => {
      try {
        const userContribs = await getUserContributions(account);
        setContributions(userContribs);

        const totalScore = userContribs.reduce(
          (sum, contrib) => sum + parseInt(contrib.points),
          0
        );
        setUserScore(totalScore);

        // Calculate contribution type stats
        const stats = {};
        userContribs.forEach((contrib) => {
          const type = CONTRIBUTION_TYPES[contrib.contribType] || 'Unknown';
          stats[type] = (stats[type] || 0) + 1;
        });
        setContributionStats(stats);

        // Get user rank
        try {
          const lb = await getLeaderboard();
          const rank = lb.findIndex((entry) => entry.address.toLowerCase() === account.toLowerCase()) + 1;
          setUserRank(rank);
          setLeaderboard(lb);
        } catch (err) {
          console.error('Error fetching leaderboard:', err);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [account, isConnected, getUserContributions, getLeaderboard]);

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="not-connected">
          <h2>⚠️ Wallet Not Connected</h2>
          <p>Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Your contribution progress at a glance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-label">Total Points</div>
            <div className="stat-value">{userScore}</div>
          </div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Contributions</div>
            <div className="stat-value">{contributions.length}</div>
          </div>
        </div>
        <div className="stat-card stat-tertiary">
          <div className="stat-icon">🎖️</div>
          <div className="stat-content">
            <div className="stat-label">Leaderboard Rank</div>
            <div className="stat-value">#{userRank || '-'}</div>
          </div>
        </div>
        <div className="stat-card stat-accent">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-label">Wallet</div>
            <div className="stat-value address">{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</div>
          </div>
        </div>
      </div>

      {Object.keys(contributionStats).length > 0 && (
        <div className="stats-breakdown">
          <h3>Contribution Breakdown</h3>
          <div className="breakdown-grid">
            {Object.entries(contributionStats).map(([type, count]) => (
              <div key={type} className="breakdown-item">
                <div className="breakdown-label">{type}</div>
                <div className="breakdown-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="contributions-section">
        <div className="section-header">
          <h2>Recent Contributions</h2>
          <span className="count-badge">{contributions.length}</span>
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your contributions...</p>
          </div>
        ) : contributions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>No contributions yet. Start contributing to the project!</p>
          </div>
        ) : (
          <div className="contributions-list">
            {contributions.map((contrib, index) => (
              <div key={contrib.id || index} className="contribution-card">
                <div className="contrib-left">
                  <div className={`contrib-type type-${contrib.contribType}`}>
                    {CONTRIBUTION_TYPES[contrib.contribType]?.substring(0, 3) || 'N/A'}
                  </div>
                </div>
                <div className="contrib-middle">
                  <h3 className="task-title">{contrib.taskTitle}</h3>
                  <div className="contrib-meta">
                    <span className="timestamp">
                      📅 {contrib.timestamp?.toLocaleDateString?.() || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="contrib-right">
                  <div className="points-badge">+{contrib.points}</div>
                  {contrib.disputed && <div className="disputed-badge">Disputed</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="leaderboard-preview">
          <div className="section-header">
            <h2>Top Contributors</h2>
          </div>
          <div className="leaderboard-list">
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div key={index} className={`leaderboard-item ${index === userRank - 1 ? 'highlight' : ''}`}>
                <div className="rank-badge">#{index + 1}</div>
                <div className="entry-address">{`${entry.address.substring(0, 10)}...${entry.address.substring(entry.address.length - 4)}`}</div>
                <div className="entry-score">{entry.score} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
