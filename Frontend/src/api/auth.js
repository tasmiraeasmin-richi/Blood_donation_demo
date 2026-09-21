import { api } from './client';
import { mapUser } from './mappers';

/**
 * Authentication + own-profile service.
 * Backend contract (router/auth.py):
 * - POST /createuser {name,email,phone,password,blood_group,district} -> UserOut
 * - POST /login (form: username=email, password) -> {access_token, token_type}
 * - GET /user -> UserOut
 * - PUT /edituser {name?,phone?,blood_group?,district?,is_available?} -> UserOut
 * - PUT /passwordchange {current_password,new_password}
 * - POST /forgot-password {email}
 * - POST /reset-password/{token} {new_password}
 */
export async function signup(data) {
  await api.post('/createuser', {
    name: data.name?.trim(),
    email: data.email?.trim(),
    phone: data.phone?.trim(),
    password: data.password,
    blood_group: data.blood_group,
    district: data.district,
  }, { auth: false });
  return login(data.email?.trim(), data.password);
}

export async function login(email, password) {
  const tokenData = await api.post('/login', { username: email, password }, { auth: false, form: true });
  const profile = await api.get('/user', { auth: false, token: tokenData.access_token });
  return { token: tokenData.access_token, user: mapUser(profile) };
}

export async function getProfile() {
  const profile = await api.get('/user');
  return mapUser(profile);
}

export async function updateProfile(data) {
  // Backend UserUpdate supports only these fields (no email, no last_donation_date).
  const payload = {};
  if (data.name !== undefined) payload.name = data.name?.trim();
  if (data.phone !== undefined) payload.phone = data.phone?.trim();
  if (data.blood_group) payload.blood_group = data.blood_group;
  if (data.district) payload.district = data.district;
  if (data.is_available !== undefined) payload.is_available = data.is_available;
  const profile = await api.put('/edituser', payload);
  return mapUser(profile);
}

export async function changePassword(currentPassword, newPassword) {
  return api.put('/passwordchange', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

export async function forgotPassword(email) {
  return api.post('/forgot-password', { email: email?.trim() }, { auth: false });
}

export async function resetPassword(token, newPassword) {
  return api.post(`/reset-password/${token}`, { new_password: newPassword }, { auth: false });
}
