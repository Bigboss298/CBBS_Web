import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardLayout, { type DashboardNavItem } from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Departments from './pages/Departments'
import Faculties from './pages/Faculties'
import Levels from './pages/Levels'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import PendingRegistrations from './pages/PendingRegistrations.tsx'
import Users from './pages/Users'
import Upload from './pages/Upload'
import ChangePassword from './pages/ChangePassword'
import ActivityLog from './pages/ActivityLog'
import Promotion from './pages/Promotion'
import { useAuthStore } from './store/authStore'
import { useAuditLogStore } from './store/auditLogStore'
import { useDepartmentStore } from './store/departmentStore'
import { useDocumentStore } from './store/documentStore'
import { useFacultyStore } from './store/facultyStore'
import { useLevelStore } from './store/levelStore'
import { useUserStore } from './store/userStore'
import { usePromotionStore } from './store/promotionStore'
import ProtectedRoute from './routes/ProtectedRoute.tsx'
import RoleGuard from './routes/RoleGuard.tsx'

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

function DashboardRoute() {
  const role = useAuthStore((state) => state.user.role)
  const documents = useDocumentStore((state) => state.documents)
  const isFetching = useDocumentStore((state) => state.isFetching)
  const errorMessage = useDocumentStore((state) => state.errorMessage)
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments)

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => void fetchDocuments()}
        disabled={isFetching}
        title="Refresh documents"
        className="inline-flex items-center justify-center p-0 text-3xl font-black leading-none text-blue-900 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-blue-300"
      >
        <span className={isFetching ? 'animate-spin' : ''}>⟳</span>
      </button>
      {errorMessage ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p> : null}
      <Dashboard role={role} documents={documents} />
    </div>
  )
}

function UploadRoute() {
  const isGraduated = useAuthStore((state) => state.user.isGraduated)
  const documents = useDocumentStore((state) => state.documents)
  const isFetching = useDocumentStore((state) => state.isFetching)
  const isUploading = useDocumentStore((state) => state.isUploading)
  const errorMessage = useDocumentStore((state) => state.errorMessage)
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments)
  const uploadDocument = useDocumentStore((state) => state.uploadDocument)

  return (
    <Upload
      isGraduated={isGraduated}
      documents={documents}
      isFetching={isFetching}
      isUploading={isUploading}
      errorMessage={errorMessage}
      onRefresh={fetchDocuments}
      onUpload={uploadDocument}
    />
  )
}

