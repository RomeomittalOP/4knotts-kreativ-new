import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('4kk-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('4kk-token')
      localStorage.removeItem('4kk-user')
    }
    return Promise.reject(err)
  }
)

export default api
