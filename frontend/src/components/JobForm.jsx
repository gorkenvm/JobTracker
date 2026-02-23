import React, { useState } from 'react';
import { createJob } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function JobForm({ onJobCreated, provider, apiKey, modelName }) {
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { t, lang } = useLanguage();

    // Get today's date formatted nicely for display
    const locale = lang === 'EN' ? 'en-US' : 'de-DE';
    const today = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newJob = await createJob({ link, description, provider, api_key: apiKey, model_name: modelName });
            onJobCreated(newJob);
            setLink('');
            setDescription('');
        } catch (err) {
            console.error(err);
            alert(t('formError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-slate-800">{t('newApplication')}</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('jobLink')}</label>
                    <input
                        type="url"
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                        placeholder={t('jobLinkPlaceholder')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('jobDesc')}</label>
                    <textarea
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows="6"
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-shadow"
                        placeholder={t('jobDescPlaceholder')}
                    ></textarea>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center text-sm text-slate-500 font-medium">
                    <span>{t('dateAdded')}</span>
                    <span className="text-slate-800">{today}</span>
                </div>

                <div className="pt-2">
                    <button
                        disabled={loading}
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center w-full shadow-md hover:shadow-lg h-12"
                    >
                        {loading ? t('analyzing') : t('saveAndAnalyze')}
                    </button>
                </div>
            </form>
        </div>
    );
}
