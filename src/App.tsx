import { useEffect, useState } from 'react'
import './App.css'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Departments from './pages/Departments'
import Faculties from './pages/Faculties'
import Levels from './pages/Levels'
import Login from './pages/Login'
import Users from './pages/Users'
import Upload from './pages/Upload'
import { useAuthStore } from './store/authStore'
import { useDepartmentStore } from './store/departmentStore'
import { useDocumentStore } from './store/documentStore'
import { useFacultyStore } from './store/facultyStore'
import { useLevelStore } from './store/levelStore'
import { useUserStore } from './store/userStore'

type AppView = 'dashboard' | 'upload' | 'users' | 'faculties' | 'departments' | 'levels'

function getRoleLabel(role: string | null): string {
  if (!role) {
    return 'Unknown'
  }

  return role === 'FacultyOfficer' ? 'Faculty Officer' : role
}

function getDashboardHeading(role: string | null): string {
  if (role === 'Admin') {
    return 'Admin Dashboard'
  }

  return `${getRoleLabel(role)} Dashboard`
}

function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard')

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const authErrorMessage = useAuthStore((state) => state.errorMessage)
  const user = useAuthStore((state) => state.user)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  const documents = useDocumentStore((state) => state.documents)
  const isFetching = useDocumentStore((state) => state.isFetching)
  const isUploading = useDocumentStore((state) => state.isUploading)
  const documentErrorMessage = useDocumentStore((state) => state.errorMessage)
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments)
  const uploadDocument = useDocumentStore((state) => state.uploadDocument)

  const users = useUserStore((state) => state.users)
  const isUsersFetching = useUserStore((state) => state.isFetching)
  const isUsersCreating = useUserStore((state) => state.isCreating)
  const usersErrorMessage = useUserStore((state) => state.errorMessage)
  const fetchUsers = useUserStore((state) => state.fetchUsers)
  const createUser = useUserStore((state) => state.createUser)

  const faculties = useFacultyStore((state) => state.faculties)
  const isFacultyFetching = useFacultyStore((state) => state.isFetching)
  const isFacultyCreating = useFacultyStore((state) => state.isCreating)
  const facultyErrorMessage = useFacultyStore((state) => state.errorMessage)
  const fetchFaculties = useFacultyStore((state) => state.fetchFaculties)
  const createFaculty = useFacultyStore((state) => state.createFaculty)

  const departments = useDepartmentStore((state) => state.departments)
  const isDepartmentFetching = useDepartmentStore((state) => state.isFetching)
  const isDepartmentCreating = useDepartmentStore((state) => state.isCreating)
  const departmentErrorMessage = useDepartmentStore((state) => state.errorMessage)
  const fetchDepartments = useDepartmentStore((state) => state.fetchDepartments)
  const createDepartment = useDepartmentStore((state) => state.createDepartment)

  const levels = useLevelStore((state) => state.levels)
  const isLevelFetching = useLevelStore((state) => state.isFetching)
  const isLevelCreating = useLevelStore((state) => state.isCreating)
  const levelErrorMessage = useLevelStore((state) => state.errorMessage)
  const fetchLevels = useLevelStore((state) => state.fetchLevels)
  const createLevel = useLevelStore((state) => state.createLevel)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchDocuments()
    }
  }, [isAuthenticated, fetchDocuments])

  useEffect(() => {
    if (isAuthenticated && user.role === 'Admin') {
      void fetchUsers()
      void fetchFaculties()
      void fetchDepartments()
      void fetchLevels()
    }
  }, [isAuthenticated, fetchUsers, fetchFaculties, fetchDepartments, fetchLevels, user.role])

  if (!isAuthenticated) {
    return <Login isLoading={isAuthLoading} errorMessage={authErrorMessage} onLogin={login} />
  }

  const canUploadDocuments = user.role === 'Student'
  const canManageUsers = user.role === 'Admin' || user.role === 'Dean' || user.role === 'FacultyOfficer' || user.role === 'HOD'
  const canManageFaculties = user.role === 'Admin'
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', visible: true },
    { key: 'upload', label: 'Upload', visible: canUploadDocuments },
    { key: 'users', label: 'Users', visible: canManageUsers },
    { key: 'faculties', label: 'Faculties', visible: canManageFaculties },
    { key: 'departments', label: 'Departments', visible: canManageFaculties },
    { key: 'levels', label: 'Levels', visible: canManageFaculties },
  ]

  return (
    <DashboardLayout
      heading={getDashboardHeading(user.role)}
      subheading="Secure role-based records, provisioning, and document workflow"
      roleLabel={getRoleLabel(user.role)}
      onLogout={logout}
      navItems={navItems}
      activeView={activeView}
      onNavigate={(view) => setActiveView(view as AppView)}
    >
      {activeView === 'dashboard' ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => void fetchDocuments()}
            disabled={isFetching}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isFetching ? 'Refreshing...' : 'Refresh Accessible Documents'}
          </button>
          {documentErrorMessage ? (
            <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{documentErrorMessage}</p>
          ) : null}
          <Dashboard role={user.role} documents={documents} />
        </div>
      ) : activeView === 'upload' && canUploadDocuments ? (
        <Upload
          documents={documents}
          isFetching={isFetching}
          isUploading={isUploading}
          errorMessage={documentErrorMessage}
          onRefresh={fetchDocuments}
          onUpload={uploadDocument}
        />
      ) : activeView === 'users' ? (
        <Users
          currentRole={user.role}
          users={users}
          faculties={faculties}
          departments={departments}
          levels={levels}
          isFetching={isUsersFetching}
          isCreating={isUsersCreating}
          errorMessage={usersErrorMessage}
          canManageUsers={canManageUsers}
          onRefresh={fetchUsers}
          onCreateUser={createUser}
        />
      ) : activeView === 'faculties' ? (
        <Faculties
          faculties={faculties}
          isFetching={isFacultyFetching}
          isCreating={isFacultyCreating}
          errorMessage={facultyErrorMessage}
          onRefresh={fetchFaculties}
          onCreateFaculty={createFaculty}
        />
      ) : activeView === 'departments' ? (
        <Departments
          departments={departments}
          faculties={faculties}
          isFetching={isDepartmentFetching}
          isCreating={isDepartmentCreating}
          errorMessage={departmentErrorMessage}
          onRefresh={fetchDepartments}
          onCreateDepartment={createDepartment}
        />
      ) : (
        <Levels
          levels={levels}
          departments={departments}
          isFetching={isLevelFetching}
          isCreating={isLevelCreating}
          errorMessage={levelErrorMessage}
          onRefresh={fetchLevels}
          onCreateLevel={createLevel}
        />
      )}
    </DashboardLayout>
  )
}

export default App
