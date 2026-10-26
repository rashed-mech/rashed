import { PortfolioData, Publication, Project, Experience, Education, SkillGroup, Message, Profile, Training, Certification, ThemeUXConfig } from './types';

const API_BASE = '/api';

export async function reorderPublicationsAPI(orderedIds: string[]): Promise<Publication[]> {
  const res = await authFetch(`${API_BASE}/admin/publications/reorder`, {
    method: 'PUT', body: JSON.stringify({ orderedIds }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to save publication order');
  return json.data;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('portfolio_admin_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem('portfolio_admin_token', token);
  } catch (e) {
    console.error('Failed to set auth token in localStorage', e);
  }
}

export function removeAuthToken() {
  try {
    localStorage.removeItem('portfolio_admin_token');
  } catch (e) {
    console.error('Failed to remove auth token from localStorage', e);
  }
}

export function isAdminLoggedIn(): boolean {
  return !!getAuthToken();
}

export function logoutAdmin() {
  removeAuthToken();
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    removeAuthToken();
  }
  if (res.ok && options.method && options.method !== 'GET') {
    try { localStorage.setItem('portfolio_saved_at', String(Date.now())); } catch {}
  }
  return res;
}

// Public APIs
export async function fetchPortfolioData(): Promise<PortfolioData> {
  const res = await fetch(`${API_BASE}/portfolio`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch portfolio');
  return json.data;
}

export async function syncScholarCitations(): Promise<{ synced: boolean; changed: boolean }> {
  const res = await fetch(`${API_BASE}/scholar/sync`, { method: 'POST', cache: 'no-store' });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Citation updates could not be saved.');
  if (json.changed) {
    try { localStorage.setItem('portfolio_saved_at', String(Date.now())); } catch {}
  }
  return json;
}

export async function submitContactMessage(data: { name: string; email: string; subject: string; message: string }) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to send message');
  return json;
}

// Auth APIs
export async function loginAdmin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Invalid credentials');
  if (json.token) setAuthToken(json.token);
  return json;
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const res = await authFetch(`${API_BASE}/auth/me`);
    if (res.status === 401) {
      removeAuthToken();
      return false;
    }
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}

export async function updateAdminCredentials(newUsername: string, newPassword?: string) {
  const res = await authFetch(`${API_BASE}/auth/update-credentials`, {
    method: 'POST',
    body: JSON.stringify({ newUsername, newPassword })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update credentials');
  return json;
}

// Admin Data API
export async function fetchAdminData(): Promise<PortfolioData> {
  const res = await authFetch(`${API_BASE}/admin/data`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch admin data');
  return json.data;
}

// Admin Profile API
export async function updateProfileAPI(profile: Partial<Profile>): Promise<Profile> {
  const res = await authFetch(`${API_BASE}/admin/profile`, {
    method: 'PUT',
    body: JSON.stringify(profile)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update profile');
  return json.data;
}

// Admin Publications API
export async function createPublicationAPI(pub: Omit<Publication, 'id'>): Promise<Publication> {
  const res = await authFetch(`${API_BASE}/admin/publications`, {
    method: 'POST',
    body: JSON.stringify(pub)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create publication');
  return json.data;
}

export async function updatePublicationAPI(id: string, pub: Partial<Publication>): Promise<Publication> {
  const res = await authFetch(`${API_BASE}/admin/publications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pub)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update publication');
  return json.data;
}

export async function deletePublicationAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/publications/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete publication');
  return json;
}

export async function parseBibTeXAPI(bibtex: string): Promise<{ data: any[]; count: number }> {
  const res = await authFetch(`${API_BASE}/admin/publications/parse-bibtex`, {
    method: 'POST',
    body: JSON.stringify({ bibtex })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to parse BibTeX');
  return json;
}

export async function fetchAcademicPapersAPI(
  source: 'scholar' | 'semanticscholar' | 'doi', 
  query: string
): Promise<{ data: any[]; count: number; source: string; notes?: string }> {
  const res = await authFetch(`${API_BASE}/admin/publications/fetch-academic`, {
    method: 'POST',
    body: JSON.stringify({ source, query })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch academic papers');
  return json;
}

export async function bulkImportPublicationsAPI(
  publications: any[], 
  updateExisting: boolean = true
): Promise<{ addedCount: number; updatedCount: number; data: any }> {
  const res = await authFetch(`${API_BASE}/admin/publications/bulk-import`, {
    method: 'POST',
    body: JSON.stringify({ publications, updateExisting })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to bulk import publications');
  return json.data;
}

// Admin Projects API
export async function createProjectAPI(proj: Omit<Project, 'id'>): Promise<Project> {
  const res = await authFetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    body: JSON.stringify(proj)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create project');
  return json.data;
}

export async function updateProjectAPI(id: string, proj: Partial<Project>): Promise<Project> {
  const res = await authFetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proj)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update project');
  return json.data;
}

export async function deleteProjectAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete project');
  return json;
}

// Admin Experience API
export async function createExperienceAPI(exp: Omit<Experience, 'id'>): Promise<Experience> {
  const res = await authFetch(`${API_BASE}/admin/experience`, {
    method: 'POST',
    body: JSON.stringify(exp)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create experience');
  return json.data;
}

export async function updateExperienceAPI(id: string, exp: Partial<Experience>): Promise<Experience> {
  const res = await authFetch(`${API_BASE}/admin/experience/${id}`, {
    method: 'PUT',
    body: JSON.stringify(exp)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update experience');
  return json.data;
}

export async function deleteExperienceAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/experience/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete experience');
  return json;
}

// Admin Education API
export async function createEducationAPI(edu: Omit<Education, 'id'>): Promise<Education> {
  const res = await authFetch(`${API_BASE}/admin/education`, {
    method: 'POST',
    body: JSON.stringify(edu)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create education');
  return json.data;
}

export async function updateEducationAPI(id: string, edu: Partial<Education>): Promise<Education> {
  const res = await authFetch(`${API_BASE}/admin/education/${id}`, {
    method: 'PUT',
    body: JSON.stringify(edu)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update education');
  return json.data;
}

export async function deleteEducationAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/education/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete education');
  return json;
}

// Admin Trainings API
export async function createTrainingAPI(training: Omit<Training, 'id'>): Promise<Training> {
  const res = await authFetch(`${API_BASE}/admin/trainings`, {
    method: 'POST',
    body: JSON.stringify(training)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create training');
  return json.data;
}

export async function updateTrainingAPI(id: string, training: Partial<Training>): Promise<Training> {
  const res = await authFetch(`${API_BASE}/admin/trainings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(training)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update training');
  return json.data;
}

export async function deleteTrainingAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/trainings/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete training');
  return json;
}

// Admin Skills API
export async function updateSkillsAPI(skillGroups: SkillGroup[]): Promise<SkillGroup[]> {
  const res = await authFetch(`${API_BASE}/admin/skills`, {
    method: 'PUT',
    body: JSON.stringify({ skillGroups })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update skills');
  return json.data;
}

// Admin Messages API
export async function fetchMessagesAPI(): Promise<Message[]> {
  const res = await authFetch(`${API_BASE}/admin/messages`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch messages');
  return json.data;
}

export async function toggleMessageReadAPI(id: string): Promise<Message> {
  const res = await authFetch(`${API_BASE}/admin/messages/${id}/read`, {
    method: 'PATCH'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update message status');
  return json.data;
}

export async function deleteMessageAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/messages/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete message');
  return json;
}

// Admin Database Backup / Reset API
export async function resetDatabaseAPI(): Promise<PortfolioData> {
  const res = await authFetch(`${API_BASE}/admin/db/reset`, {
    method: 'POST'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reset database');
  return json.data;
}

export async function importDatabaseAPI(data: any) {
  const res = await authFetch(`${API_BASE}/admin/db/import`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to import database');
  return json;
}

// Admin Certifications API
export async function createCertificationAPI(cert: Omit<Certification, 'id'>): Promise<Certification> {
  const res = await authFetch(`${API_BASE}/admin/certifications`, {
    method: 'POST',
    body: JSON.stringify(cert)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create certification');
  return json.data;
}

export async function updateCertificationAPI(id: string, cert: Partial<Certification>): Promise<Certification> {
  const res = await authFetch(`${API_BASE}/admin/certifications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cert)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update certification');
  return json.data;
}

export async function reorderCertificationsAPI(orderedIds: string[]): Promise<Certification[]> {
  const res = await authFetch(`${API_BASE}/admin/certifications/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder certifications');
  return json.data;
}

export async function deleteCertificationAPI(id: string): Promise<any> {
  const res = await authFetch(`${API_BASE}/admin/certifications/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete certification');
  return json;
}

// Honors & Activities
export async function updateReferencesAPI(references: any[]): Promise<any[]> {
  const res = await authFetch(`${API_BASE}/admin/references`, {
    method: 'PUT',
    body: JSON.stringify({ references })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update references');
  return json.data;
}
export async function updateVolunteerWorkAPI(volunteerWork: any[]): Promise<any[]> {
  const res = await authFetch(`${API_BASE}/admin/volunteerWork`, {
    method: 'PUT',
    body: JSON.stringify({ volunteerWork })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update volunteer work');
  return json.data;
}
export async function updateAchievementsAPI(achievements: any[]): Promise<any[]> {
  const res = await authFetch(`${API_BASE}/admin/achievements`, {
    method: 'PUT',
    body: JSON.stringify({ achievements })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update achievements');
  return json.data;
}
export async function updateAffiliationsAPI(affiliations: any[]): Promise<any[]> {
  const res = await authFetch(`${API_BASE}/admin/affiliations`, {
    method: 'PUT',
    body: JSON.stringify({ affiliations })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update affiliations');
  return json.data;
}

export async function reorderTrainingsAPI(orderedIds: string[]): Promise<Training[]> {
  const res = await authFetch(`${API_BASE}/admin/trainings/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder');
  return json.data;
}

export async function reorderExperiencesAPI(orderedIds: string[]): Promise<Experience[]> {
  const res = await authFetch(`${API_BASE}/admin/experience/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder');
  return json.data;
}

export async function reorderEducationsAPI(orderedIds: string[]): Promise<Education[]> {
  const res = await authFetch(`${API_BASE}/admin/education/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder');
  return json.data;
}

export async function reorderProjectsAPI(orderedIds: string[]): Promise<Project[]> {
  const res = await authFetch(`${API_BASE}/admin/projects/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder');
  return json.data;
}

// Admin Overview API
export async function updatePillarsAPI(pillars: any[]): Promise<any[]> {
  const res = await authFetch(`${API_BASE}/admin/pillars`, {
    method: 'PUT',
    body: JSON.stringify({ pillars })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update pillars');
  return json.data;
}

export async function updateMetricsAPI(metrics: any[]): Promise<any[]> {
  const res = await authFetch(`${API_BASE}/admin/metrics`, {
    method: 'PUT',
    body: JSON.stringify({ metrics })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update metrics');
  return json.data;
}

export async function updateSectionConfigAPI(sectionConfig: any): Promise<void> {
  const res = await authFetch(`${API_BASE}/admin/section-config`, {
    method: 'POST',
    body: JSON.stringify({ sectionConfig })
  });
  
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Server returned invalid response: ${text.substring(0, 50)}`);
  }
  
  if (!res.ok || (json && json.success === false)) {
    throw new Error(json.message || json.error || 'Failed to update section config');
  }
}

export async function updateThemeUXAPI(themeUX: Partial<ThemeUXConfig>): Promise<ThemeUXConfig> {
  const res = await authFetch(`${API_BASE}/admin/theme-ux`, {
    method: 'PUT',
    body: JSON.stringify({ themeUX })
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Server returned an invalid response. Please try again.');
  }
  if (!json.success) throw new Error(json.message || 'Failed to update theme and UX configuration');
  return json.data;
}

