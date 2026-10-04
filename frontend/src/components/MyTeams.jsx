import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import './MyTeams.css';

const colors = ['#00BCD4', '#4CAF50', '#FF6B6B', '#FF9800', '#FFEB3B', '#9C27B0', '#2196F3', '#E91E63'];

function MyTeams() {
	const { mongoUser } = useAuth();
	const navigate = useNavigate();
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (mongoUser?._id) {
			fetch(`http://localhost:5000/api/teams/${mongoUser._id}`)
				.then(res => res.json())
				.then(data => {
					setTeams(data);
					setLoading(false);
				})
				.catch(err => {
					console.error('Error fetching teams:', err);
					setLoading(false);
				});
		}
	}, [mongoUser]);

	const getColorForTeam = (index) => colors[index % colors.length];
	const getFirstLetter = (name) => name?.charAt(0).toUpperCase() || '?';

	const goToMyTeam = (team) => {
		navigate(`/my-team/${team._id}`);
	};

	return (
		<>
			<Header />
			<div className="page-container">
				<div className="content-wrapper">
					<h1 className="title">My Teams</h1>
					
					{loading ? (
						<p className="loading-text">Loading teams...</p>
					) : teams.length === 0 ? (
						<p className="empty-text">No teams found.</p>
					) : (
						<div className="teams-list">
							{teams.map((team, index) => (
								<div 
									key={team._id} 
									className="team-card" 
									onClick={() => goToMyTeam(team)}
								>
									<div 
										className="avatar"
										style={{
											backgroundColor: getColorForTeam(index)
										}}
									>
										<span className="avatar-text">
											{getFirstLetter(team.name)}
										</span>
									</div>
									
									<div className="team-info">
										<h3 className="team-name">{team.name}</h3>
										<p className="member-count">
											{team.member_ids?.length || 0} members
										</p>
									</div>

									
									<div className="arrow">›</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default MyTeams;
