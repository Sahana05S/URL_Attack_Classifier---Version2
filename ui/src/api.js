const API_BASE = 'http://localhost:8000';

export async function fetchEvents(limit = 100) {
    const res = await fetch(`${API_BASE}/events?limit=${limit}`);
    return res.json();
}

export async function fetchTimeline() {
    const res = await fetch(`${API_BASE}/stats/timeline`);
    return res.json();
}

export async function fetchTopIPs() {
    const res = await fetch(`${API_BASE}/stats/top-ips`);
    return res.json();
}

export async function fetchExplanation(eventId) {
    const res = await fetch(`${API_BASE}/explain/${eventId}`);
    return res.json();
}

export async function fetchStoryline(ip) {
    const res = await fetch(`${API_BASE}/storyline/${ip}`);
    return res.json();
}
