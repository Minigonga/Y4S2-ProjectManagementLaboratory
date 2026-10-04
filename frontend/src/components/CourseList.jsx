import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const statusColors = {
  registered: { background: '#bcd7fa', color: '#1e40af' },
  ongoing: { background: '#fce8a0', color: '#92400e' },
  completed: { background: '#90f8b5', color: '#166534' },
  cancelled: { background: '#f8b4b4', color: '#991b1b' },
};

const CourseCard = ({ course }) => {

  const status = course.userEnrollment?.[0]?.status;

  return (
    <Link to={`/training/${course._id}`} style={{...styles.courseCard, textDecoration: 'none', color: 'inherit' }}>
      <div key={course.id}>
        {/* Image */}
        <div style={styles.imageContainer}>
          {/* Status badge */}
          
          <div style={styles.statusBadgeContainer}>
            {status && 
              <div key={course.id + status} style={{...styles.statusBadge, ...statusColors[status]}}>{status.charAt(0).toUpperCase() + status.slice(1)}</div>
            }
          </div>
          
          <img
            src={course.image_url}
            alt={course.title || 'Course image'}
            style={styles.courseImage}
          />
        </div>

        <div style={styles.courseInfo}>
          
          {/* Title */}
          <div style={styles.cardTitle}>{course.title}</div>

          <div style={{...styles.cardMeta, gap: 0}}>
            
            {/* Type metadata */}
            {course.type && (
              <div style={{
                ...styles.singleMeta,
                ...styles.cardInfoContainer,
              }}>
                <span style={{marginRight: 6, fontWeight: 600}}>Type:</span>
                <span>
                  {
                    course.type
                    .replace (/^[-_]*(.)/, (_, c) => c.toUpperCase())
                    .replace (/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())
                  }
                </span>
              </div>
            )}

            {course.format && (
              <div style={{
                ...styles.singleMeta,
                ...styles.cardInfoContainer,
              }}>
                <span style={{marginRight: 6, fontWeight: 600}}>Format:</span>
                <span>
                  {
                    course.format
                    .replace (/^[-_]*(.)/, (_, c) => c.toUpperCase())
                    .replace (/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())
                  }
                  </span>
              </div>
            )}
          </div>

          {/* Rating, duration, location, etc */}
          <div style={styles.cardMeta}>

            {course.rating != null && course.reviews!= null && (
              <div style={styles.singleMeta}>
                <span style={{...styles.metaIcon, color: '#f9a825'}}>
                  <svg className="w-[15px] h-[15px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                  </svg>
                </span>
                <span style={styles.metaText}>{course.rating} ({course.reviews} reviews)</span>
              </div>
            )}

            {course.duration_hours && (
              <div style={styles.singleMeta}>
                <span style={{...styles.metaIcon, color: '#0e4374'}}>
                  <svg className="w-[15px] h-[15px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                </span>
                <span style={styles.metaText}>{course.duration_hours || course.sessions[0]?.duration_minutes / 60}h</span>
              </div>
            )}

            <div style={styles.singleMeta}>
              <span style={{...styles.metaIcon, color: '#0e4374'}}>
                <svg className="w-[15px] h-[15px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/>
                </svg>
              </span>
              <span style={styles.metaText}>
                {course.start_date ? (
                  `${new Date(course.start_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date(course.start_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`
                ) : (
                  "No scheduled sessions"
                )}
              </span>
            </div>
          </div>
          
        </div>
        {/* Description */}
        <div style={styles.cardDesc}>{course.description}</div>
      </div>
     </Link>
  );
};

