import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import CreateUser from './components/CreateUser';
import UserList from './components/UserList';

import AddManagerToTeam from './components/AddManagerToTeam';
import CreateTeam from './components/CreateTeam';
import MyTeams from './components/MyTeams';
import MyTrainings from './components/MyTrainings';
import CourseList from './components/CourseList';
import HRDashboard from './components/HrDashBoard';
import ImageTest from './components/ImageTest';
import HREmployeesPage from './components/HREmployeesPage';
import EditUser from './components/EditUser';
import MyTeam from './components/MyTeam';
import MyTeamManagement from './components/MyTeamManagement';
import AISuggestions from './components/AISuggestions';
import EmployeeDashboard from './components/EmployeeDashboard';
import Profile from './components/Profile';
import HRTeamsPage from './components/HRTeamsPage';
import HRManagersPage from './components/HRManagersPage';
import Training from './components/Training';
import ManageCareerPath from './components/ManageCareerPath';
import HREditTeamPage from './components/HREditTeamPage';
import ManageCourses from './components/ManageCourses';
import './assets/CSS-STYLE-GUIDE.css';


const Dashboard = () => {
  const [backendMessage, setBackendMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:5000/api/status')
      .then((response) => response.json())
      .then((data) => {
        setBackendMessage(data.message);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setBackendMessage("Failed to connect to backend.");
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>My Dockerized Project</h1>
      <div style={{ padding: '1rem', border: '2px solid #4CAF50', borderRadius: '8px' }}>
        <h3>Backend Status:</h3>
        <p><strong>{backendMessage}</strong></p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/*<Route path="/employee-dashboard" element={<EmployeeDashboard />} />*/}
             
          <Route path="/admin/manage-users" element={<UserList />} />


          {/* HR routes with ProtectedRoute */}
          <Route
            path="/hr-dashboard"
            element={
                <HRDashboard />
            }
          />
          
          <Route
            path="/hr-employees"
            element={
              <ProtectedRoute>
                <HREmployeesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr-teams"
            element={
              <ProtectedRoute>

                <HRTeamsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr/edit-team/:teamId"
            element={
              <ProtectedRoute>
                <HREditTeamPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr-managers"
            element={
              <ProtectedRoute>

                <HRManagersPage />
              </ProtectedRoute>
            }
          />

          {/*
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />*/}

          {/* Admin routes */}
          <Route
            path="/admin/create-user"
            element={
                <CreateUser />
            }
          />

          {}
          <Route
            path="/admin/manage-job-description"
            element={
                <ManageCareerPath />
            }
          />
          
          <Route
            path="/admin/edit-user/:userId"
            element={
              <ProtectedRoute>
                <EditUser />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/create-team"
            element={
              <ProtectedRoute>
                <CreateTeam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-manager-to-team"
            element={
              <ProtectedRoute>
                <AddManagerToTeam />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/ai-suggestions/:teamId"
            element={
              <ProtectedRoute>
                <AISuggestions />
              </ProtectedRoute>
            }
          />

          {/* Team routes */}
          <Route
            path="/my-teams"
            element={
              <ProtectedRoute>
                <MyTeams />
              </ProtectedRoute>
            }
          />
          <Route path="/my-trainings" element={<MyTrainings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          
          <Route
            path="/my-team/:teamId"
            element={
              <ProtectedRoute>
                <MyTeam />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-team-management/:teamId"
            element={
              <ProtectedRoute>
                <MyTeamManagement />
              </ProtectedRoute>
            }
          />

          {/* Training routes */}
          <Route
            path="/my-trainings"
            element={
              <ProtectedRoute>
                <MyTrainings />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/training/:courseId" 
            element={
              /*<ProtectedRoute>*/
                <Training />
              /*</ProtectedRoute>*/
            } 
          />

          <Route
            path="/course-list" 
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/manage-courses" 
            element={
              <ProtectedRoute>
                <ManageCourses />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/image-test"
            element={
              <ProtectedRoute>
                <ImageTest />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
