import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import './AISuggestions.css';
import { useAuth } from '../context/AuthContext';

function AISuggestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams();
  
  const authInfo = useAuth(); 
  const userId = authInfo.currentUser?.uid;

  const [team, setTeam] = useState(location.state?.team || null);
  const [loading, setLoading] = useState(!location.state?.team);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filterMemberId = location.state?.filterMemberId || null;

  const [memberSearchQueries, setMemberSearchQueries] = useState({});
  const [memberSearchResults, setMemberSearchResults] = useState({});
  const [memberCourses, setMemberCourses] = useState({});
  const [memberSuggestions, setMemberSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});

  useEffect(() => {
    if (team) return;

    let isCancelled = false;
    const fetchTeam = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teams');
        const teams = await response.json();
        const matchedTeam = Array.isArray(teams)
          ? teams.find((t) => t._id === teamId)
          : null;

        if (!isCancelled) setTeam(matchedTeam || null);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchTeam();
    return () => { isCancelled = true; };
  }, [team, teamId]);

  const allMembers = useMemo(() => {
    if (!Array.isArray(team?.member_ids)) return [];

    return team.member_ids.map((member, index) => {
      if (typeof member === 'object' && member !== null) {
        return {
          id: member._id || `${index}`,
          name: member.name || member.email || 'Unnamed member',
          role: member.role || 'employee',
        };
      }
      return { id: `${member}-${index}`, name: `Member ID: ${member}`, role: 'employee' };
    });
  }, [team]);

  const displayedMembers = useMemo(() => {
    if (!filterMemberId) return allMembers;
    return allMembers.filter((m) => m.id === filterMemberId);
  }, [allMembers, filterMemberId]);

  // Buscar sugestões AI para cada membro
  useEffect(() => {
    if (displayedMembers.length === 0) return;

    displayedMembers.forEach(async (member) => {
      setLoadingSuggestions(prev => ({ ...prev, [member.id]: true }));
      try {
        const response = await fetch(`http://localhost:5000/api/ai/suggestions/${member.id}`, {
          method: 'POST',
        });
        const data = await response.json();
        const suggestions = data.suggestions || [];

        setMemberSuggestions(prev => ({ ...prev, [member.id]: suggestions }));
        setMemberCourses(prev => ({ ...prev, [member.id]: suggestions.map(c => ({ ...c })) }));
      } catch (err) {
        console.error(`Failed to fetch AI suggestions for ${member.name}:`, err);
        setMemberSuggestions(prev => ({ ...prev, [member.id]: [] }));
        setMemberCourses(prev => ({ ...prev, [member.id]: [] }));
      } finally {
        setLoadingSuggestions(prev => ({ ...prev, [member.id]: false }));
      }
    });
  }, [displayedMembers.length]);

  // Search — usa data.courses conforme aviso do CTO
  const handleSearch = async (memberId, query) => {
    setMemberSearchQueries((prev) => ({ ...prev, [memberId]: query }));
    
    if (query.trim().length < 2) {
      setMemberSearchResults((prev) => ({ ...prev, [memberId]: [] }));
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId, 
          search: query.trim(),
          filters: { order: { start_date: 1 } }
        }),
      });

      const data = await response.json();

      setMemberSearchResults((prev) => ({ ...prev, [memberId]: data.courses || [] }));

    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const addCourse = (memberId, course) => {
    setMemberCourses((prev) => {
      const courseId = course.id || course._id;
      const already = prev[memberId]?.some((c) => (c.id || c._id) === courseId);
      if (already) return prev;
      return {
        ...prev,
        [memberId]: [...(prev[memberId] || []), course],
      };
    });
    setMemberSearchQueries(prev => ({ ...prev, [memberId]: '' }));
    setMemberSearchResults(prev => ({ ...prev, [memberId]: [] }));
  };

  const removeCourse = (memberId, courseId) => {
    setMemberCourses((prev) => ({
      ...prev,
      [memberId]: prev[memberId].filter((c) => (c.id || c._id) !== courseId),
    }));
  };

  const handleConfirmPlan = async () => {
    if (!userId) return alert("User not authenticated.");
    setIsSubmitting(true);

    try {
      const enrollmentPayload = displayedMembers.map(member => ({
        memberId: member.id,
        courses: (memberCourses[member.id] || []).map(c => c._id || c.id)
      }));

      const response = await fetch('http://localhost:5000/api/enrollments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: userId,
          teamId: teamId,
          enrollments: enrollmentPayload
        }),
      });

      if (response.ok) {
        alert("Plan confirmed and members enrolled!");
        navigate(`/my-team/${teamId}`);
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to confirm plan");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabel = (type) => {
    const map = { technical: 'Technical', soft_skill: 'Soft Skill', compliance: 'Compliance' };
    return map[type] || type;
  };

  return (
    <>
      <Header />
      <div className="ai-suggestions-page">
        <div className="ai-suggestions-wrapper">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <h1 className="ai-suggestions-title">
            AI Course Plan
            {filterMemberId ? ' — Individual' : ' — Full Team'}
          </h1>

          {team && (
            <p className="ai-suggestions-subtitle">
              {team.name} · {displayedMembers.length} member{displayedMembers.length !== 1 ? 's' : ''}
            </p>
          )}

          {loading ? (
            <p className="ai-suggestions-state">Loading...</p>
          ) : !team ? (
            <p className="ai-suggestions-state">Team not found.</p>
          ) : displayedMembers.length === 0 ? (
            <p className="ai-suggestions-state">No members to display.</p>
          ) : (
            <div className="members-suggestions-list">
              {displayedMembers.map((member) => (
                <div key={member.id} className="member-suggestion-card">
                  <div className="member-suggestion-header">
                    <div className="member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="member-suggestion-name">{member.name}</h2>
                      <span className="member-suggestion-role">{member.role}</span>
                    </div>
                  </div>

                  <h3 className="suggested-courses-title">Suggested Courses</h3>

                  {loadingSuggestions[member.id] ? (
                    <p className="ai-suggestions-state">Generating AI suggestions...</p>
                  ) : !memberCourses[member.id] || memberCourses[member.id].length === 0 ? (
                    <p className="no-courses-state">No courses in plan.</p>
                  ) : (
                    <div className="courses-list">
                      {memberCourses[member.id].map((course) => (
                        <div key={course.id || course._id} className="course-chip">
                          <div className="course-chip-info">
                            <span className="course-chip-title">{course.title}</span>
                            <span className="course-chip-meta">
                              {typeLabel(course.type)} · {course.duration_hours}h · {course.format}
                            </span>
                          </div>
                          <button
                            className="course-remove-btn"
                            onClick={() => removeCourse(member.id, course.id || course._id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="add-course-section">
                    <p className="add-course-label">Search and add a course:</p>
                    
                    <div className="search-course-container">
                      <input 
                        type="text"
                        className="search-course-input"
                        placeholder="Search by name..."
                        value={memberSearchQueries[member.id] || ''}
                        onChange={(e) => handleSearch(member.id, e.target.value)}
                      />

                      {memberSearchResults[member.id]?.length > 0 && (
                        <div className="search-results-dropdown">
                          {memberSearchResults[member.id].map((course) => (
                            <button
                              key={course._id}
                              className="search-result-item"
                              onClick={() => addCourse(member.id, course)}
                            >
                              <strong>{course.title}</strong>
                              <span>{typeLabel(course.type)} · {course.duration_hours}h</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Suggestions com cursos reais da AI */}
                    {memberSuggestions[member.id]?.length > 0 && (
                      <>
                        <p className="add-course-label" style={{marginTop: '15px'}}>Quick Suggestions:</p>
                        <div className="add-course-options">
                          {memberSuggestions[member.id].filter(
                            (c) => !memberCourses[member.id]?.some((mc) => (mc.id || mc._id) === (c.id || c._id))
                          ).map((course) => (
                            <button
                              key={course._id}
                              className="add-course-btn"
                              onClick={() => addCourse(member.id, course)}
                            >
                              + {course.title}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && team && displayedMembers.length > 0 && (
            <div className="confirm-plan-bar">
              <button 
                className="confirm-plan-button" 
                onClick={handleConfirmPlan}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enrolling...' : '✓ Confirm Plan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AISuggestions;