import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from '@/app/HomePage'
import { ProtectedLayout } from '@/app/ProtectedLayout'
import { AccountPage } from '@/features/auth/AccountPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { EditorPage } from '@/features/editor/EditorPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/resumes/:id', element: <EditorPage /> },
    ],
  },
])
