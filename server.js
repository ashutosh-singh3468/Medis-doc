const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const { predictDiseases, DISEASE_MODELS, suggestSymptoms } = require('./src/engine/diagnosis');
const { buildRecommendations } = require('./src/services/recommendations');
const { findNearby } = require('./src/services/healthcareFinder');
const { buildFallbackResponse } = require('./src/services/chatAssistant');
const { assessVitalsRisk } = require('./src/services/riskAssessment');
const store = require('./src/store/dataStore');

const PORT = process.env.PORT || 3000;

function sendJson(res, code, payload) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function getAuthToken(req) {
  return (req.headers.authorization || '').replace('Bearer ', '');
}

function ageFromDOB(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const hasBirthdayPassed = now.getMonth() > d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() >= d.getDate());
  if (!hasBirthdayPassed) age -= 1;
  return age;
}

function buildWellnessPlan(user, insights) {
  const age = ageFromDOB(user.dob) || 30;
  const avgConfidence = insights.averageConfidence || 0;
  const riskBand = avgConfidence >= 70 ? 'High vigilance' : avgConfidence >= 45 ? 'Moderate vigilance' : 'Baseline vigilance';
  return {
    riskBand,
    hydrationGoalLiters: age >= 60 ? 2.2 : 2.8,
    sleepGoalHours: age >= 60 ? 8 : 7,
    activityGoal: age >= 60 ? '30 min light walk + mobility stretches' : '45 min mixed cardio/strength',
    preventiveTests: ['CBC every 6 months', 'Blood sugar every 6 months', 'Blood pressure weekly'],
    basedOnPredictionSessions: insights.totalSessions
  };
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
function serveStatic(req, res) {
  const reqPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(reqPath).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = path.join(__dirname, 'public', safePath);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) return sendJson(res, 403, { error: 'Forbidden' });
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        platform: 'MEDIS Nova',
        diseases: DISEASE_MODELS.length,
        features: ['prediction', 'triage', 'risk-assessment', 'wellness-plan', 'chat', 'nearby'],
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === '/api/symptoms' && req.method === 'GET') {
      const query = url.searchParams.get('q') || '';
      return sendJson(res, 200, { query, suggestions: suggestSymptoms(query) });
    }

    if (url.pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const user = store.createUser(body);
      return sendJson(res, 201, { id: user.id, name: user.name, email: user.email });
    }

    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const session = store.authenticate(body.email, body.password);
      if (!session) return sendJson(res, 401, { error: 'Invalid credentials' });
      return sendJson(res, 200, { token: session.token, user: { id: session.user.id, name: session.user.name, email: session.user.email, dob: session.user.dob, gender: session.user.gender } });
    }

    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      const token = getAuthToken(req);
      store.logout(token);
      return sendJson(res, 200, { ok: true });
    }

    if (url.pathname === '/api/profile' && req.method === 'GET') {
      const user = store.getUserByToken(getAuthToken(req));
      if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
      const insights = store.getInsights(user.id);
      return sendJson(res, 200, { ...user, age: ageFromDOB(user.dob), insights });
    }

    if (url.pathname === '/api/profile' && req.method === 'PUT') {
      const user = store.getUserByToken(getAuthToken(req));
      if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
      const body = await parseBody(req);
      const updated = store.updateProfile(user.id, body);
      return sendJson(res, 200, { user: updated, age: ageFromDOB(updated.dob) });
    }

    if (url.pathname === '/api/predict' && req.method === 'POST') {
      const user = store.getUserByToken(getAuthToken(req));
      if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
      const body = await parseBody(req);
      const context = { age: ageFromDOB(user.dob), gender: user.gender, season: body.season || 'summer' };
      const outcome = predictDiseases(body.symptoms || [], context);
      const recommendations = buildRecommendations(outcome.topPrediction);
      const report = {
        ...outcome,
        reportId: crypto.randomUUID(),
        recommendations,
        generatedAt: new Date().toISOString()
      };
      store.addPrediction(user.id, report);
      return sendJson(res, 200, report);
    }

    if (url.pathname === '/api/risk-assessment' && req.method === 'POST') {
      const user = store.getUserByToken(getAuthToken(req));
      if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
      const body = await parseBody(req);
      return sendJson(res, 200, assessVitalsRisk(body));
    }

    if (url.pathname === '/api/wellness-plan' && req.method === 'GET') {
      const user = store.getUserByToken(getAuthToken(req));
      if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
      const insights = store.getInsights(user.id);
      return sendJson(res, 200, buildWellnessPlan(user, insights));
    }

    if (url.pathname === '/api/nearby' && req.method === 'GET') {
      const lat = Number(url.searchParams.get('lat') || 29.3919);
      const lng = Number(url.searchParams.get('lng') || 79.4542);
      const radius = Number(url.searchParams.get('radius') || 5);
      const type = url.searchParams.get('type') || 'all';
      const results = findNearby({ lat, lng, radiusKm: radius, type });
      return sendJson(res, 200, { count: results.length, results });
    }

    if (url.pathname === '/api/chat' && req.method === 'POST') {
      const user = store.getUserByToken(getAuthToken(req));
      if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
      const body = await parseBody(req);
      const insights = store.getInsights(user.id);
      const lastPrediction = insights.recentPredictions[0]?.topPrediction || null;
      return sendJson(res, 200, {
        message: buildFallbackResponse(body.message, { lastPrediction }),
        mode: process.env.GEMINI_API_KEY ? 'gemini-live-or-fallback' : 'safe-fallback'
      });
    }

    return serveStatic(req, res);
  } catch (err) {
    return sendJson(res, 400, { error: err.message || 'Bad request' });
  }
});

server.listen(PORT, () => {
  console.log(`MEDIS Nova running on http://localhost:${PORT}`);
});
