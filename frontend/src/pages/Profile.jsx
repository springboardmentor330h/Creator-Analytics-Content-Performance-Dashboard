import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Profile() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token')

        if (!token) {
          navigate('/login')
          return
        }

        // Get the logged-in user's email from the JWT
        const payload = JSON.parse(
          atob(token.split('.')[1])
        )

        const email = payload.sub

        // Get users from the backend
        const response = await api.get('/users')

        const currentUser = response.data.find(
          (item) => item.email === email
        )

        if (!currentUser) {
          setError('User information not found.')
          return
        }

        setUser(currentUser)
      } catch (err) {
        console.error(err)
        setError('Failed to load profile information.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Profile
        </h1>

        <p className="mt-4 text-gray-500">
          Loading profile information...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Profile
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#2563eb]">
          Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and settings.
        </p>
      </div>

      {/* Profile and Account Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Profile Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md">

          <div className="flex flex-col items-center">

            {/* Profile Initial */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#DBEAFE] text-3xl font-bold text-[#2563eb]">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#2563eb]">
              {user.full_name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {user.role}
            </p>

          </div>

        </div>

        {/* Account Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md lg:col-span-2">

          <h2 className="mb-6 text-lg font-bold text-[#2563eb]">
            Account Information
          </h2>

          <div className="space-y-5">

            {/* Full Name */}
            <div>
              <p className="text-sm font-bold text-[#2563eb]">
                Full Name
              </p>

              <p className="mt-1 text-gray-700">
                {user.full_name}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm font-bold text-[#2563eb]">
                Email
              </p>

              <p className="mt-1 text-gray-700">
                {user.email}
              </p>
            </div>

            {/* Role */}
            <div>
              <p className="text-sm font-bold text-[#2563eb]">
                Role
              </p>

              <p className="mt-1 text-gray-700">
                {user.role}
              </p>
            </div>

            {/* Account Status */}
            <div>
              <p className="text-sm font-bold text-[#2563eb]">
                Account Status
              </p>

              <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Active
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Account Settings */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">

        <h2 className="text-lg font-bold text-[#2563eb]">
          Account Settings
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your CreatorIQ account.
        </p>

        <button
          onClick={handleLogout}
          className="mt-5 rounded-xl bg-[#2563eb] px-5 py-3 font-medium text-white shadow-sm transition duration-300 hover:bg-blue-700 hover:shadow-md"
        >
          Logout
        </button>

      </div>

    </div>
  )
}

export default Profile