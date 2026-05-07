import React, { useState, useEffect } from 'react';
import {
    MapPin, ExternalLink, Trash2, Edit2, Check, X,
    Languages, FileText, Copy, CheckCheck, Download
} from 'lucide-react';
import { updateJobStatus, updateJobDetails, generateLetter, deleteJob, exportLetter } from '../services/api';
import { AI_MODELS } from '../utils/aiModels';
import { useLanguage } from '../contexts/LanguageContext';

const STATUS_STYLES = {
    'Yeni':       'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Başvuruldu': 'bg-blue-50 text-blue-700 border-blue-200',
    'Mülakat':    'bg-purple-50 text-purple-700 border-purple-200',
    'Reddedildi': 'bg-red-50 text-red-700 border-red-200',
};

function ScoreRing({ score, label }) {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const filled = score != null ? (score / 100) * circ : 0;
    const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#94a3b8';

    return (
        <div className="relative w-28 h-28 shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
                <circle
                    cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="9"
                    strokeDasharray={circ} strokeDashoffset={circ - filled}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 leading-none">
                    {score ?? '—'}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {label}
                </span>
            </div>
        </div>
    );
}

function getRelativeDate(dateStr, t) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (diff === 0) return t('today');
    if (diff === 1) return t('yesterday');
    return `${diff} ${t('daysAgo')}`;
}

