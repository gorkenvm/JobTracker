import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getJobs, uploadCV, getCVStatus, uploadSample, getSampleStatus } from './services/api';
import JobCard from './components/JobCard';
import JobDetailPanel from './components/JobDetailPanel';
import JobForm from './components/JobForm';
import ApifyModal from './components/ApifyModal';
import Toast, { useToast } from './components/Toast';
import {
    Settings, Plus, Search, Layers, Eye, EyeOff, Folder,
    Filter, ArrowUpDown, BarChart3, Clock, CheckCircle2,
    XCircle, FileText, Briefcase, Database
} from 'lucide-react';
import { AI_PROVIDERS, AI_MODELS } from './utils/aiModels';
import { useLanguage } from './contexts/LanguageContext';

const FLAG_EN = (
    <svg width="20" height="14" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
        <clipPath id="s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
        <clipPath id="t"><path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z" /></clipPath>
        <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
    </svg>
);

const FLAG_DE = (
    <svg width="20" height="14" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
        <rect width="3" height="2" fill="#000" />
        <rect width="3" height="1.333" y="0.666" fill="#D00000" />
        <rect width="3" height="0.666" y="1.333" fill="#FFCE00" />
    </svg>
);

const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 360;

export default function App() {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [hasCV, setHasCV] = useState(false);
    const [hasSample, setHasSample] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isApifyOpen, setIsApifyOpen] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const [provider, setProvider] = useState(localStorage.getItem('ai_provider') || 'Gemini');
    const [apiKey, setApiKey] = useState(localStorage.getItem('ai_api_key') || '');
    const [modelName, setModelName] = useState(localStorage.getItem('ai_model_name') || 'gemini-1.5-pro');
    const [downloadPath, setDownloadPath] = useState(localStorage.getItem('ai_download_path') || '');

    // Resizable panel
    const [panelWidth, setPanelWidth] = useState(() =>
        Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH,
            parseInt(localStorage.getItem('panel_width') || String(DEFAULT_PANEL_WIDTH))
        ))
    );
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);
    const currentWidth = useRef(panelWidth);

    const { t, lang, toggleLanguage } = useLanguage();
    const { toasts, addToast, dismissToast } = useToast();

    // Drag handlers
    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging.current) return;
            const delta = e.clientX - startX.current;
            const w = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth.current + delta));
            currentWidth.current = w;
            setPanelWidth(w);
        };
        const handleUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            localStorage.setItem('panel_width', String(currentWidth.current));
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
    }, []);

    const handleDragStart = (e) => {
        isDragging.current = true;
        startX.current = e.clientX;
        startWidth.current = panelWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    };

    useEffect(() => { fetchData(); }, []);

    const fetchData = useCallback(async () => {
        try {
            const data = await getJobs();
            setJobs(data);
            const cvStatus = await getCVStatus();
            setHasCV(cvStatus.has_cv);
            const sampleStatus = await getSampleStatus();
            setHasSample(sampleStatus.has_sample);
        } catch {
            console.error("Backend bağlantısı kurulamadı.");
        }
    }, []);

    const handleCVUpload = async (e) => {
        if (!e.target.files?.length) return;
        try {
            await (await import('./services/api')).uploadCV(e.target.files[0]);
            setHasCV(true);
            addToast(t('cvUploaded'), 'success');
        } catch {
            addToast(t('cvFailed'), 'error');
        }
        e.target.value = '';
    };

    const handleSampleUpload = async (e) => {
        if (!e.target.files?.length) return;
        try {
            await (await import('./services/api')).uploadSample(e.target.files[0]);
            setHasSample(true);
            addToast(t('sampleUploaded'), 'success');
        } catch {
            addToast(t('sampleFailed'), 'error');
        }
        e.target.value = '';
    };

    const handleJobCreated = (newJob) => {
        setJobs(prev => [newJob, ...prev]);
        setSelectedJobId(newJob.id);
        setIsFormOpen(false);
    };

    const handleJobUpdated = (updatedJob) => {
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    };

    const handleJobDeleted = (jobId) => {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        if (selectedJobId === jobId) setSelectedJobId(null);
    };

    const handleSaveSettings = () => {
        localStorage.setItem('ai_provider', provider);
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('ai_model_name', modelName);
        localStorage.setItem('ai_download_path', downloadPath);
        setIsSettingsOpen(false);
        addToast(t('settingsSaved'), 'success');
    };

    let filteredJobs = jobs.filter(j =>
        (j.company || '').toLowerCase().includes(search.toLowerCase()) ||
        (j.title || '').toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus) filteredJobs = filteredJobs.filter(j => j.status === filterStatus);
    if (sortOrder === 'scoreDesc') filteredJobs.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (sortOrder === 'scoreAsc') filteredJobs.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    else filteredJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const totalJobs = jobs.length;
    const interviewJobs = jobs.filter(j => j.status === 'Mülakat').length;
    const pendingJobs = jobs.filter(j => j.status === 'Yeni' || j.status === 'Başvuruldu').length;
    const rejectedJobs = jobs.filter(j => j.status === 'Reddedildi').length;

    const selectedJob = jobs.find(j => j.id === selectedJobId) ?? null;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-100">

            {/* ── Header ── */}
            <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 z-20">
                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="bg-indigo-600 rounded-lg p-1.5">
                        <Layers className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-base tracking-tight">
                        Job<span className="text-indigo-600">Tracker</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <label className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${hasCV ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}>
                        <FileText className="w-3.5 h-3.5" />
                        {t('uploadCV')}
                        <span className={`w-1.5 h-1.5 rounded-full ${hasCV ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <input type="file" accept=".md,.txt" className="absolute inset-0 opacity-0 cursor-pointer w-full" onChange={handleCVUpload} />
                    </label>

                    <label className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${hasSample ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        <FileText className="w-3.5 h-3.5" />
                        {t('sampleLetter')}
                        <span className={`w-1.5 h-1.5 rounded-full ${hasSample ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <input type="file" accept=".md,.txt" className="absolute inset-0 opacity-0 cursor-pointer w-full" onChange={handleSampleUpload} />
                    </label>

                    <div className="w-px h-5 bg-slate-200 mx-1" />

                    <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors">
                        {lang === 'EN' ? <>{FLAG_DE}<span>DE</span></> : <>{FLAG_EN}<span>EN</span></>}
                    </button>

                    <button onClick={() => setIsApifyOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 transition-colors">
                        <Database className="w-3.5 h-3.5" />
                        {t('apifyBtn')}
                    </button>

                    <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                        <Settings className="w-3.5 h-3.5" />
                        {t('settings')}
                    </button>

                </div>
            </header>

            {/* ── Main Content ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Left Panel ── */}
                <aside
                    className="flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50"
                    style={{ width: panelWidth }}
                >
                    {/* Stats */}
                    <div className="flex-shrink-0 px-3 pt-3 pb-2 grid grid-cols-4 gap-1.5">
                        {[
                            { label: t('total'), value: totalJobs, icon: <BarChart3 className="w-3.5 h-3.5" />, color: 'text-indigo-600 bg-indigo-50' },
                            { label: t('pending'), value: pendingJobs, icon: <Clock className="w-3.5 h-3.5" />, color: 'text-amber-600 bg-amber-50' },
                            { label: t('interview'), value: interviewJobs, icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-purple-600 bg-purple-50' },
                            { label: t('rejected'), value: rejectedJobs, icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-500 bg-red-50' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-xl p-2 border border-slate-200 flex flex-col items-center gap-0.5 shadow-sm">
                                <span className={`rounded-lg p-1 ${s.color}`}>{s.icon}</span>
                                <span className="text-base font-black text-slate-800 leading-none">{s.value}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide leading-none">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Search + Filter */}
                    <div className="flex-shrink-0 px-3 pb-2 space-y-1.5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            <div className="relative flex-1">
                                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-1.5 pl-6 pr-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                                    <option value="">{t('allStatus')}</option>
                                    <option value="Yeni">{t('new')}</option>
                                    <option value="Başvuruldu">{t('applied')}</option>
                                    <option value="Mülakat">{t('interview')}</option>
                                    <option value="Reddedildi">{t('rejected')}</option>
                                </select>
                            </div>
                            <div className="relative flex-1">
                                <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-1.5 pl-6 pr-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                                    <option value="newest">{t('newest')}</option>
                                    <option value="scoreDesc">{t('scoreDesc')}</option>
                                    <option value="scoreAsc">{t('scoreAsc')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5 min-h-0">
                        {filteredJobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-xs text-slate-400 font-medium">{jobs.length === 0 ? t('noJobs') : t('noResults')}</p>
                            </div>
                        ) : (
                            filteredJobs.map(job => (
                                <JobCard key={job.id} job={job} isSelected={job.id === selectedJobId} onClick={() => setSelectedJobId(job.id)} />
                            ))
                        )}
                    </div>

                    {/* New Application — sticky footer */}
                    <div className="flex-shrink-0 px-2 py-2 border-t border-slate-200 bg-slate-50">
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {t('newApp')}
                        </button>
                    </div>
                </aside>

                {/* ── Drag Handle ── */}
                <div
                    onMouseDown={handleDragStart}
                    className="flex-shrink-0 w-1 hover:w-1.5 bg-slate-200 hover:bg-indigo-400 cursor-col-resize transition-all duration-150 group relative"
                    title="Sürükleyerek genişlet/daralt"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="w-0.5 h-3 bg-indigo-400 rounded-full" />
                        <span className="w-0.5 h-3 bg-indigo-400 rounded-full" />
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <main className="flex-1 overflow-y-auto bg-white min-w-0">
                    {selectedJob ? (
                        <JobDetailPanel
                            key={selectedJob.id}
                            job={selectedJob}
                            onJobUpdated={handleJobUpdated}
                            onJobDeleted={handleJobDeleted}
                            provider={provider}
                            apiKey={apiKey}
                            modelName={modelName}
                            downloadPath={downloadPath}
                            addToast={addToast}
                        />
                    ) : (
                        <EmptyState t={t} onNew={() => setIsFormOpen(true)} />
                    )}
                </main>
            </div>

            {/* ── Modals ── */}
            {isFormOpen && (
                <Modal onClose={() => setIsFormOpen(false)}>
                    <JobForm onJobCreated={handleJobCreated} onClose={() => setIsFormOpen(false)} provider={provider} apiKey={apiKey} modelName={modelName} addToast={addToast} />
                </Modal>
            )}

            {isApifyOpen && (
                <Modal onClose={() => setIsApifyOpen(false)} wide>
                    <ApifyModal onClose={() => setIsApifyOpen(false)} addToast={addToast} onJobsRefresh={fetchData} />
                </Modal>
            )}

            {isSettingsOpen && (
                <Modal onClose={() => setIsSettingsOpen(false)}>
                    <div className="p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold text-slate-800 mb-5">{t('aiSettings')}</h2>
                        <div className="space-y-4">
                            <Field label={t('provider')}>
                                <select value={provider} onChange={e => { setProvider(e.target.value); setModelName(AI_MODELS[e.target.value][0].id); }} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    {AI_PROVIDERS.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </Field>
                            <Field label={t('aiModel')}>
                                <select value={modelName} onChange={e => setModelName(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    {AI_MODELS[provider]?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </Field>
                            <Field label={t('apiKey')}>
                                <div className="relative">
                                    <input type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={t('apiKeyPlaceholder')} className="w-full border border-slate-300 rounded-xl p-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <button type="button" onClick={() => setShowApiKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{t('apiKeyNote')}</p>
                            </Field>
                            <Field label={t('savePath')}>
                                <div className="relative">
                                    <input type="text" value={downloadPath} onChange={e => setDownloadPath(e.target.value)} placeholder={t('savePathPlaceholder')} className="w-full border border-slate-300 rounded-xl p-2.5 pl-9 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </Field>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">{t('cancel')}</button>
                                <button onClick={handleSaveSettings} className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">{t('save')}</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            <Toast toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}

function Modal({ children, onClose, wide = false }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full relative ${wide ? 'max-w-xl' : 'max-w-lg'}`} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors z-10">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M11 1L1 11M1 1L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function EmptyState({ t, onNew }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 select-none">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                <Briefcase className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">{t('selectJobPrompt')}</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-6">{t('selectJobHint')}</p>
            <button onClick={onNew} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                {t('newApp')}
            </button>
        </div>
    );
}
