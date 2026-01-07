const API_BASE = `http://${window.location.hostname}:8000`;

export async function fetchEvents(limit = 100) {
    const res = await fetch(`${API_BASE}/events?limit=${limit}`);
    return res.json();
}

export const getTimeline = () => fetch(`${API_BASE}/stats/timeline`).then(res => res.json());
export const getTopIPs = () => fetch(`${API_BASE}/stats/top-ips`).then(res => res.json());
export const getExplanation = (id) => fetch(`${API_BASE}/explain/${id}`).then(res => res.json());
export const getStoryline = (ip) => fetch(`${API_BASE}/storyline/${ip}`).then(res => res.json());

export const uploadLogs = (file, clearExisting = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/upload/logs?clear_existing=${clearExisting}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    }).then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.detail || 'Upload failed') });
        return res.json();
    });
};

export const clearAllEvents = () => {
    return fetch(`${API_BASE}/events`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.detail || 'Clear failed') });
        return res.json();
    });
};

// Auth
export const loginUser = (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: formData
    }).then(res => {
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    });
};

export const signupUser = (username, password) => {
    return fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(async res => {
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Signup failed');
        }
        return res.json();
    });
};

export const getMe = () => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
    });
};
