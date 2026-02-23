import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getJobs = async () => {
    const res = await axios.get(`${API_URL}/jobs/`);
    return res.data;
};

export const createJob = async (jobData) => {
    // jobData now includes link, description, provider, api_key
    const res = await axios.post(`${API_URL}/jobs/`, jobData);
    return res.data;
};

export const updateJobStatus = async (jobId, status) => {
    const res = await axios.put(`${API_URL}/jobs/${jobId}/status`, { status });
    return res.data;
};

export const updateJobDetails = async (jobId, title, company) => {
    const res = await axios.put(`${API_URL}/jobs/${jobId}/details`, { title, company });
    return res.data;
};

export const deleteJob = async (jobId) => {
    const res = await axios.delete(`${API_URL}/jobs/${jobId}`);
    return res.data;
};

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_URL}/cv/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const getCVStatus = async () => {
    const res = await axios.get(`${API_URL}/cv/status`);
    return res.data;
};

export const uploadSample = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_URL}/sample/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const getSampleStatus = async () => {
    const res = await axios.get(`${API_URL}/sample/status`);
    return res.data;
};

export const generateLetter = async (jobId, language, draft, provider, apiKey, modelName) => {
    const res = await axios.post(`${API_URL}/generate/letter`, {
        job_id: jobId,
        language,
        draft,
        provider: provider,
        api_key: apiKey,
        model_name: modelName
    });
    return res.data;
};

export const exportLetter = async (letterText, companyName, downloadPath) => {
    const res = await axios.post(`${API_URL}/export/letter`, {
        letter_text: letterText,
        company_name: companyName,
        download_path: downloadPath
    });
    return res.data;
};
