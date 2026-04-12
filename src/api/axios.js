import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
})

// JWT disabled - no token header needed
export default API
