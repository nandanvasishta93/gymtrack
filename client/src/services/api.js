const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('gym_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // User
  getProfile: () => request('/user/profile'),
  updateProfile: (data) => request('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  recalculateProgram: (startDate) => request('/user/recalculate-program', { method: 'POST', body: JSON.stringify({ startDate }) }),
  resetProgram: () => request('/user/reset-program', { method: 'POST', body: JSON.stringify({ confirm: true }) }),
  exportData: () => request('/user/export'),

  // Workouts
  getTodayWorkout: () => request('/workouts/today'),
  getDayWorkout: (dayNumber) => request(`/workouts/day/${dayNumber}`),
  getCalendar: () => request('/workouts/calendar'),
  startSession: (programDayId) => request('/workouts/session/start', { method: 'POST', body: JSON.stringify({ programDayId }) }),
  logSet: (setData) => request('/workouts/session/set', { method: 'POST', body: JSON.stringify(setData) }),
  toggleExerciseComplete: (data) => request('/workouts/session/exercise-complete', { method: 'POST', body: JSON.stringify(data) }),
  finishWorkout: (data) => request('/workouts/session/finish', { method: 'POST', body: JSON.stringify(data) }),
  substituteExercise: (data) => request('/workouts/substitute', { method: 'POST', body: JSON.stringify(data) }),
  getWorkoutHistory: () => request('/workouts/history'),
  getWorkoutTemplates: () => request('/workouts/templates'),
  addExerciseToPlan: (data) => request('/workouts/add-exercise', { method: 'POST', body: JSON.stringify(data) }),

  // Exercises
  getExercises: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exercises${query ? `?${query}` : ''}`);
  },
  getExerciseDetails: (id) => request(`/exercises/${id}`),
  getExerciseHistory: (id) => request(`/exercises/${id}/history`),

  // Core
  getTodayCore: () => request('/core/today'),
  getCoreTemplates: () => request('/core/templates'),
  logCore: (data) => request('/core/log', { method: 'POST', body: JSON.stringify(data) }),
  getCoreHistory: () => request('/core/history'),

  // Cardio
  getCardio: () => request('/cardio'),
  logCardio: (data) => request('/cardio', { method: 'POST', body: JSON.stringify(data) }),
  deleteCardio: (id) => request(`/cardio/${id}`, { method: 'DELETE' }),

  // Nutrition
  getTodayNutrition: () => request('/nutrition/today'),
  getFoodsList: () => request('/nutrition/foods'),
  logNutrition: (data) => request('/nutrition/log', { method: 'POST', body: JSON.stringify(data) }),
  deleteNutrition: (id) => request(`/nutrition/log/${id}`, { method: 'DELETE' }),
  logWater: (glasses) => request('/nutrition/water', { method: 'POST', body: JSON.stringify({ glasses }) }),
  getGroceryList: () => request('/nutrition/grocery'),

  // Measurements
  getMeasurements: () => request('/measurements'),
  logMeasurement: (data) => request('/measurements', { method: 'POST', body: JSON.stringify(data) }),

  // Progress
  getProgressSummary: () => request('/progress/summary')
};
