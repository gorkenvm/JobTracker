import React, { useState, useEffect } from 'react';
import { updateJobStatus, updateJobDetails, generateLetter, deleteJob, exportLetter } from '../services/api';
import { ChevronDown, ChevronUp, MapPin, Navigation, Trash2, Edit2, Check, Clock } from 'lucide-react';
import { AI_PROVIDERS, AI_MODELS } from '../utils/aiModels';
import { useLanguage } from '../contexts/LanguageContext';

export default function JobCard({ job, onStatusChange, onDelete, provider, apiKey, modelName, downloadPath }) {
    const [draft, setDraft] = useState('');
    const [language, setLanguage] = useState('EN');
    const [letter, setLetter] = useState('');
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const { t } = useLanguage();

    // Edit logic
    const [isEditing, setIsEditing] = useState(false);
    const [editCompany, setEditCompany] = useState(job.company || '');
    const [editTitle, setEditTitle] = useState(job.title || '');

    // Motivation letter model config
    const [localModelName, setLocalModelName] = useState(modelName);

    useEffect(() => {
        setLocalModelName(modelName);
    }, [modelName]);

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            const updated = await updateJobStatus(job.id, newStatus);
            onStatusChange(updated);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveDetails = async (e) => {
        e.stopPropagation();
        try {
            const updated = await updateJobDetails(job.id, editTitle, editCompany);
            onStatusChange(updated);
            setIsEditing(false);
        } catch (err) {
            alert(t('updateFailed'));
        }
    };

    const handleGenerateLetter = async () => {
        setGenerating(true);
        try {
            const res = await generateLetter(job.id, language, draft, provider, apiKey, localModelName);
            setLetter(res.letter);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || "Unknown error.";
            alert(`${t('letterError')}\n\n${errorMsg}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleExportLetter = async () => {
        if (!downloadPath) {
            alert(t('noPathError'));
            return;
        }
        if (!letter.trim()) return;

        setExporting(true);
        try {
            const res = await exportLetter(letter, job.company, downloadPath);
            if (res.saved_path) {
                alert(`${t('letterSaved')}${res.saved_path}`);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || "Unknown error";
            alert(`${t('downloadError')} ${errorMsg}`);
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm(t('confirmDelete'))) {
            try {
                await deleteJob(job.id);
                onDelete(job.id);
            } catch (err) {
                alert(t('deleteFailed'));
            }
        }
    };

    // Styling logic based on status and score directly matching the image
    const getScoreStyle = (score) => {
        if (score === null || score === undefined) return 'bg-slate-400';
        if (score >= 80) return 'bg-[#10b981]'; // Emerald equivalent to image
        if (score >= 50) return 'bg-amber-500';
        return 'bg-[#94a3b8]'; // Grey for low scores
    };
    const scoreColor = getScoreStyle(job.score);

    // Status badges matching image
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'başvuruldu':
            case 'applied':
                return 'bg-[#f0f9ff] text-[#0ea5e9]'; // Light blue
            case 'mülakat':
            case 'interview':
                return 'bg-[#faf5ff] text-[#9333ea]'; // Light purple
            case 'reddedildi':
            case 'rejected':
                return 'bg-[#fef2f2] text-[#ef4444]'; // Light red
            case 'yeni':
            case 'new':
            default:
                return 'bg-[#f0fdf4] text-[#22c55e]'; // Light green
        }
    };

    const getRelativeDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return t('today');
        if (diff === 1) return t('yesterday');
        return `${diff} ${t('daysAgo')}`;
    };

    const displayStatus = {
        'Yeni': t('new'),
        'New': t('new'),
        'Başvuruldu': t('applied'),
        'Applied': t('applied'),
        'Mülakat': t('interview'),
        'Interview': t('interview'),
        'Reddedildi': t('rejected'),
        'Rejected': t('rejected')
    }[job.status] || job.status;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden transition-all hover:shadow-md mb-2">
            {/* Collapsed View matching Image exactly */}
            <div className="p-5 flex items-center justify-between gap-6 cursor-pointer" onClick={() => setExpanded(!expanded)}>

                {/* Score Box */}
                <div className={`shrink-0 w-20 h-20 rounded-2xl ${scoreColor} text-white flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-colors`}>
                    <span className="text-[11px] font-bold tracking-widest opacity-95 mb-0.5">{t('matchText')}</span>
                    <span className="text-2xl font-black">{job.score !== null ? job.score : '-'}%</span>
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5" onClick={(e) => { if (isEditing) e.stopPropagation(); }}>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <input autoFocus value={editCompany} onChange={e => setEditCompany(e.target.value)} className="text-xl font-extrabold text-[#1e293b] uppercase truncate border-b border-indigo-300 focus:outline-none bg-indigo-50/50 px-1 w-full max-w-xs" />
                        ) : (
                            <h3 className="text-xl font-extrabold text-[#1e293b] uppercase truncate">{job.company || t('unknown')}</h3>
                        )}
                        {!isEditing && (
                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="text-gray-300 hover:text-indigo-500 transition-colors p-1" title={t('edit')}>
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-[#6366f1] font-bold truncate text-[15px] border-b border-indigo-300 focus:outline-none bg-indigo-50/50 px-1 w-full max-w-xs" />
                            <button onClick={handleSaveDetails} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-1 rounded transition-colors" title={t('save')}>
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <p className="text-[#6366f1] font-bold truncate text-[15px]">{job.title || t('unknown')}</p>
                    )}

                    <div className="flex items-center gap-5 text-xs font-semibold text-[#94a3b8] mt-1">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {getRelativeDate(job.created_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {job.location || t('noLocation')}
                        </span>
                    </div>
                </div>

                {/* Right side status and toggle */}
                <div className="flex items-center gap-6 shrink-0 relative pr-2">
                    <div className={`px-5 py-2 rounded-xl font-bold text-sm tracking-wide select-none ${getStatusStyle(job.status)}`}>
                        {displayStatus}
                    </div>
                    <button
                        className="text-gray-300 hover:text-gray-500 rounded-full transition-colors hidden sm:block"
                    >
                        {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </button>
                    {/* Ghost overlay to capture clicks nicely */}
                    <div className="absolute inset-0 z-10" />
                </div>
            </div>

            {/* Expanded View for AI / DB modifications */}
            {expanded && (
                <div className="px-7 pb-7 pt-4 border-t border-gray-100 bg-slate-50/30">
                    <div className="flex justify-between items-center mb-5">
                        <h4 className="font-extrabold text-slate-800">{t('detailsAI')}</h4>
                        <div className="flex items-center gap-3">
                            <select
                                value={job.status}
                                onChange={handleStatusChange}
                                className="text-sm border border-gray-200 rounded-xl p-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-bold cursor-pointer shadow-sm"
                            >
                                <option value="Yeni">{t('new')}</option>
                                <option value="Başvuruldu">{t('applied')}</option>
                                <option value="Mülakat">{t('interview')}</option>
                                <option value="Reddedildi">{t('rejected')}</option>
                            </select>
                            <button onClick={handleDelete} title={t('deleteJob')} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-sm mb-5">
                        <p className="text-gray-600 mb-4 leading-relaxed font-medium">{job.summary_tr || t('noAnalysis')}</p>
                        <div className="flex flex-wrap gap-2 text-xs font-bold text-indigo-700">
                            <span className="bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100/50">{t('langReq')} {job.language_reqs || t('notSpecified')}</span>
                            {job.link && (
                                <a href={job.link} target="_blank" rel="noreferrer" className="bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100/50 px-3 py-1.5 rounded-lg ml-auto transition-colors">
                                    {t('goToLink')}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="font-extrabold text-slate-800 mb-4 text-sm">{t('modLetterStudio')}</p>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{provider} {t('providerModel')}</label>
                            <select
                                value={localModelName}
                                onChange={e => setLocalModelName(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {AI_MODELS[provider]?.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer"><input type="radio" value="EN" checked={language === 'EN'} onChange={e => setLanguage(e.target.value)} className="cursor-pointer w-4 h-4 accent-indigo-600" /> English</label>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer"><input type="radio" value="DE" checked={language === 'DE'} onChange={e => setLanguage(e.target.value)} className="cursor-pointer w-4 h-4 accent-indigo-600" /> German</label>
                        </div>
                        <textarea rows="3" placeholder={t('draftPlaceholder')} value={draft} onChange={e => setDraft(e.target.value)} className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4 resize-none transition-shadow"></textarea>

                        <button onClick={handleGenerateLetter} disabled={generating} className="bg-slate-900 hover:bg-black text-white text-sm font-bold py-3.5 px-4 rounded-xl transition-colors w-full shadow-md">
                            {generating ? t('generating') : t('createMotivation')}
                        </button>

                        {letter && (
                            <div className="mt-5 animate-in fade-in slide-in-from-top-2">
                                <textarea
                                    value={letter}
                                    onChange={e => setLetter(e.target.value)}
                                    rows="10"
                                    className="w-full border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 font-sans outline-none rounded-xl p-5 text-sm mb-4 text-gray-700 font-medium leading-relaxed shadow-sm transition-shadow"
                                ></textarea>

                                <button
                                    onClick={handleExportLetter}
                                    disabled={exporting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3.5 px-4 rounded-xl transition-colors w-full shadow-md flex items-center justify-center gap-2"
                                >
                                    {exporting ? t('downloading') : t('downloadWord')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
