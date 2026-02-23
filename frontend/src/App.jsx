import React, { useState, useEffect } from 'react';
import { getJobs, uploadCV, getCVStatus, uploadSample, getSampleStatus } from './services/api';
import JobForm from './components/JobForm';
import JobCard from './components/JobCard';
import { Settings, Plus, Search, Layers, Eye, EyeOff, Folder, Filter, ArrowUpDown, BarChart3, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { AI_PROVIDERS, AI_MODELS } from './utils/aiModels';
import { useLanguage } from './contexts/LanguageContext';

function App() {
    const [jobs, setJobs] = useState([]);
    const [hasCV, setHasCV] = useState(false);
    const [hasSample, setHasSample] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingSample, setUploadingSample] = useState(false);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [provider, setProvider] = useState(localStorage.getItem('ai_provider') || 'Gemini');
    const [apiKey, setApiKey] = useState(localStorage.getItem('ai_api_key') || '');
    const [modelName, setModelName] = useState(localStorage.getItem('ai_model_name') || 'gemini-1.5-pro');
    const [downloadPath, setDownloadPath] = useState(localStorage.getItem('ai_download_path') || '');

    // New Dashboard State
    const [filterStatus, setFilterStatus] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showApiKey, setShowApiKey] = useState(false);

    const { t, lang, toggleLanguage } = useLanguage();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getJobs();
            setJobs(data);
            const cvStatus = await getCVStatus();
            setHasCV(cvStatus.has_cv);
            const sampleStatus = await getSampleStatus();
            setHasSample(sampleStatus.has_sample);
        } catch (e) {
            console.error("Make sure FastAPI backend is running!", e);
        }
    };

    const handleCVUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            await uploadCV(e.target.files[0]);
            setHasCV(true);
            alert(t('cvUploaded'));
        } catch (err) {
            console.error(err);
            alert(t('cvFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleSampleUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingSample(true);
        try {
            await uploadSample(e.target.files[0]);
            setHasSample(true);
            alert(t('sampleUploaded'));
        } catch (err) {
            console.error(err);
            alert(t('sampleFailed'));
        } finally {
            setUploadingSample(false);
        }
    };

    const handleJobCreated = (newJob) => {
        setJobs([newJob, ...jobs]);
    };

    const handleJobUpdated = (updatedJob) => {
        setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    };

    let filteredJobs = jobs.filter(j =>
        (j.company || '').toLowerCase().includes(search.toLowerCase()) ||
        (j.title || '').toLowerCase().includes(search.toLowerCase())
    );

    if (filterStatus) {
        filteredJobs = filteredJobs.filter(j => j.status === filterStatus);
    }

    if (sortOrder === 'scoreDesc') {
        filteredJobs.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortOrder === 'scoreAsc') {
        filteredJobs.sort((a, b) => (a.score || 0) - (b.score || 0));
    } else if (sortOrder === 'newest') {
        filteredJobs.sort((a, b) => new Date(b.created_at || 0) < new Date(a.created_at || 0) ? -1 : 1);
    }

    // Metrics
    const totalJobs = jobs.length;
    const interviewJobs = jobs.filter(j => j.status === 'Mülakat').length;
    const pendingJobs = jobs.filter(j => j.status === 'Yeni' || j.status === 'Başvuruldu').length;
    const rejectedJobs = jobs.filter(j => j.status === 'Reddedildi').length;

    const handleSaveSettings = () => {
        localStorage.setItem('ai_provider', provider);
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('ai_model_name', modelName);
        localStorage.setItem('ai_download_path', downloadPath);
        setIsSettingsOpen(false);
        alert(t('settingsSaved'));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] font-sans pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 rounded-lg p-2 flex items-center justify-center">
                        <Layers className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        JobTracker <span className="text-indigo-600">Pro</span>
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Language specific toggle */}
                    <button onClick={toggleLanguage} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-bold text-sm bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-200">
                        {lang === 'EN' ? (
                            <>
                                <svg width="20" height="15" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" className="rounded-sm drop-shadow-sm">
                                    <rect width="3" height="2" fill="#000000" />
                                    <rect width="3" height="1.333" y="0.666" fill="#D00000" />
                                    <rect width="3" height="0.666" y="1.333" fill="#FFCE00" />
                                </svg>
                                <span>DE</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="15" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" className="rounded-sm drop-shadow-sm">
                                    <clipPath id="s_en">
                                        <path d="M0,0 v30 h60 v-30 z" />
                                    </clipPath>
                                    <clipPath id="t_en">
                                        <path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z" />
                                    </clipPath>
                                    <g clipPath="url(#s_en)">
                                        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                                        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t_en)" stroke="#C8102E" strokeWidth="4" />
                                        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                                        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                                    </g>
                                </svg>
                                <span>EN</span>
                            </>
                        )}
                    </button>

                    {/* Settings Button */}
                    <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium text-sm hidden sm:block">{t('settings')}</span>
                    </button>

                    {/* CV and Sample Status */}
                    <div className="flex items-center gap-3 text-slate-500 relative group">
                        <span className="font-medium text-sm border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 bg-white shadow-sm cursor-pointer hover:text-slate-800 transition-colors relative">
                            <div className={`w-2 h-2 rounded-full ${hasCV ? 'bg-green-500' : 'bg-red-500'}`} title={hasCV ? "CV Loaded" : "No CV"}></div>
                            {t('uploadCV')}
                            <input type="file" accept=".md,.txt" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCVUpload} title="Upload CV" disabled={uploading} />
                        </span>

                        <span className="font-medium text-sm border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 bg-white shadow-sm cursor-pointer hover:text-slate-800 transition-colors relative">
                            <div className={`w-2 h-2 rounded-full ${hasSample ? 'bg-green-500' : 'bg-red-500'}`} title={hasSample ? "Sample Loaded" : "No Sample Letter"}></div>
                            {t('sampleLetter')}
                            <input type="file" accept=".md,.txt" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleSampleUpload} title="Upload Sample Letter" disabled={uploadingSample} />
                        </span>
                    </div>

                    {/* New Application Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        {t('newApp')}
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto mt-8 px-4">

                {/* Stats Panel */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><BarChart3 className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('total')}</p>
                            <p className="text-2xl font-black text-slate-800">{totalJobs}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><CheckCircle2 className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('interview')}</p>
                            <p className="text-2xl font-black text-slate-800">{interviewJobs}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Clock className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('pending')}</p>
                            <p className="text-2xl font-black text-slate-800">{pendingJobs}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-red-50 p-3 rounded-xl text-red-600"><XCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('rejected')}</p>
                            <p className="text-2xl font-black text-slate-800">{rejectedJobs}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-2xl py-3.5 pl-10 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 cursor-pointer h-full"
                            >
                                <option value="">{t('allStatus')}</option>
                                <option value="Yeni">{t('new')}</option>
                                <option value="Başvuruldu">{t('applied')}</option>
                                <option value="Mülakat">{t('interview')}</option>
                                <option value="Reddedildi">{t('rejected')}</option>
                            </select>
                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-2xl py-3.5 pl-10 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 cursor-pointer h-full"
                            >
                                <option value="newest">{t('newest')}</option>
                                <option value="scoreDesc">{t('scoreDesc')}</option>
                                <option value="scoreAsc">{t('scoreAsc')}</option>
                            </select>
                            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Job List */}
                <div className="flex flex-col gap-4">
                    {filteredJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onStatusChange={handleJobUpdated}
                            onDelete={(id) => setJobs(jobs.filter(j => j.id !== id))}
                            provider={provider}
                            apiKey={apiKey}
                            modelName={modelName}
                            downloadPath={downloadPath}
                        />
                    ))}
                    {filteredJobs.length === 0 && (
                        <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-dashed border-gray-300">
                            {jobs.length === 0 ? t('noJobs') : t('noResults')}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <JobForm
                            onJobCreated={(job) => { handleJobCreated(job); setIsModalOpen(false); }}
                            provider={provider}
                            apiKey={apiKey}
                            modelName={modelName}
                        />
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">{t('aiSettings')}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('provider')}</label>
                                <select
                                    value={provider}
                                    onChange={e => {
                                        const newProv = e.target.value;
                                        setProvider(newProv);
                                        setModelName(AI_MODELS[newProv][0].id);
                                    }}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {AI_PROVIDERS.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('aiModel')}</label>
                                <select
                                    value={modelName}
                                    onChange={e => setModelName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {AI_MODELS[provider]?.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('apiKey')}</label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        placeholder={t('apiKeyPlaceholder')}
                                        className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{t('apiKeyNote')}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('savePath')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={downloadPath}
                                        onChange={e => setDownloadPath(e.target.value)}
                                        placeholder={t('savePathPlaceholder')}
                                        className="w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <Folder className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('cancel')}</button>
                                <button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-xl transition-colors">{t('save')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
