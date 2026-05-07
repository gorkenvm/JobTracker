import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Clock, Info, Link2 } from 'lucide-react';
import { getApifyConfig, saveApifyConfig, apifyFetchNow } from '../services/api';
import { AI_PROVIDERS, AI_MODELS } from '../utils/aiModels';
import { useLanguage } from '../contexts/LanguageContext';

function parseApifyUrl(url) {
    try {
        const parsed = new URL(url);
        const match = parsed.pathname.match(/\/actor-tasks\/([^/]+)\//);
        const task_id = match ? match[1] : '';
        const token = parsed.searchParams.get('token') || '';
        return { task_id, token, valid: !!(task_id && token) };
    } catch {
        return { task_id: '', token: '', valid: false };
    }
}

function buildApifyUrl(token, task_id) {
    if (!token || !task_id) return '';
    return `https://api.apify.com/v2/actor-tasks/${task_id}/run-sync-get-dataset-items?token=${token}`;
}

export default function ApifyModal({ onClose, addToast, onJobsRefresh }) {
    const { t } = useLanguage();
    const [cfg, setCfg] = useState(null);
    const [apifyUrl, setApifyUrl] = useState('');
    const [parsed, setParsed] = useState({ task_id: '', token: '', valid: false });
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [fetchResult, setFetchResult] = useState(null);
    const pollRef = useRef(null);

    useEffect(() => {
        getApifyConfig().then(data => {
            setCfg(data);
            const url = buildApifyUrl(data.token, data.task_id);
            setApifyUrl(url);
            setParsed({ task_id: data.task_id, token: data.token, valid: !!(data.token && data.task_id) });
        }).catch(() => {});

        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    if (!cfg) {
        return (
            <div className="p-8 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
        );
    }

    const set = (key, val) => setCfg(prev => ({ ...prev, [key]: val }));

    const handleUrlChange = (val) => {
        setApifyUrl(val);
        const p = parseApifyUrl(val);
        setParsed(p);
        if (p.valid) {
            setCfg(prev => ({ ...prev, token: p.token, task_id: p.task_id }));
        }
    };

    const handleSave = async () => {
        if (!parsed.valid) {
            addToast('Geçerli bir Apify URL\'si girin.', 'error');
            return;
        }
        setSaving(true);
        try {
            const settingsApiKey = localStorage.getItem('ai_api_key') || '';
            const payload = { ...cfg, default_api_key: settingsApiKey };
            await saveApifyConfig(payload);
            addToast(t('apifySaved'), 'success');
        } catch (err) {
            addToast(`Hata: ${err.response?.data?.detail || err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const startPolling = (lastRunBefore) => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const fresh = await getApifyConfig();
                if (fresh.last_run !== lastRunBefore) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                    setFetching(false);
                    setCfg(fresh);
                    setFetchResult({
                        imported: fresh.last_imported,
                        skipped: fresh.last_skipped,
                        error: fresh.last_error,
                    });
                    if (fresh.last_error) {
                        addToast(`Hata: ${fresh.last_error}`, 'error');
                    } else {
                        addToast(
                            `${fresh.last_imported} ${t('apifyImported')}, ${fresh.last_skipped} ${t('apifySkipped')}`,
                            fresh.last_imported > 0 ? 'success' : 'info'
                        );
                        if (fresh.last_imported > 0) onJobsRefresh();
                    }
                }
            } catch {}
        }, 5000);
    };

    const handleFetchNow = async () => {
        if (!cfg.token?.trim() || !cfg.task_id?.trim()) {
            addToast(t('apifyConfigMissing'), 'error');
            return;
        }
        try { await saveApifyConfig({ ...cfg, default_api_key: localStorage.getItem('ai_api_key') || '' }); } catch {}

        const lastRunBefore = cfg.last_run;
        setFetching(true);
        setFetchResult(null);
        try {
            await apifyFetchNow();
            addToast('Apify scraper arka planda başlatıldı.', 'info');
            startPolling(lastRunBefore);
        } catch (err) {
            const detail = err.response?.data?.detail || err.message;
            addToast(`Hata: ${detail}`, 'error');
            setFetching(false);
        }
    };

    const formatLastRun = (iso) => {
        if (!iso) return t('apifyNeverRun');
        return new Date(iso).toLocaleString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span>⚙️</span>
                {t('apifySettings')}
            </h2>

            <div className="space-y-4">

                {/* ── Connection ── */}
                <Section title="Bağlantı">
                    <Field label="Apify Task URL">
                        <div className="relative">
                            <Link2 className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                            <textarea
                                value={apifyUrl}
                                onChange={e => handleUrlChange(e.target.value)}
                                placeholder="https://api.apify.com/v2/actor-tasks/username~task-name/run-sync-get-dataset-items?token=apify_api_..."
                                rows={3}
                                className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono resize-none ${parsed.valid ? 'border-emerald-300 bg-emerald-50' : apifyUrl.trim() ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                            />
                        </div>
                        {parsed.valid && (
                            <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-700 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span className="font-semibold">Task:</span>
                                    <span className="font-mono">{parsed.task_id}</span>
                                </div>
                                <div className="flex items-center gap-1.5 pl-5 text-emerald-600">
                                    <span className="font-semibold">Token:</span>
                                    <span className="font-mono">{parsed.token.slice(0, 12)}...{parsed.token.slice(-4)}</span>
                                </div>
                            </div>
                        )}
                        {apifyUrl.trim() && !parsed.valid && (
                            <p className="text-xs text-red-500 mt-1.5">URL geçersiz — Apify task URL'sini olduğu gibi yapıştırın.</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1.5">
                            apify.com → Actor Tasks → görev adına tıkla → API → "Run task synchronously" URL'sini kopyala
                        </p>
                    </Field>
                </Section>

                {/* ── Schedule ── */}
                <Section title={t('apifyScheduleSection')}>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div onClick={() => set('enabled', !cfg.enabled)}
                            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${cfg.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{t('apifyScheduleEnabled')}</span>
                    </label>
                    {cfg.enabled && (
                        <div className="flex items-center gap-3 mt-3">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('apifyTime')}</label>
                                <input
                                    type="time"
                                    value={cfg.schedule_time}
                                    onChange={e => set('schedule_time', e.target.value)}
                                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    )}
                </Section>

                {/* ── LLM Settings ── */}
                <Section title={t('apifyLlmSection')}>
                    {/* API key info banner */}
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-700 mb-2">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                            API anahtarı <strong>Ayarlar</strong> menüsünden okunur.
                            Şu an aktif: <strong>{localStorage.getItem('ai_provider') || 'Gemini'}</strong>
                            {localStorage.getItem('ai_api_key') ? ' ✓ Key mevcut' : ' — ⚠️ Ayarlarda key girilmemiş!'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Provider">
                            <select
                                value={cfg.default_provider}
                                onChange={e => {
                                    set('default_provider', e.target.value);
                                    set('default_model', AI_MODELS[e.target.value][0].id);
                                }}
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {AI_PROVIDERS.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </Field>
                        <Field label="Model">
                            <select
                                value={cfg.default_model}
                                onChange={e => set('default_model', e.target.value)}
                                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {AI_MODELS[cfg.default_provider]?.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        API anahtarı olmadan Apify işleri analiz edilmeden (sadece ham veri olarak) eklenir.
                    </p>
                </Section>

                {/* ── Last Run Status ── */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                        <span className="font-semibold">{t('apifyLastRun')}</span>
                        <span>{formatLastRun(cfg.last_run)}</span>
                    </div>
                    {cfg.last_run && (
                        <div className="flex justify-between text-slate-500">
                            <span>{cfg.last_imported} {t('apifyImported')}, {cfg.last_skipped} {t('apifySkipped')}</span>
                            {cfg.last_error && (
                                <span className="text-red-500 truncate ml-2 max-w-[180px]" title={cfg.last_error}>
                                    {cfg.last_error}
                                </span>
                            )}
                        </div>
                    )}
                    {fetchResult && !fetching && (
                        <div className={`flex items-center gap-1.5 pt-1 font-semibold ${fetchResult.error ? 'text-red-600' : 'text-emerald-600'}`}>
                            {fetchResult.error
                                ? <><AlertCircle className="w-3.5 h-3.5" />{fetchResult.error}</>
                                : <><CheckCircle2 className="w-3.5 h-3.5" />
                                    {fetchResult.imported} {t('apifyImported')}, {fetchResult.skipped} {t('apifySkipped')} / toplam {fetchResult.total}
                                  </>
                            }
                        </div>
                    )}
                </div>

                {fetching && (
                    <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Apify arka planda çalışıyor — scraper boyutuna göre 2-10 dk sürebilir. <strong>Modalı kapatabilirsin.</strong></span>
                    </div>
                )}

                {/* ── Actions ── */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-colors"
                    >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                        onClick={handleFetchNow}
                        disabled={fetching}
                        className="flex-1 py-2.5 text-sm font-bold bg-slate-900 hover:bg-black disabled:bg-slate-500 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {fetching
                            ? <><RefreshCw className="w-4 h-4 animate-spin" />{t('apifyFetching')}</>
                            : <><RefreshCw className="w-4 h-4" />{t('apifyFetchNow')}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                {children}
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
            {children}
        </div>
    );
}
