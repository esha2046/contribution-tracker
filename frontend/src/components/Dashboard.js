import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { CONTRIBUTION_TYPES } from '../utils/constants';
import FileUpload from './FileUpload';
import './Dashboard.css';

export const Dashboard = () => {
  const { account, isConnected } = useWeb3();
  const { getUserContributions, getLeaderboard, submitContribution, createProject, getAllProjects, getAllDisputes, raiseDispute, loading } = useContract();
  const [contributions, setContributions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userScore, setUserScore] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [contributionStats, setContributionStats] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [disputes, setDisputes] = useState([]);

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

        // Get projects
        const allProjects = await getAllProjects();
        setProjects(allProjects);

        // Get disputes
        try {
          const allDisputes = await getAllDisputes();
          console.log('Disputes fetched:', allDisputes);
          setDisputes(allDisputes);
        } catch (err) {
          console.error('Error fetching disputes:', err);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [account, isConnected, getUserContributions, getLeaderboard, getAllProjects, getAllDisputes]);

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

  const handleFileUpload = (fileData) => {
    setUploadedFile(fileData);
    console.log('File uploaded:', fileData);
  };

  const handleRaiseDispute = async (contributionId) => {
    const reason = prompt('Enter reason for dispute:');
    if (!reason) return;

    try {
      setSubmitting(true);
      await raiseDispute(contributionId, reason);
      setSubmitMessage({ type: 'success', text: 'Dispute raised successfully!' });
      
      // Refresh disputes after 2 seconds
      setTimeout(async () => {
        const allDisputes = await getAllDisputes();
        setDisputes(allDisputes);
      }, 2000);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: 'Failed to raise dispute: ' + err.message });
      console.error('Error raising dispute:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitContribution = async () => {
    if (!uploadedFile || !formData.projectId || !formData.description) {
      setSubmitMessage({ type: 'error', text: 'Please fill all fields and upload a file' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      // contribType defaults to 0 (can be adjusted based on your enum)
      await submitContribution(
        formData.projectId,
        formData.description,
        0, // contribType
        uploadedFile.ipfsCID,
        uploadedFile.fileHash
      );

      setSubmitMessage({
        type: 'success',
        text: 'Contribution submitted successfully!',
      });

      // Reset form
      setUploadedFile(null);
      setFormData({ projectId: '', description: '' });
      setShowSubmitForm(false);

      // Wait for transaction to be mined, then refresh contributions
      setTimeout(async () => {
        const userContribs = await getUserContributions(account);
        setContributions(userContribs);
      }, 2000);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: `Failed to submit: ${error.message}`,
      });
      console.error('Error submitting contribution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setSubmitMessage({ type: 'error', text: 'Project name cannot be empty' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      await createProject(projectName, [account]);
      setSubmitMessage({
        type: 'success',
        text: `Project "${projectName}" created successfully!`,
      });

      setProjectName('');
      setShowCreateProject(false);

      // Wait a moment for the transaction to be mined, then refresh
      setTimeout(async () => {
        const allProjects = await getAllProjects();
        setProjects(allProjects);
      }, 2000);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: `Failed to create project: ${error.message}`,
      });
      console.error('Error creating project:', error);
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="projects-section">
        <div className="section-header">
          <h2>Projects</h2>
          <button
            className="toggle-button"
            onClick={() => setShowCreateProject(!showCreateProject)}
          >
            {showCreateProject ? '▼ Cancel' : '+ Create'}
          </button>
        </div>

        {showCreateProject && (
          <div className="create-project-form">
            {submitMessage && (
              <div className={`submit-message ${submitMessage.type}`}>
                {submitMessage.text}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                id="projectName"
                type="text"
                placeholder="Enter project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <button
              className="submit-button"
              onClick={handleCreateProject}
              disabled={submitting || !projectName.trim()}
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        )}

        {projects.length > 0 ? (
          <div className="projects-list">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p className="project-id">ID: {project.id}</p>
                </div>
                <div className="project-status">
                  {project.isActive ? (
                    <span className="badge active">Active</span>
                  ) : (
                    <span className="badge inactive">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No projects yet. Create one to get started!</p>
          </div>
        )}
      </div>

      <div className="submit-contribution-section">
        <div className="section-header">
          <h2>Submit New Contribution</h2>
          <button
            className="toggle-button"
            onClick={() => setShowSubmitForm(!showSubmitForm)}
          >
            {showSubmitForm ? '▼ Hide' : '▶ Show'}
          </button>
        </div>

        {showSubmitForm && (
          <div className="submit-form">
            {submitMessage && (
              <div className={`submit-message ${submitMessage.type}`}>
                {submitMessage.text}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="projectId">Project ID</label>
              <input
                id="projectId"
                type="text"
                placeholder="Enter project ID"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Contribution Description</label>
              <textarea
                id="description"
                placeholder="Describe your contribution..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={submitting}
                rows="3"
              />
            </div>

            <FileUpload onFileUpload={handleFileUpload} disabled={submitting} />

            {uploadedFile && (
              <div className="upload-success">
                <div className="success-icon">✓</div>
                <p>
                  <strong>File uploaded to IPFS!</strong>
                </p>
                <p className="ipfs-hash">CID: {uploadedFile.ipfsCID}</p>
                <p className="file-hash">
                  Hash: {uploadedFile.fileHash.substring(0, 20)}...
                </p>

                <button
                  className="submit-button"
                  onClick={handleSubmitContribution}
                  disabled={submitting || !formData.projectId || !formData.description}
                >
                  {submitting ? 'Submitting...' : 'Submit to Smart Contract'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
                  {contrib.disputed ? (
                    <div className="disputed-badge">Disputed</div>
                  ) : (
                    <button 
                      className="dispute-btn"
                      onClick={() => handleRaiseDispute(contrib.id)}
                      disabled={submitting}
                      title="Raise a dispute for this contribution"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {disputes.length > 0 && (
        <div className="disputes-section">
          <div className="section-header">
            <h2>Active Disputes</h2>
            <span className="count-badge">{disputes.filter(d => !d.resolved).length}</span>
          </div>
          <div className="disputes-list">
            {disputes.map((dispute) => (
              <div key={dispute.id} className={`dispute-card ${dispute.resolved ? 'resolved' : 'active'}`}>
                <div className="dispute-header">
                  <div className="dispute-id">Dispute #{dispute.id}</div>
                  <div className={`dispute-status ${dispute.resolved ? 'resolved' : 'pending'}`}>
                    {dispute.resolved ? '✓ Resolved' : '⚠️ Pending'}
                  </div>
                </div>
                <div className="dispute-content">
                  <p><strong>Contribution:</strong> {dispute.taskTitle}</p>
                  <p><strong>Raised by:</strong> {`${dispute.raisedBy.substring(0, 10)}...`}</p>
                  <p><strong>Reason:</strong> {dispute.reason}</p>
                  {dispute.resolutionReason && (
                    <p><strong>Resolution:</strong> {dispute.resolutionReason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
