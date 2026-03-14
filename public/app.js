let token = '';

async function api(path, method = 'GET', body) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

const setOut = (id, value) => {
  document.getElementById(id).textContent = JSON.stringify(value, null, 2);
};
const setStatus = (text) => {
  document.getElementById('statusBadge').textContent = text;
};

const value = (id) => document.getElementById(id).value;

document.getElementById('registerBtn').onclick = async () => {
  const payload = {
    name: value('name'),
    email: value('email'),
    password: value('password'),
    dob: value('dob'),
    gender: value('gender')
  };
  setOut('authOut', await api('/api/auth/register', 'POST', payload));
};

document.getElementById('loginBtn').onclick = async () => {
  const data = await api('/api/auth/login', 'POST', { email: value('email'), password: value('password') });
  if (data.token) {
    token = data.token;
    setStatus(`Logged in: ${data.user.name}`);
  }
  setOut('authOut', data);
};

document.getElementById('logoutBtn').onclick = async () => {
  setOut('authOut', await api('/api/auth/logout', 'POST'));
  token = '';
  setStatus('Not logged in');
};

document.getElementById('searchSymptomsBtn').onclick = async () => {
  const query = encodeURIComponent(value('symptomSearch'));
  setOut('symptomSuggestOut', await api(`/api/symptoms?q=${query}`));
};

document.getElementById('predictBtn').onclick = async () => {
  const symptoms = value('symptoms').split(',').map((s) => s.trim()).filter(Boolean);
  const season = value('season');
  setOut('predictOut', await api('/api/predict', 'POST', { symptoms, season }));
};

document.getElementById('riskBtn').onclick = async () => {
  const payload = {
    heartRate: value('heartRate'),
    oxygen: value('oxygen'),
    systolicBP: value('systolicBP'),
    temperatureC: value('temperatureC')
  };
  setOut('riskOut', await api('/api/risk-assessment', 'POST', payload));
};

document.getElementById('profileBtn').onclick = async () => {
  setOut('profileOut', await api('/api/profile'));
};

document.getElementById('wellnessBtn').onclick = async () => {
  setOut('wellnessOut', await api('/api/wellness-plan'));
};

document.getElementById('nearbyBtn').onclick = async () => {
  const lat = value('lat');
  const lng = value('lng');
  const type = value('type');
  const radius = value('radius');
  setOut('nearbyOut', await api(`/api/nearby?lat=${lat}&lng=${lng}&type=${type}&radius=${radius}`));
};

document.getElementById('chatBtn').onclick = async () => {
  setOut('chatOut', await api('/api/chat', 'POST', { message: value('chatMsg') }));
};
