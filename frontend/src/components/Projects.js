import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { MemberManagement } from './MemberManagement';
import './Projects.css';

export const Projects = () => {
  const { isConnected, account } = useWeb3();
  const { getAllProjects, getLeaderboard, loading } = useContract();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const proj = await getAllProjects();
        setProjects(proj);
        setFilteredProjects(proj);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, [getAllProjects]);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) =>
        filterStatus === 'active' ? p.isActive : !p.isActive
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filterStatus]);

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
    setLoadingLeaderboard(true);
    try {
      const lb = await getLeaderboard(projectId);
      setLeaderboard(lb);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleOpenMemberModal = (projectId, event) => {
    event.stopPropagation();
    setSelectedProjectForMembers(projectId);
    setShowMemberModal(true);
  };

  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
    setSelectedProjectForMembers(null);
  };

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  if (!isConnected) {
    return (
      <div className="projects-container">
        <div className="not-connected">
          <h2>⚠️ Wallet Not Connected</h2>
          <p>Please connect your wallet to view projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects & Leaderboards</h1>
        <p className="subtitle">Explore projects and see top contributors</p>
      </div>

      <div className="projects-content">
        <div className="projects-list">
          <div className="projects-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All Projects
              </button>
              <button
                className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                🟢 Active
              </button>
              <button
                className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                onClick={() => setFilterStatus('inactive')}
              >
                ⚫ Inactive
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p>{searchTerm ? 'No projects match your search.' : 'No projects found.'}</p>
            </div>
          ) : (
            <div className="project-cards">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`project-card ${selectedProject === project.id ? 'active' : ''}`}
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <div className="project-rank">#{index + 1}</div>
                  <div className="project-header">
                    <h3 className="project-name">{project.name}</h3>
                    <div className={`project-status ${project.isActive ? 'active' : 'inactive'}`}>
                      {project.isActive ? '🟢 Active' : '⚫ Inactive'}
                    </div>
                  </div>
                  <div className="project-admin">👤 Admin: {formatAddress(project.admin)}</div>
                  {account && account.toLowerCase() === project.admin.toLowerCase() && (
                    <button
                      className="manage-members-btn"
                      onClick={(e) => handleOpenMemberModal(project.id, e)}
                      title="Manage project members"
                    >
                      👥 Manage Members
                    </button>
                  )}
                  <div className="project-footer">
                    <span className="click-hint">Click to view leaderboard →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showMemberModal && selectedProjectForMembers !== null && (
          <MemberManagement
            projectId={selectedProjectForMembers}
            projectAdmin={projects.find(p => p.id.toString() === selectedProjectForMembers.toString())?.admin}
            onClose={handleCloseMemberModal}
            onSuccess={() => {
              // Refresh projects to show updated member list
              const fetchProjects = async () => {
                try {
                  const proj = await getAllProjects();
                  setProjects(proj);
                  setFilteredProjects(proj);
                } catch (err) {
                  console.error('Error refreshing projects:', err);
                }
              };
              fetchProjects();
            }}
          />
        )}

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h2>Leaderboard</h2>
          </div>
          {selectedProject === null ? (
            <div className="empty-state">
              <div className="empty-icon">🏆</div>
              <p>Select a project to view its leaderboard</p>
            </div>
          ) : loadingLeaderboard ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No contributions in this project yet.</p>
            </div>
          ) : (
            <div className="leaderboard">
              {leaderboard.map((entry, index) => (
                <div key={entry.address} className={`leaderboard-entry ${index === 0 ? 'first' : ''} ${index === 1 ? 'second' : ''} ${index === 2 ? 'third' : ''}`}>
                  <div className="rank-medal">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="entry-address">{formatAddress(entry.address)}</div>
                  <div className="entry-score">{entry.score} pts</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
