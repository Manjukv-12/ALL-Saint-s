import { apiClient } from './client';

export interface CertificateTemplate {
  id: string;
  name: string;
  type: string;
  htmlContent: string;
  cssContent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber?: string;
  certificateType: string;
  familyId: string;
  personId?: string;
  templateId: string;
  eventDate?: string;
  priestName?: string;
  pdfPath?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  family?: {
    id: string;
    familyCode: string;
  };
  person?: {
    id: string;
    fullName: string;
  };
  template?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface CreateCertificateRequest {
  familyId: string;
  templateId: string;
  certificateType: string;
  personId?: string;
  eventDate?: string;
  priestName?: string;
  metadata?: any;
}

export interface PreviewCertificateRequest {
  templateId: string;
  familyId: string;
  personId?: string;
  certificateType: string;
  eventDate?: string;
  priestName?: string;
  metadata?: any;
}

export const certificatesApi = {
  async getCertificates(familyId?: string, personId?: string) {
    const params = new URLSearchParams();
    if (familyId) params.append('familyId', familyId);
    if (personId) params.append('personId', personId);
    const query = params.toString();
    return apiClient.get<Certificate[]>(`/api/church-management/certificates${query ? `?${query}` : ''}`);
  },

  async getCertificate(id: string) {
    return apiClient.get<Certificate>(`/api/church-management/certificates/${id}`);
  },

  async createCertificate(data: CreateCertificateRequest) {
    return apiClient.post<Certificate>('/api/church-management/certificates', data);
  },

  async previewCertificate(data: PreviewCertificateRequest) {
    return apiClient.post<{ html: string; css: string }>('/api/church-management/certificates/preview', data);
  },

  async generatePDF(certificateId: string) {
    return apiClient.post<{ message: string; format?: 'pdf' | 'html' }>(
      `/api/church-management/certificates/${certificateId}/generate`,
      {}
    );
  },

  certificateFilenameFromResponse(response: Response, certificateId: string): string {
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^";\n]+)"?/i);
    if (match?.[1]) {
      return match[1].trim();
    }
    const format = response.headers.get('X-Certificate-Format');
    const ext = format === 'pdf' ? 'pdf' : 'html';
    return `certificate-${certificateId}.${ext}`;
  },

  async openCertificateForPrint(certificateId: string): Promise<void> {
    const baseUrl = apiClient.getBaseUrl();
    const token =
      typeof window !== 'undefined' ? localStorage.getItem(apiClient.getAuthTokenKey()) : null;
    const response = await fetch(
      `${baseUrl}/api/church-management/certificates/${certificateId}/view`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    if (!response.ok) throw new Error('Failed to open certificate for printing');
    const html = await response.text();
    const win = window.open('', '_blank');
    if (!win) {
      throw new Error('Pop-up blocked — allow pop-ups for this site, then try again');
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  },

  async downloadCertificate(certificateId: string): Promise<'pdf' | 'html'> {
    const baseUrl = apiClient.getBaseUrl();
    const token =
      typeof window !== 'undefined' ? localStorage.getItem(apiClient.getAuthTokenKey()) : null;
    const response = await fetch(
      `${baseUrl}/api/church-management/certificates/${certificateId}/download`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    if (!response.ok) throw new Error('Failed to download certificate');
    const format =
      (response.headers.get('X-Certificate-Format') as 'pdf' | 'html' | null) ?? 'pdf';
    if (format === 'html') {
      await this.openCertificateForPrint(certificateId);
      return 'html';
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.certificateFilenameFromResponse(response, certificateId);
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return 'pdf';
  },

  async deleteCertificate(id: string) {
    return apiClient.delete(`/api/church-management/certificates/${id}`);
  },
};

export const templatesApi = {
  async getTemplates() {
    return apiClient.get<CertificateTemplate[]>('/api/church-management/templates');
  },

  async getTemplate(id: string) {
    return apiClient.get<CertificateTemplate>(`/api/church-management/templates/${id}`);
  },

  async createTemplate(data: {
    name: string;
    type: string;
    htmlContent: string;
    cssContent: string;
    isActive?: boolean;
  }) {
    return apiClient.post<CertificateTemplate>('/api/church-management/templates', data);
  },

  async updateTemplate(id: string, data: {
    name?: string;
    type?: string;
    htmlContent?: string;
    cssContent?: string;
    isActive?: boolean;
  }) {
    return apiClient.put<CertificateTemplate>(`/api/church-management/templates/${id}`, data);
  },

  async deleteTemplate(id: string) {
    return apiClient.delete(`/api/church-management/templates/${id}`);
  },
};

