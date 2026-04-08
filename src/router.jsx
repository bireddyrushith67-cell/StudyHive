import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'
import { RoleRoute } from './routes/RoleRoute.jsx'
import { MainLayout } from './components/layout/MainLayout.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { UsersPage } from './pages/UsersPage.jsx'
import { SchoolsPage } from './pages/SchoolsPage.jsx'
import { ClassesPage } from './pages/ClassesPage.jsx'
import { TasksPage } from './pages/TasksPage.jsx'
import { CompetitionsPage } from './pages/CompetitionsPage.jsx'
import { LeaderboardPage } from './pages/LeaderboardPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { VideoRoomsPage } from './pages/VideoRoomsPage.jsx'
import { GeneralChatPage } from './pages/GeneralChatPage.jsx'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'classes', element: <ClassesPage /> },
          {
            element: <RoleRoute allowedRoles={['admin', 'owner', 'school_admin']} />,
            children: [{ path: 'users', element: <UsersPage /> }],
          },
          {
            element: <RoleRoute allowedRoles={['owner']} />,
            children: [{ path: 'schools', element: <SchoolsPage /> }],
          },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'competitions', element: <CompetitionsPage /> },
          { path: 'video-rooms', element: <VideoRoomsPage /> },
          { path: 'general-chat', element: <GeneralChatPage /> },
          { path: 'leaderboard', element: <LeaderboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