function UsersRoute() {
  const role = useAuthStore((state) => state.user.role)
  const users = useUserStore((state) => state.users)
  const pageNumber = useUserStore((state) => state.pageNumber)
  const pageSize = useUserStore((state) => state.pageSize)
  const totalCount = useUserStore((state) => state.totalCount)
  const totalPages = useUserStore((state) => state.totalPages)
  const searchTerm = useUserStore((state) => state.searchTerm)
  const isUsersFetching = useUserStore((state) => state.isFetching)
  const isUsersCreating = useUserStore((state) => state.isCreating)
  const isBulkImporting = useUserStore((state) => state.isBulkImporting)
  const bulkImportResult = useUserStore((state) => state.bulkImportResult)
  const usersErrorMessage = useUserStore((state) => state.errorMessage)
  const fetchUsers = useUserStore((state) => state.fetchUsers)
  const createUser = useUserStore((state) => state.createUser)
  const bulkImportStudents = useUserStore((state) => state.bulkImportStudents)

  const faculties = useFacultyStore((state) => state.faculties)
  const isFacultiesFetching = useFacultyStore((state) => state.isFetching)
  const departments = useDepartmentStore((state) => state.departments)
  const levelOptions = useLevelStore((state) => state.levelOptions)
  const isFetchingLevelOptions = useLevelStore((state) => state.isFetchingOptions)
  const fetchLevelOptionsByDepartment = useLevelStore((state) => state.fetchLevelOptionsByDepartment)

  const canManageUsers = role === 'Admin' || role === 'Dean' || role === 'FacultyOfficer' || role === 'HOD' || role === 'LevelAdviser'

  return (
    <Users
      currentRole={role}
      users={users}
      pageNumber={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      searchTerm={searchTerm}
      faculties={faculties}
      departments={departments}
      levelOptions={levelOptions}
      isFacultiesFetching={isFacultiesFetching}
      isFetchingLevelOptions={isFetchingLevelOptions}
      isFetching={isUsersFetching}
      isCreating={isUsersCreating}
      isBulkImporting={isBulkImporting}
      bulkImportResult={bulkImportResult}
      errorMessage={usersErrorMessage}
      canManageUsers={canManageUsers}
      onRefresh={fetchUsers}
      onCreateUser={createUser}
      onFetchLevelsByDepartment={fetchLevelOptionsByDepartment}
      onBulkImport={bulkImportStudents}
    />
  )
}

function FacultiesRoute() {
  const faculties = useFacultyStore((state) => state.faculties)
  const isFetching = useFacultyStore((state) => state.isFetching)
  const isCreating = useFacultyStore((state) => state.isCreating)
  const errorMessage = useFacultyStore((state) => state.errorMessage)
  const fetchFaculties = useFacultyStore((state) => state.fetchFaculties)
  const createFaculty = useFacultyStore((state) => state.createFaculty)

  return (
    <Faculties
      faculties={faculties}
      isFetching={isFetching}
      isCreating={isCreating}
      errorMessage={errorMessage}
      onRefresh={fetchFaculties}
      onCreateFaculty={createFaculty}
    />
  )
}

function DepartmentsRoute() {
  const departments = useDepartmentStore((state) => state.departments)
  const faculties = useFacultyStore((state) => state.faculties)
  const isFacultiesFetching = useFacultyStore((state) => state.isFetching)
  const isFetching = useDepartmentStore((state) => state.isFetching)
  const isCreating = useDepartmentStore((state) => state.isCreating)
  const errorMessage = useDepartmentStore((state) => state.errorMessage)
  const fetchDepartments = useDepartmentStore((state) => state.fetchDepartments)
  const createDepartment = useDepartmentStore((state) => state.createDepartment)

  return (
    <Departments
      departments={departments}
      faculties={faculties}
      isFacultiesFetching={isFacultiesFetching}
      isFetching={isFetching}
      isCreating={isCreating}
      errorMessage={errorMessage}
      onRefresh={fetchDepartments}
      onCreateDepartment={createDepartment}
    />
  )
}

function LevelsRoute() {
  const levels = useLevelStore((state) => state.levels)
  const departments = useDepartmentStore((state) => state.departments)
  const isDepartmentsFetching = useDepartmentStore((state) => state.isFetching)
  const isFetching = useLevelStore((state) => state.isFetching)
  const isCreating = useLevelStore((state) => state.isCreating)
  const errorMessage = useLevelStore((state) => state.errorMessage)
  const fetchLevels = useLevelStore((state) => state.fetchLevels)
  const createLevel = useLevelStore((state) => state.createLevel)

  return (
    <Levels
      levels={levels}
      departments={departments}
      isDepartmentsFetching={isDepartmentsFetching}
      isFetching={isFetching}
      isCreating={isCreating}
      errorMessage={errorMessage}
      onRefresh={fetchLevels}
      onCreateLevel={createLevel}
    />
  )
}

function PromotionRoute() {
  const role = useAuthStore((state) => state.user.role)
  const currentDepartmentId = useAuthStore((state) => state.user.departmentId)
  const departments = useDepartmentStore((state) => state.departments)
  const isDepartmentsFetching = useDepartmentStore((state) => state.isFetching)
  const isPromoting = usePromotionStore((state) => state.isPromoting)
  const lastResult = usePromotionStore((state) => state.lastResult)
  const errorMessage = usePromotionStore((state) => state.errorMessage)
  const promoteStudents = usePromotionStore((state) => state.promoteStudents)
  const clearPromotionState = usePromotionStore((state) => state.clearPromotionState)

  return (
    <Promotion
      currentRole={role}
      currentDepartmentId={currentDepartmentId}
      departments={departments}
      isFetching={isDepartmentsFetching}
      isPromoting={isPromoting}
      lastResult={lastResult}
      errorMessage={errorMessage}
      onPromote={promoteStudents}
      onClear={clearPromotionState}
    />
  )
}

function ChangePasswordRoute() {
  return (
    <ChangePassword
      onPasswordChanged={() => {
        // After password is changed, update the auth store
        useAuthStore.setState({ isFirstLogin: false })
      }}
    />
  )
}

function ActivityLogRoute() {
  const role = useAuthStore((state) => state.user.role)
  const myLogs = useAuditLogStore((state) => state.myLogs)
  const allLogs = useAuditLogStore((state) => state.allLogs)
  const myLogsHasMore = useAuditLogStore((state) => state.myLogsHasMore)
  const allLogsHasMore = useAuditLogStore((state) => state.allLogsHasMore)
  const isMyLogsFetching = useAuditLogStore((state) => state.isMyLogsFetching)
  const isAllLogsFetching = useAuditLogStore((state) => state.isAllLogsFetching)
  const errorMessage = useAuditLogStore((state) => state.errorMessage)
  const fetchMyLogsFirstPage = useAuditLogStore((state) => state.fetchMyLogsFirstPage)
  const fetchMyLogsNextPage = useAuditLogStore((state) => state.fetchMyLogsNextPage)
  const fetchAllLogsFirstPage = useAuditLogStore((state) => state.fetchAllLogsFirstPage)
  const fetchAllLogsNextPage = useAuditLogStore((state) => state.fetchAllLogsNextPage)

  useEffect(() => {
    void fetchMyLogsFirstPage()
    if (role === 'Admin') {
      void fetchAllLogsFirstPage()
    }
  }, [fetchAllLogsFirstPage, fetchMyLogsFirstPage, role])

  return (
    <ActivityLog
      currentRole={role}
      myLogs={myLogs}
      allLogs={allLogs}
      myLogsHasMore={myLogsHasMore}
      allLogsHasMore={allLogsHasMore}
      isMyLogsFetching={isMyLogsFetching}
      isAllLogsFetching={isAllLogsFetching}
      errorMessage={errorMessage}
      onLoadMyLogsFirstPage={fetchMyLogsFirstPage}
      onLoadMyLogsNextPage={fetchMyLogsNextPage}
      onLoadAllLogsFirstPage={fetchAllLogsFirstPage}
      onLoadAllLogsNextPage={fetchAllLogsNextPage}
    />
  )
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const authErrorMessage = useAuthStore((state) => state.errorMessage)
  const user = useAuthStore((state) => state.user)
  const isFirstLogin = useAuthStore((state) => state.isFirstLogin)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments)
  const fetchUsers = useUserStore((state) => state.fetchUsers)
  const fetchFaculties = useFacultyStore((state) => state.fetchFaculties)
  const fetchDepartments = useDepartmentStore((state) => state.fetchDepartments)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    // All authenticated users get their accessible documents loaded automatically
    if (isAuthenticated && !isFirstLogin) {
      void fetchDocuments()
    }
  }, [isAuthenticated, isFirstLogin, fetchDocuments])

  useEffect(() => {
    const canPreloadUserManagementData =
      user.role === 'Admin' || user.role === 'Dean' || user.role === 'FacultyOfficer' || user.role === 'HOD' || user.role === 'LevelAdviser'

    if (isAuthenticated && !isFirstLogin && canPreloadUserManagementData) {
      void fetchUsers({ pageNumber: 1, pageSize: 12 })
      if (user.role === 'Admin') {
        void fetchFaculties()
      }
      if (user.role !== 'LevelAdviser') {
        void fetchDepartments()
      }
    }
  }, [isAuthenticated, isFirstLogin, fetchUsers, fetchFaculties, fetchDepartments, user.role])

  const canViewDocuments = user.role === 'Student' // graduated students included
  const canManageUsers = user.role === 'Admin' || user.role === 'Dean' || user.role === 'FacultyOfficer' || user.role === 'HOD' || user.role === 'LevelAdviser'
  const canManageFaculties = user.role === 'Admin'
  const canPromote = user.role === 'Admin' || user.role === 'Dean' || user.role === 'FacultyOfficer' || user.role === 'HOD'
  const navItems: DashboardNavItem[] = [
    { key: '/dashboard', label: 'Dashboard', visible: true, icon: 'dashboard' },
    { key: '/activity-log', label: 'Activity Log', visible: true, icon: 'activity' },
    { key: '/upload', label: user.isGraduated ? 'My Documents' : 'Upload', visible: canViewDocuments, icon: 'upload' },
    { key: '/users', label: 'Users', visible: canManageUsers, icon: 'users' },
    { key: '/registrations', label: 'Registrations', visible: user.role === 'Admin', icon: 'registrations' },
    { key: '/promote', label: 'Session Promotion', visible: canPromote, icon: 'promotion' },
    { key: '/faculties', label: 'Faculties', visible: canManageFaculties, icon: 'faculties' },
    { key: '/departments', label: 'Departments', visible: canManageFaculties, icon: 'departments' },
    { key: '/levels', label: 'Levels', visible: canManageFaculties, icon: 'levels' },
  ]

  const defaultRoute = isAuthenticated ? (isFirstLogin ? '/change-password' : '/dashboard') : '/login'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route
          path="/login"
          element={
            isInitializing ? null :
            isAuthenticated ? (
              <Navigate to={defaultRoute} replace />
            ) : (
              <Login isLoading={isAuthLoading} errorMessage={authErrorMessage} onLogin={login} />
            )
          }
        />

        <Route
          path="/register"
          element={
            isInitializing ? null :
            isAuthenticated ? (
              <Navigate to={defaultRoute} replace />
            ) : (
              <Register />
            )
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/change-password"
            element={
              isFirstLogin ? (
                <ChangePasswordRoute />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
            element={
              <DashboardLayout
                heading={getDashboardHeading(user.role)}
                subheading="Secure role-based records, accountability, and document workflow"
                roleLabel={getRoleLabel(user.role)}
                onLogout={logout}
                navItems={navItems}
              />
            }
          >
            <Route path="/dashboard" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <DashboardRoute />} />
            <Route path="/activity-log" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <ActivityLogRoute />} />

            <Route element={<RoleGuard allowedRoles={['Student']} />}>
              <Route path="/upload" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <UploadRoute />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['Admin', 'Dean', 'FacultyOfficer', 'HOD', 'LevelAdviser']} />}>
              <Route path="/users" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <UsersRoute />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['Admin', 'Dean', 'FacultyOfficer', 'HOD']} />}>
              <Route path="/promote" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <PromotionRoute />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['Admin']} />}>
              <Route path="/faculties" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <FacultiesRoute />} />
              <Route path="/departments" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <DepartmentsRoute />} />
              <Route path="/levels" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <LevelsRoute />} />
              <Route path="/registrations" element={isFirstLogin ? <Navigate to="/change-password" replace /> : <PendingRegistrations />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
