import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
})

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete client.defaults.headers.common['Authorization']
  }
}

export async function registerParticipant(formData) {
  const { data } = await client.post('/participants', formData)
  return data
}

export async function getParticipantQR(id, email) {
  const { data } = await client.get(`/participants/${encodeURIComponent(id)}/qr`, {
    params: { email },
    responseType: 'blob',
  })
  return data
}

export async function loginAdmin(email, password) {
  const { data } = await client.post('/auth/login', { email, password })
  return data
}

export async function getParticipants(params) {
  const { data } = await client.get('/admin/participants', { params })
  return data
}

export async function addParticipant(formData) {
  const { data } = await client.post('/admin/participants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateParticipant(id, formData) {
  const { data } = await client.put(`/admin/participants/${encodeURIComponent(id)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteParticipant(id) {
  const { data } = await client.delete(`/admin/participants/${encodeURIComponent(id)}`)
  return data
}

export async function deleteParticipants(ids) {
  const { data } = await client.delete('/admin/participants/bulk', { data: { ids } })
  return data
}

export async function setAttendance(id, attendanceStatus) {
  const { data } = await client.patch(`/admin/participants/${encodeURIComponent(id)}/attendance`, {
    attendanceStatus,
  })
  return data
}

export async function exportExcel() {
  const { data } = await client.get('/admin/export', {
    responseType: 'blob',
  })
  return data
}

export async function getUploadUrl(filename) {
  const { data } = await client.get(`/uploads/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
  })
  return URL.createObjectURL(data)
}

export default client