export default function JobDetailPanel({
    job, onJobUpdated, onJobDeleted,
    provider, apiKey, modelName, downloadPath, addToast
}) {
    const { t } = useLanguage();

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editCompany, setEditCompany] = useState(job.company || '');
    const [editTitle, setEditTitle] = useState(job.title || '');

    // Letter studio state
    const [letter, setLetter] = useState(job.motivation_letter || '');
    const [draft, setDraft] = useState('');
    const [language, setLanguage] = useState('EN');
    const [localModel, setLocalModel] = useState(modelName);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => { setLocalModel(modelName); }, [modelName]);

    const handleStatusChange = async (e) => {
        try {
            const updated = await updateJobStatus(job.id, e.target.value);
            onJobUpdated(updated);
        } catch {
            addToast(t('updateFailed'), 'error');
        }
    };

    const handleSaveEdit = async () => {
        try {
            const updated = await updateJobDetails(job.id, editTitle, editCompany);
            onJobUpdated(updated);
            setIsEditing(false);
        } catch {
            addToast(t('updateFailed'), 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditCompany(job.company || '');
        setEditTitle(job.title || '');
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!window.confirm(t('confirmDelete'))) return;
        try {
            await deleteJob(job.id);
            onJobDeleted(job.id);
            addToast(t('deleteJob') + ' ✓', 'success');
        } catch {
            addToast(t('deleteFailed'), 'error');
        }
    };

    const handleGenerateLetter = async () => {
        setGenerating(true);
        try {
            const res = await generateLetter(job.id, language, draft, provider, apiKey, localModel);
            setLetter(res.letter);
        } catch (err) {
            const detail = err.response?.data?.detail || err.message || '';
            addToast(`${t('letterError')} ${detail}`, 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handleExport = async () => {
        if (!downloadPath) { addToast(t('noPathError'), 'error'); return; }
        if (!letter.trim()) return;
        setExporting(true);
        try {
            const res = await exportLetter(letter, job.company, downloadPath);
            addToast(`${t('letterSaved')}${res.saved_path}`, 'success');
        } catch (err) {
            const detail = err.response?.data?.detail || err.message || '';
            addToast(`${t('downloadError')}${detail}`, 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleCopy = async () => {
        if (!letter.trim()) return;
        await navigator.clipboard.writeText(letter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusStyle = STATUS_STYLES[job.status] || 'bg-slate-50 text-slate-600 border-slate-200';

    return (
        <div className="max-w-3xl mx-auto px-8 py-7">

            {/* ── Job Header ── */}
            <div className="flex items-start justify-between gap-4 mb-7">
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                autoFocus
                                value={editCompany}
                                onChange={e => setEditCompany(e.target.value)}
                                className="w-full text-2xl font-extrabold text-slate-800 border-b-2 border-indigo-400 bg-indigo-50/40 px-2 py-1 focus:outline-none rounded-t"
                            />
                            <input
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="w-full text-base font-semibold text-indigo-600 border-b-2 border-indigo-300 bg-indigo-50/40 px-2 py-1 focus:outline-none rounded-t"
                            />
                            <div className="flex gap-2 pt-1">
                                <button onClick={handleSaveEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">
                                    <Check className="w-3.5 h-3.5" />{t('save')}
                                </button>
                                <button onClick={handleCancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                                    <X className="w-3.5 h-3.5" />{t('cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 group">
                                <h2 className="text-2xl font-extrabold text-slate-800 leading-tight uppercase">
                                    {job.company || t('unknown')}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500 transition-all p-1 rounded"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-base font-semibold text-indigo-600 mt-0.5">
                                {job.title || t('unknown')}
                            </p>
                        </>
                    )}

                    {/* Meta row */}
                    {!isEditing && (
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                            {job.location && (
                                <span className="flex items-center gap-1.5 font-medium">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {job.location}
                                </span>
                            )}
                            <span className="text-slate-400 text-xs">
                                {getRelativeDate(job.created_at, t)}
                            </span>
                            {job.link && (
                                <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 font-semibold text-xs transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {t('viewPosting')}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Right actions */}
                {!isEditing && (
                    <div className="flex items-center gap-2 shrink-0">
                        <select
                            value={job.status}
                            onChange={handleStatusChange}
                            className={`text-xs font-bold border rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusStyle}`}
                        >
                            <option value="Yeni">{t('new')}</option>
                            <option value="Başvuruldu">{t('applied')}</option>
                            <option value="Mülakat">{t('interview')}</option>
                            <option value="Reddedildi">{t('rejected')}</option>
                        </select>
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title={t('deleteJob')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* ── AI Analysis Section ── */}
            <Section title={t('aiAnalysis')} icon={<FileText className="w-4 h-4" />}>
                <div className="flex gap-6 items-start">
                    <ScoreRing score={job.score} label={t('matchText')} />
                    <div className="flex-1 min-w-0 space-y-3">
                        {job.summary_tr ? (
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                                {job.summary_tr}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">{t('noAnalysis')}</p>
                        )}

                        {job.language_reqs && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                                    <Languages className="w-3.5 h-3.5" />
                                    {t('langReq')} {job.language_reqs}
                                </span>
                            </div>
                        )}

                        {job.language_explanation && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    {t('langExplanation')}
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed">{job.language_explanation}</p>
                            </div>
                        )}
                    </div>
                </div>
            </Section>

            {/* ── Letter Studio Section ── */}
            <Section title={t('modLetterStudio')} icon={<FileText className="w-4 h-4" />}>
                {/* Config row */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    {/* Language toggle */}
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                        {['EN', 'DE'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLanguage(l)}
                                className={`px-4 py-2 text-xs font-bold transition-colors ${
                                    language === l
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {l === 'EN' ? '🇬🇧 English' : '🇩🇪 Deutsch'}
                            </button>
                        ))}
                    </div>

                    {/* Model selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">{t('providerModel')}:</span>
                        <select
                            value={localModel}
                            onChange={e => setLocalModel(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            {AI_MODELS[provider]?.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Draft textarea */}
                <textarea
                    rows="3"
                    placeholder={t('draftPlaceholder')}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-4 transition-shadow placeholder:text-slate-400"
                />

                {/* Generate button */}
                <button
                    onClick={handleGenerateLetter}
                    disabled={generating}
                    className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-500 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                    {generating ? (
                        <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{t('generating')}</>
                    ) : (
                        <>{t('createMotivation')}</>
                    )}
                </button>

                {/* Letter output */}
                {letter ? (
                    <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivation Letter</p>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                {copied ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-500" />{t('copied')}</> : <><Copy className="w-3.5 h-3.5" />{t('copyLetter')}</>}
                            </button>
                        </div>
                        <textarea
                            value={letter}
                            onChange={e => setLetter(e.target.value)}
                            rows={18}
                            className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-shadow"
                        />
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {exporting ? t('downloading') : t('downloadWord')}
                        </button>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 text-center mt-4">{t('noLetterYet')}</p>
                )}
            </Section>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-indigo-500">{icon}</span>
                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">{title}</h3>
                <div className="flex-1 h-px bg-slate-100 ml-1" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                {children}
            </div>
        </div>
    );
}
