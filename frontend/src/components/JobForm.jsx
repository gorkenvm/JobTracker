import React, { useState } from 'react';
import { Link, FileText, Loader2, Wand2 } from 'lucide-react';
import { createJob, apifyFetchSingleUrl } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function JobForm({ onJobCreated, onClose, provider, apiKey, modelName, addToast }) {
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [errors, setErrors] = useState({});
    const { t, lang } = useLanguage();

    const locale = lang === 'EN' ? 'en-US' : 'de-DE';
    const today = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

    const isValidUrl = (s) => {
        try { new URL(s); return true; } catch { return false; }
    };

    const validate = () => {
        const e = {};
        if (!link.trim()) e.link = t('urlRequired');
        if (!description.trim()) e.desc = t('descRequired');
        return e;
    };

    // Auto-fill description from URL using Apify
    const handleFetchFromUrl = async () => {
        if (!link.trim() || !isValidUrl(link.trim())) {
            setErrors(v => ({ ...v, link: t('urlRequired') }));
            return;
        }
        setFetchingUrl(true);
        setErrors({});
        try {
            const data = await apifyFetchSingleUrl(link.trim());
            if (data.description) {
                setDescription(data.description);
                addToast(t('fetchUrlSuccess'), 'success');
            } else {
                addToast(t('fetchUrlError'), 'error');
            }
        } catch (err) {
            const detail = err.response?.data?.detail || err.message || '';
            addToast(`${t('fetchUrlError')} ${detail}`, 'error');
        } finally {
            setFetchingUrl(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            const newJob = await createJob({
                link: link.trim(),
                description: description.trim(),
                provider,
                api_key: apiKey,
                model_name: modelName,
            });
            onJobCreated(newJob);
        } catch (err) {
            const detail = err.response?.data?.detail || '';
            addToast(`${t('formError')} ${detail}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-7">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6">{t('newApplication')}</h2>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* URL field */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        {t('jobUrl')} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="url"
                                value={link}
                                onChange={e => {
                                    setLink(e.target.value);
                                    if (errors.link) setErrors(v => ({ ...v, link: '' }));
                                }}
                                placeholder={t('jobUrlPlaceholder')}
                                className={`w-full border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
                                    errors.link ? 'border-red-400 bg-red-50' : 'border-slate-300'
                                }`}
                            />
                        </div>

                        {/* Apify fetch button — appears when URL is entered */}
                        {link.trim() && isValidUrl(link.trim()) && (
                            <button
                                type="button"
                                onClick={handleFetchFromUrl}
                                disabled={fetchingUrl}
                                title="Apify ile URL'den iş tanımını otomatik getir"
                                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-sm"
                            >
                                {fetchingUrl
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('fetchingUrl')}</>
                                    : <><Wand2 className="w-3.5 h-3.5" />Apify'dan Getir</>
                                }
                            </button>
                        )}
                    </div>
                    {errors.link && <p className="text-xs text-red-500 mt-1 font-medium">{errors.link}</p>}
                    {link.trim() && isValidUrl(link.trim()) && (
                        <p className="text-xs text-slate-400 mt-1">
                            Apify yapılandırılmışsa "Apify'dan Getir" ile açıklama otomatik dolar.
                        </p>
                    )}
                </div>

                {/* Description field */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        {t('jobDesc')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                        <textarea
                            value={description}
                            onChange={e => {
                                setDescription(e.target.value);
                                if (errors.desc) setErrors(v => ({ ...v, desc: '' }));
                            }}
                            rows={7}
                            placeholder={fetchingUrl ? 'Apify\'dan getiriliyor...' : t('jobDescPlaceholder')}
                            className={`w-full border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-shadow ${
                                errors.desc ? 'border-red-400 bg-red-50' : 'border-slate-300'
                            } ${fetchingUrl ? 'bg-violet-50 border-violet-200' : ''}`}
                        />
                        {fetchingUrl && (
                            <div className="absolute inset-0 flex items-center justify-center bg-violet-50/80 rounded-xl">
                                <div className="flex items-center gap-2 text-violet-700 font-semibold text-sm">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Apify'dan getiriliyor...
                                </div>
                            </div>
                        )}
                    </div>
                    {errors.desc && <p className="text-xs text-red-500 mt-1 font-medium">{errors.desc}</p>}
                </div>

                {/* Date row */}
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-medium">
                    <span>{t('dateAdded')}</span>
                    <span className="text-slate-700 font-bold">{today}</span>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || fetchingUrl}
                    className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm"
                >
                    {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />{t('analyzing')}</>
                        : t('saveAndAnalyze')
                    }
                </button>
            </form>
        </div>
    );
}
