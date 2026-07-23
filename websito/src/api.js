const API = 'http://127.0.0.1:8000/api'

function getToken() {
  const stored = localStorage.getItem('auth')
  if (!stored) return null
  try {
    return JSON.parse(stored).tokens.access
  } catch {
    return null
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${API}${path}`, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || JSON.stringify(data))
  return data
}

export function get(path) {
  return request('GET', path)
}

export function post(path, body) {
  return request('POST', path, body)
}

export function put(path, body) {
  return request('PUT', path, body)
}

export function del(path) {
  return request('DELETE', path)
}

export function login(username, password) {
  return post('/auth/login/', { username, password })
}

export function register(username, password) {
  return post('/auth/register/', { username, password })
}

export function adminLogin(username, password) {
  return post('/admin/login/', { username, password })
}

export function forgotPassword(username) {
  return post('/auth/forgot-password/', { username })
}

export function resetPassword(username, token, new_password) {
  return post('/auth/reset-password/', { username, token, new_password })
}

export function getProfile() {
  return get('/auth/profile/')
}

export function updateProfile(data) {
  return put('/auth/profile/', data)
}

export function changePassword(old_password, new_password) {
  return put('/auth/change-password/', { old_password, new_password })
}

export function getMenu() {
  return get('/menu/')
}

export function getFoods() {
  return get('/foods/')
}

export function getDrinks() {
  return get('/drinks/')
}

export function getIngredients() {
  return get('/ingredients/')
}

export function submitContact(name, email, message) {
  return post('/contact/', { name, email, message })
}

export function getContactMessages() {
  return get('/contact/messages/')
}

export function getAdminDashboard() {
  return get('/admin/dashboard/')
}

export function getAdminMenuItems() {
  return get('/admin/menu-items/')
}

export function updateMenuItem(id, data) {
  return put(`/admin/menu-items/${id}/`, data)
}

export function deleteMenuItem(id) {
  return del(`/admin/menu-items/${id}/`)
}

export function adminAddFood(data) {
  return post('/admin/add-food/', data)
}

export function adminAddDrink(data) {
  return post('/admin/add-drink/', data)
}

export function adminCreateUser(data) {
  return post('/admin/create-user/', data)
}

export function getAdminUsers() {
  return get('/admin/users/')
}

export function updateAdminUser(id, data) {
  return put(`/admin/users/${id}/`, data)
}

export function deleteAdminUser(id) {
  return del(`/admin/users/${id}/`)
}

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const token = getToken()
  return fetch(`${API}/admin/upload-image/`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  }).then(r => r.json())
}

export function getMenuItem(id) {
  return get(`/menu/${id}/`)
}

export function placeOrder(data) {
  return post('/orders/', data)
}

export function getMyOrders() {
  return get('/orders/my/')
}

export function getAllOrders() {
  return get('/orders/all/')
}

export function updateOrderStatus(id, data) {
  return request('PATCH', `/orders/${id}/`, data)
}

export function deleteOrder(id) {
  return del(`/orders/${id}/`)
}

export function cancelOrder(id) {
  return post(`/orders/${id}/cancel/`)
}

export function getMe() {
  return get('/auth/me/')
}

export function logout() {
  localStorage.removeItem('auth')
}

export function saveAuth(data) {
  localStorage.setItem('auth', JSON.stringify(data))
}

export function getAuth() {
  const stored = localStorage.getItem('auth')
  return stored ? JSON.parse(stored) : null
}
