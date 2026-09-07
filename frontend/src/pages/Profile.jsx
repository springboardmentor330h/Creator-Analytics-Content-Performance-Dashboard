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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Profile
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your account information and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-900 text-3xl font-bold text-white">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              {user.full_name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {user.role}
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            Account Information
          </h2>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Full Name
              </p>

              <p className="mt-1 text-gray-800">
                {user.full_name}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Email
              </p>

              <p className="mt-1 text-gray-800">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Role
              </p>

              <p className="mt-1 text-gray-800">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Account Status
              </p>

              <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">
          Account Settings
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Manage your CreatorIQ account.
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile