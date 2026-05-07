import React from 'react';
import { MapPin, Clock, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const STATUS_DOT = {
    'Yeni':       'bg-emerald-400',
    'Başvuruldu': 'bg-blue-400',
    'Mülakat':    'bg-purple-400',
    'Reddedildi': 'bg-red-400',
};

function getScoreBg(score) {
    if (score == null) return 'bg-slate-300';
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-slate-400';
}

function getRelativeDate(dateStr, t) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (diff === 0) return t('today');
    if (diff === 1) return t('yesterday');
    return `${diff} ${t('daysAgo')}`;
}

export default function JobCard({ job, isSelected, onClick }) {
    const { t } = useLanguage();
    const scoreBg = getScoreBg(job.score);
    const dotColor = STATUS_DOT[job.status] || 'bg-slate-400';

    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all
                ${isSelected
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
                }
            `}
        >
            {/* Score badge */}
            <div className={`
                shrink-0 w-12 h-12 rounded-xl ${scoreBg} text-white
                flex flex-col items-center justify-center shadow-sm
            `}>
                <span className="text-[8px] font-bold opacity-80 leading-none uppercase tracking-wider">
                    {t('matchText')}
                </span>
                <span className="text-base font-black leading-tight">
                    {job.score ?? '-'}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-bold text-slate-800 truncate text-sm leading-snug">
                        {job.company || t('unknown')}
                    </h3>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} title={job.status} />
                    {job.apify_id && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#0A66C2] text-white text-[9px] font-bold tracking-wide shrink-0">
                            <Zap className="w-2.5 h-2.5" />Auto
                        </span>
                    )}
                </div>
                <p className="text-xs text-indigo-600 font-semibold truncate leading-snug">
                    {job.title || t('unknown')}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium">
                    {job.location && (
                        <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                        </span>
                    )}
                    <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {getRelativeDate(job.created_at, t)}
                    </span>
                </div>
            </div>
        </button>
    );
}
