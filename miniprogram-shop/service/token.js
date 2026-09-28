
const TOKEN_KEY = 'token';
const USER_KEY = 'userInfo';

export function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || '';
}

export function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

export function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

export function getUser() {
  return wx.getStorageSync(USER_KEY) || null;
}

export function setUser(user) {
  wx.setStorageSync(USER_KEY, user);
}

export function clearUser() {
  wx.removeStorageSync(USER_KEY);
}

export function clearAuth() {
  clearToken();
  clearUser();
}