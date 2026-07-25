// Inside AuthContext.jsx
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // ✅ Fix: Handle token-only response
    if (response.data.access_token) {
      const token = response.data.access_token;
      
      // Store token
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch user data using the token (if your API has a /users/me endpoint)
      const userResponse = await api.get('/users/me'); 
      const userData = userResponse.data;

      // Now set the user state
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};   