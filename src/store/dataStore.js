const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '../../data/app-data.json');

const initialState = {
  users: [],
  sessions: {},
  predictions: {},
  loginHistory: {}
};

function load() {
  if (!fs.existsSync(DB_PATH)) return { ...initialState };
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { ...initialState };
  }
}

let state = load();

function persist() {
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createUser(payload) {
  const exists = state.users.find((u) => u.email === payload.email);
  if (exists) throw new Error('Email already registered');
  const user = {
    id: crypto.randomUUID(),
    name: payload.name,
    email: payload.email,
    passwordHash: hashPassword(payload.password),
    dob: payload.dob || '',
    gender: payload.gender || 'unspecified',
    createdAt: new Date().toISOString()
  };
  state.users.push(user);
  persist();
  return user;
}

function authenticate(email, password) {
  const user = state.users.find((u) => u.email === email && u.passwordHash === hashPassword(password));
  if (!user) return null;
  const token = crypto.randomBytes(24).toString('hex');
  state.sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };
  state.loginHistory[user.id] = state.loginHistory[user.id] || [];
  state.loginHistory[user.id].unshift({ time: new Date().toISOString(), ip: 'local' });
  state.loginHistory[user.id] = state.loginHistory[user.id].slice(0, 5);
  persist();
  return { token, user };
}

function logout(token) {
  delete state.sessions[token];
  persist();
}

function getUserByToken(token) {
  const session = state.sessions[token];
  if (!session) return null;
  return state.users.find((u) => u.id === session.userId) || null;
}

function updateProfile(userId, patch) {
  const user = state.users.find((u) => u.id === userId);
  if (!user) return null;
  user.name = patch.name || user.name;
  user.dob = patch.dob || user.dob;
  user.gender = patch.gender || user.gender;
  persist();
  return user;
}

function addPrediction(userId, prediction) {
  state.predictions[userId] = state.predictions[userId] || [];
  state.predictions[userId].unshift({ ...prediction, createdAt: new Date().toISOString() });
  state.predictions[userId] = state.predictions[userId].slice(0, 10);
  persist();
}

function getInsights(userId) {
  const history = state.predictions[userId] || [];
  const avgConfidence = history.length
    ? Number((history.reduce((sum, h) => sum + (h.topPrediction?.confidence || 0), 0) / history.length).toFixed(1))
    : 0;
  return {
    recentPredictions: history.slice(0, 5),
    totalSessions: history.length,
    averageConfidence: avgConfidence,
    loginHistory: state.loginHistory[userId] || []
  };
}

module.exports = {
  createUser,
  authenticate,
  logout,
  getUserByToken,
  updateProfile,
  addPrediction,
  getInsights
};