const CourseList = () => {

  const authInfo = useAuth();
  const userId = authInfo.currentUser?.uid;

  const defaultFilters = {
    status: {
      registered: false,
      ongoing: false,
      completed: false,
      cancelled: false,
    },
    type: {
      technical: false,
      compliance: false,
      'soft_skill': false,
    },
    format: 'any',
    duration: {
      min: '',
      max: '',
    },
    date: {
      from: '',
      to: '',
    },
    order: 'date_asc',
  };
  
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12; // Adjusted for a nice grid of 3 columns

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  // Build the effective filters object to send to the backend
  function buildEffectiveFilters(filters) {
    const effective = {};
    // Status (include)
    if (filters.status && Object.values(filters.status).some(v => v)) {
      effective.status = {};
      for (const key in filters.status) {
        if (filters.status[key]) effective.status[key] = true;
      }
    }

    // Type
    if (filters.type && Object.values(filters.type).some(v => v)) {
      effective.type = {};
      for (const key in filters.type) {
        if (filters.type[key]) effective.type[key] = true;
      }
    }

    effective.format = filters.format;

    // Duration
    const min = filters.duration?.min;
    const max = filters.duration?.max;
    if (min || max) {
      effective.duration = {};
      if (min) effective.duration.min = min;
      if (max) effective.duration.max = max;
    }
    // Date/time range
    if (filters.date && (filters.date.from || filters.date.to)) {
      effective.date = {};
      if (filters.date.from) effective.date.from = filters.date.from;
      if (filters.date.to) effective.date.to = filters.date.to;
    }

    switch (filters.order) {
      case 'date_asc':
        effective.order = { start_date: 1 };
        break;
      case 'date_desc':
        effective.order = { start_date: -1 };
        break;
      case 'duration_asc':
        effective.order = { duration_hours: 1 };
        break;
      case 'duration_desc':
        effective.order = { duration_hours: -1 };
        break;
      case 'rating_asc':
        effective.order = { rating: 1 };
        break;
      case 'rating_desc':
        effective.order = { rating: -1 };
        break;
    }

    return effective;
  }

  useEffect(() => {
    const effectiveFilters = buildEffectiveFilters(filters);
    fetch(`http://localhost:5000/api/courses?page=${page}&limit=${limit}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId, 
        filters: effectiveFilters, 
        search: search.trim(),
        page: page,
        limit: limit
      }),
    })
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(err => console.error("Failed to fetch courses:", err));
  }, [filters, search, page]);
    
  return (
    <>
    <Header/>

    <div style={styles.container}>
      
      <div style={styles.page}>

        <div style={styles.mainContent}>
          <div style={styles.sidebar}>
            <h2 style={{...styles.filterTitle, ...styles.filterHeader}}>Filters:</h2>

            {/* Order By Section */}
            <div style={styles.filterSection}>
              <div style={styles.filterTitle}>Order By:</div>
              <select 
                style={styles.orderSelect}
                value={filters.order}
                onChange={(e) => setFilters({...filters, order: e.target.value})}
              >
                <option value="date_asc">Date (Soonest First)</option>
                <option value="date_desc">Date (Latest First)</option>
                <option value="duration_asc">Duration (Shortest First)</option>
                <option value="duration_desc">Duration (Longest First)</option>
                <option value="rating_asc">Rating (Lowest First)</option>
                <option value="rating_desc">Rating (Highest First)</option>
              </select>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterTitle}>Status:</div>
              <div>
                <input id="status-registered" type="checkbox" checked={filters.status.registered} onChange={(e) => setFilters({...filters, status: {...filters.status, registered: e.target.checked}})}/>
                <label htmlFor="status-registered" style={{marginLeft: 6, cursor: 'pointer'}}>Registered</label>
              </div>
              <div>
                <input id="status-ongoing" type="checkbox" checked={filters.status.ongoing} onChange={(e) => setFilters({...filters, status: {...filters.status, ongoing: e.target.checked}})}/>
                <label htmlFor="status-ongoing" style={{marginLeft: 6, cursor: 'pointer'}}>Ongoing</label>
              </div>
              <div>
                <input id="status-completed" type="checkbox" checked={filters.status.completed} onChange={(e) => setFilters({...filters, status: {...filters.status, completed: e.target.checked}})}/>
                <label htmlFor="status-completed" style={{marginLeft: 6, cursor: 'pointer'}}>Completed</label>
              </div>
              <div>
                <input id="status-cancelled" type="checkbox" checked={filters.status.cancelled} onChange={(e) => setFilters({...filters, status: {...filters.status, cancelled: e.target.checked}})}/>
                <label htmlFor="status-cancelled" style={{marginLeft: 6, cursor: 'pointer'}}>Cancelled</label>
              </div>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterTitle}>Type:</div>
              <div>
                <input id="type-technical" type="checkbox" checked={filters.type.technical} onChange={(e) => setFilters({...filters, type: {...filters.type, technical: e.target.checked}})}/>
                <label htmlFor="type-technical" style={{marginLeft: 6, cursor: 'pointer'}}>Technical</label>
              </div>
              <div>
                <input id="type-compliance" type="checkbox" checked={filters.type.compliance} onChange={(e) => setFilters({...filters, type: {...filters.type, compliance: e.target.checked}})}/>
                <label htmlFor="type-compliance" style={{marginLeft: 6, cursor: 'pointer'}}>Compliance</label>
              </div>
              <div>
                <input id="type-soft_skill" type="checkbox" checked={filters.type['soft_skill']} onChange={(e) => setFilters({...filters, type: {...filters.type, 'soft_skill': e.target.checked}})}/>
                <label htmlFor="type-soft_skill" style={{marginLeft: 6, cursor: 'pointer'}}>Soft Skill</label>
              </div>
            </div>


            <div style={styles.filterSection}>
              <div style={styles.filterTitle}>Format:</div>
              <div>
                <input
                  type="radio"
                  name="format"
                  id="format-any"
                  checked={filters.format === 'any'}
                  onChange={() => setFilters(f => ({ ...f, format: 'any', location: '' }))}
                />
                <label htmlFor="format-any" style={{marginLeft: 6, cursor: 'pointer'}}>Any</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="format"
                  id="format-online"
                  checked={filters.format === 'online'}
                  onChange={() => setFilters(f => ({ ...f, format: 'online', location: '' }))}
                />
                <label htmlFor="format-online" style={{marginLeft: 6, cursor: 'pointer'}}>Online</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="format"
                  id="format-hybrid"
                  checked={filters.format === 'hybrid'}
                  onChange={() => setFilters(f => ({ ...f, format: 'hybrid', location: f.location }))}
                />
                <label htmlFor="format-hybrid" style={{marginLeft: 6, cursor: 'pointer'}}>Hybrid</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="format"
                  id="format-inperson"
                  checked={filters.format === 'in_person'}
                  onChange={() => setFilters(f => ({ ...f, format: 'in_person', location: f.location }))}
                />
                <label htmlFor="format-inperson" style={{marginLeft: 6, cursor: 'pointer'}}>In Person</label>
              </div>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterTitle}>Duration (h):</div>
              <div style={{display: 'flex', gap: 8}}>
                <input
                  type="number"
                  min="1"
                  placeholder="Min"
                  style={styles.durationInput}
                  value={filters.duration.min}
                  onChange={e => setFilters(f => ({
                    ...f,
                    duration: { ...f.duration, min: e.target.value }
                  }))}
                />
                <span>-</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Max"
                  style={styles.durationInput}
                  value={filters.duration.max}
                  onChange={e => setFilters(f => ({
                    ...f,
                    duration: { ...f.duration, max: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterTitle}>Date & Time:</div>
              <div>
                <div style={styles.datesContainer}>
                  <label htmlFor="date-from">From:</label>
                  <input
                    id="date-from"
                    type="date"
                    value={filters.date.from}
                    onChange={e => setFilters(f => ({
                      ...f,
                      date: { ...f.date, from: e.target.value }
                    }))}
                    style={styles.dateInput}
                  />
                </div>
                <div style={styles.datesContainer}>
                  <label htmlFor="date-to">To:</label>
                  <input
                    id="date-to"
                    type="date"
                    value={filters.date.to}
                    onChange={e => setFilters(f => ({
                      ...f,
                      date: { ...f.date, to: e.target.value }
                    }))}
                    style={styles.dateInput}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              style={styles.clearBtn}
              onClick={() => {
                setFilters(defaultFilters);
                setSearch('');
              }}
            >
              Reset Filters
            </button>
          </div>

          <div style={styles.coursesArea}>
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              <button style={styles.searchBtn}>
                <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="8" cy="8" r="7" stroke="#1a3976" strokeWidth="2" fill="none" /><line x1="13" y1="13" x2="17" y2="17" stroke="#1a3976" strokeWidth="2" /></svg>
              </button>
            </div>
            {courses.length === 0 ? (
              <div style={styles.noCourses}>No courses found matching your filters.</div>
            ) : (
              <>
                <div style={styles.courseGrid}>
                  {courses.map((course) => (<CourseCard key={course.id || course._id} course={course}/>))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    <button 
                      style={{...styles.pageBtn, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer'}} 
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
                    <button 
                      style={{...styles.pageBtn, opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer'}} 
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    <Footer/>
    </div>
</>
  );

};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',         
    margin: 0,              
    padding: 0,              
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: 0,
    left: 0,
    overflowX: 'hidden',
    fontFamily: 'Segoe UI, sans-serif',
  },
  page: {
    paddingTop: 16,
    background: '#f5f7fa',
    fontFamily: 'Arial, sans-serif',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: 1600,
    margin: '0 auto',
    padding: '16px 0',
    width: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: 260,
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 12px 12px rgba(0,0,0,0.20)',
    padding: 24,
    marginRight: 32,
    minHeight: 600,
    gap: 18,
    position: 'sticky',
    top: 24,
    maxHeight: 'calc(100vh - 48px)',
    overflowY: 'auto',
    zIndex: 10,
  },
  filterSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
    fontSize: 14,
  },
  filterSubsection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginLeft: 6,
    fontSize: 14,
  },
  filterTitle: {
    fontWeight: 600,
    fontSize: 17,
    marginBottom: 2,
    color: '#1a3976',
  },
  filterSubtitle: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 2,
    color: '#1a3976',
  },
  filterHeader: {
    fontWeight: 700,
    fontSize: 22,
    marginBottom: 0,
  },
  scrollBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxHeight: 160,
    width: '100%',
    overflowY: 'auto',
    borderRadius: 6,
    padding: 2,
    background: '#f8fafc',
    fontSize: 14,
  },
  durationInput: {
    width: 48,
    padding: 4,
    border: '1px solid #e0e7ef',
    borderRadius: 4,
  },
  dateInput: {
    width: 180,
    padding: '6px 10px',
    border: '1px solid #bfcbe3',
    borderRadius: 6,
    background: '#f8fafc',
    fontSize: 15,
    color: '#1a3976',
    outline: 'none',
    transition: 'border 0.2s',
    marginTop: 2,
    marginBottom: 2,
  },
  locationInput: {
    width: 120,
    padding: '3px 5px',
    border: '1px solid #bfcbe3',
    borderRadius: 6,
    background: '#f8fafc',
    fontSize: 13,
    color: '#1a3976',
    outline: 'none',
    transition: 'border 0.2s',
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 8,
  },
  clearBtn: {
    marginTop: 16,
    width: '100%',
    background: '#8b1c1c',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '10px 0',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    letterSpacing: 1,
  },
  coursesArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  coursesTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a3976',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    background: '#fff',
    border: '1px solid #e0e7ef',
    borderRadius: 6,
    width: '100%',
    marginBottom: 16,
    position: 'sticky',
    boxShadow: '0 12px 12px rgba(0,0,0,0.20)',
    top: 24,
    zIndex: 9,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: 16,
      padding: 6,
    background: 'transparent',
    width: '100%',
    marginLeft: 8,
    marginTop: 2,
    marginBottom: 2,
    color: '#000',
    backgroundColor: '#fff',
  },
  searchBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    margin: 4,
  },
  courseGrid: {
    paddingBottom: 20, // Adjusted so pagination sits right under
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
    minHeight: 0,
    overflowY: 'visible',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
  },
  courseCard: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '4px 5px 5px rgba(0,0,0,0.25)',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    minHeight: 280,
    maxHeight: 280,
    overflow: 'hidden',
    flex: '1 1 calc(33.333% - 12px)',
    maxWidth: 'calc(33.333% - 12px)',
    boxSizing: 'border-box',
  },
  courseInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
  },
  statusBadge: {
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    padding: '2px 12px',
  },
  statusBadgeContainer: {
    position: 'absolute',
    display: 'flex',
    gap: 2,
    zIndex: 2,
  },
  courseImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    objectFit: 'cover',
    background: '#e0e7ef',
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 2,
    color: '#1a3976',
  },
  cardMeta: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 16,
    flexGrow: 1,
  },
  metaIcon: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  singleMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontWeight: 500,
  },
  metaText: {
    color: '#555',
    fontSize: 13,
    display: 'flex',
    alignItems: 'flex-start',
  },
  cardDesc: {
    color: '#888',
    fontSize: 13,
    marginBottom: 0,
    textAlign: 'left',
    alignSelf: 'flex-start',
    wordBreak: 'break-word',
    lineHeight: 1.2,
  },
  noCourses: {
    width: '100%',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 30,
    color: '#555'
  },
  cardInfoContainer: {
    marginBottom: 4,
    background: '#e3e7f1',
    color: '#1a3976',
    borderRadius: 8,
    display: 'inline-block',
    padding: '2px 10px',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 0.2,
    marginRight: 8,
  },
  datesContainer: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  orderSelect: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #bfcbe3',
    borderRadius: 6,
    background: '#f8fafc',
    fontSize: 14,
    color: '#1a3976',
    outline: 'none',
    cursor: 'pointer',
    marginTop: 4,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
    paddingBottom: 40,
    width: '100%',
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: '#1a3976',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 14,
    transition: 'opacity 0.2s',
  },
  pageInfo: {
    fontWeight: 600,
    fontSize: 15,
    color: '#1a3976',
  },
};  

export default CourseList;