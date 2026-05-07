import React, { createContext, useState, useContext } from 'react';

const translations = {
    EN: {
        // Header & Nav
        appTitle: "JobTracker",
        newApp: "New Application",
        settings: "Settings",
        uploadCV: "Upload CV",
        sampleLetter: "Sample Letter",

        // Stats
        total: "Total",
        interview: "Interview",
        pending: "Pending",
        rejected: "Rejected",
        applied: "Applied",

        // Search & Filter
        searchPlaceholder: "Search company or position...",
        allStatus: "All Status",
        new: "New",
        newest: "Newest",
        scoreDesc: "Score: High → Low",
        scoreAsc: "Score: Low → High",
        noJobs: "No applications yet. Add your first job!",
        noResults: "No results found.",

        // Settings Modal
        aiSettings: "AI Settings",
        provider: "Provider",
        aiModel: "AI Model",
        apiKey: "API Key",
        apiKeyPlaceholder: "Enter your API key",
        apiKeyNote: "Stored locally in your browser only.",
        savePath: "Word File Save Path",
        savePathPlaceholder: "e.g: C:\\Users\\User\\Downloads",
        cancel: "Cancel",
        save: "Save",
        settingsSaved: "Settings saved.",
        cvUploaded: "CV uploaded successfully!",
        cvFailed: "CV upload failed.",
        sampleUploaded: "Sample letter uploaded!",
        sampleFailed: "Upload failed.",

        // Job Detail Panel — empty state
        selectJobPrompt: "Select a job application",
        selectJobHint: "Click on a card from the list to view details, AI analysis, and generate a motivation letter.",

        // Job Detail Panel — header
        unknown: "Unknown",
        noLocation: "Location unknown",
        today: "Today",
        yesterday: "Yesterday",
        daysAgo: "days ago",
        viewPosting: "View Posting ↗",
        deleteJob: "Delete Application",
        confirmDelete: "Are you sure you want to delete this application?",
        deleteFailed: "Error deleting.",
        updateFailed: "Error saving changes.",

        // AI Analysis section
        aiAnalysis: "AI Compatibility Analysis",
        matchText: "MATCH",
        noAnalysis: "No AI analysis available.",
        langReq: "Language Requirements:",
        langExplanation: "Language Assessment",
        notSpecified: "Not specified",

        // Letter Studio
        modLetterStudio: "Motivation Letter Studio",
        providerModel: "Model",
        draftPlaceholder: "Add notes, specific points to highlight, or reference names to include...",
        generating: "Generating...",
        createMotivation: "Generate Letter",
        downloading: "Saving...",
        downloadWord: "Download Word (.docx)",
        copyLetter: "Copy",
        copied: "Copied!",
        letterError: "Generation failed. Make sure your CV is uploaded and API key is set.",
        noPathError: "Please set a Save Path in Settings first.",
        letterSaved: "Saved: ",
        downloadError: "Save error: ",
        noLetterYet: "No letter generated yet.",

        // Apify Modal
        apifySettings: "Apify LinkedIn Integration",
        apifyToken: "Apify API Token",
        apifyTokenPlaceholder: "apify_api_...",
        apifyTaskId: "Task ID",
        apifyTaskIdPlaceholder: "username~task-name",
        apifyScheduleSection: "Daily Schedule",
        apifyScheduleEnabled: "Enable daily auto-fetch",
        apifyTime: "Fetch time (24h)",
        apifyLlmSection: "LLM Settings (for auto-analysis)",
        apifyFetchNow: "Fetch Now",
        apifyFetching: "Fetching... (may take a few minutes)",
        apifyLastRun: "Last run:",
        apifyNeverRun: "Never run",
        apifyImported: "imported",
        apifySkipped: "skipped",
        apifyConfigMissing: "Token and Task ID are required.",
        apifySaved: "Apify settings saved.",
        apifyBtn: "Apify",

        // Job Form
        newApplication: "New Application",
        fetchFromUrl: "Auto-fill from URL",
        fetchingUrl: "Fetching...",
        fetchUrlSuccess: "Job details filled in automatically.",
        fetchUrlError: "Could not fetch from URL. Paste the description manually.",
        jobUrl: "Job Posting URL",
        jobUrlPlaceholder: "https://linkedin.com/jobs/...",
        jobDesc: "Job Description",
        jobDescPlaceholder: "Paste the full job description here...",
        dateAdded: "Date added:",
        analyzing: "Analyzing with AI...",
        saveAndAnalyze: "Save & Analyze",
        formError: "Error adding application.",
        urlRequired: "Job URL is required.",
        descRequired: "Job description is required.",
    },
    DE: {
        // Header & Nav
        appTitle: "JobTracker",
        newApp: "Neue Bewerbung",
        settings: "Einstellungen",
        uploadCV: "Lebenslauf",
        sampleLetter: "Musterbrief",

        // Stats
        total: "Gesamt",
        interview: "Interview",
        pending: "Ausstehend",
        rejected: "Abgelehnt",
        applied: "Beworben",

        // Search & Filter
        searchPlaceholder: "Firma oder Position suchen...",
        allStatus: "Alle Status",
        new: "Neu",
        newest: "Neueste",
        scoreDesc: "Passung: Hoch → Niedrig",
        scoreAsc: "Passung: Niedrig → Hoch",
        noJobs: "Noch keine Bewerbungen. Füge deine erste hinzu!",
        noResults: "Keine Ergebnisse gefunden.",

        // Settings Modal
        aiSettings: "KI-Einstellungen",
        provider: "Anbieter",
        aiModel: "KI-Modell",
        apiKey: "API-Schlüssel",
        apiKeyPlaceholder: "API-Schlüssel eingeben",
        apiKeyNote: "Wird nur lokal im Browser gespeichert.",
        savePath: "Speicherpfad für Word-Dateien",
        savePathPlaceholder: "z.B.: C:\\Users\\User\\Downloads",
        cancel: "Abbrechen",
        save: "Speichern",
        settingsSaved: "Einstellungen gespeichert.",
        cvUploaded: "Lebenslauf erfolgreich hochgeladen!",
        cvFailed: "Hochladen fehlgeschlagen.",
        sampleUploaded: "Musterbrief hochgeladen!",
        sampleFailed: "Hochladen fehlgeschlagen.",

        // Job Detail Panel — empty state
        selectJobPrompt: "Bewerbung auswählen",
        selectJobHint: "Klicke auf eine Karte in der Liste, um Details, KI-Analyse und das Motivationsschreiben zu sehen.",

        // Job Detail Panel — header
        unknown: "Unbekannt",
        noLocation: "Ort unbekannt",
        today: "Heute",
        yesterday: "Gestern",
        daysAgo: "Tage her",
        viewPosting: "Stellenangebot ↗",
        deleteJob: "Bewerbung löschen",
        confirmDelete: "Diese Bewerbung wirklich löschen?",
        deleteFailed: "Fehler beim Löschen.",
        updateFailed: "Fehler beim Speichern.",

        // AI Analysis section
        aiAnalysis: "KI-Kompatibilitätsanalyse",
        matchText: "PASSUNG",
        noAnalysis: "Keine KI-Analyse verfügbar.",
        langReq: "Sprachanforderungen:",
        langExplanation: "Sprachbewertung",
        notSpecified: "Nicht angegeben",

        // Letter Studio
        modLetterStudio: "Motivationsschreiben-Studio",
        providerModel: "Modell",
        draftPlaceholder: "Notizen, hervorzuhebende Punkte oder Referenznamen hinzufügen...",
        generating: "Wird erstellt...",
        createMotivation: "Schreiben generieren",
        downloading: "Wird gespeichert...",
        downloadWord: "Word herunterladen (.docx)",
        copyLetter: "Kopieren",
        copied: "Kopiert!",
        letterError: "Generierung fehlgeschlagen. Lebenslauf hochgeladen und API-Schlüssel gesetzt?",
        noPathError: "Bitte zuerst einen Speicherpfad in den Einstellungen festlegen.",
        letterSaved: "Gespeichert: ",
        downloadError: "Speicherfehler: ",
        noLetterYet: "Noch kein Schreiben generiert.",

        // Apify Modal
        apifySettings: "Apify LinkedIn Integration",
        apifyToken: "Apify API Token",
        apifyTokenPlaceholder: "apify_api_...",
        apifyTaskId: "Task ID",
        apifyTaskIdPlaceholder: "username~task-name",
        apifyScheduleSection: "Täglicher Zeitplan",
        apifyScheduleEnabled: "Täglichen Auto-Abruf aktivieren",
        apifyTime: "Abrufzeit (24h)",
        apifyLlmSection: "LLM-Einstellungen (für Auto-Analyse)",
        apifyFetchNow: "Jetzt abrufen",
        apifyFetching: "Abrufen... (kann einige Minuten dauern)",
        apifyLastRun: "Letzter Abruf:",
        apifyNeverRun: "Noch nie ausgeführt",
        apifyImported: "importiert",
        apifySkipped: "übersprungen",
        apifyConfigMissing: "Token und Task ID sind erforderlich.",
        apifySaved: "Apify-Einstellungen gespeichert.",
        apifyBtn: "Apify",

        // Job Form
        newApplication: "Neue Bewerbung",
        fetchFromUrl: "Automatisch von URL laden",
        fetchingUrl: "Wird geladen...",
        fetchUrlSuccess: "Stellendaten automatisch ausgefüllt.",
        fetchUrlError: "URL konnte nicht geladen werden. Beschreibung manuell einfügen.",
        jobUrl: "Stellenangebot-URL",
        jobUrlPlaceholder: "https://linkedin.com/jobs/...",
        jobDesc: "Stellenbeschreibung",
        jobDescPlaceholder: "Vollständige Stellenbeschreibung hier einfügen...",
        dateAdded: "Hinzugefügt am:",
        analyzing: "KI analysiert...",
        saveAndAnalyze: "Speichern & Analysieren",
        formError: "Fehler beim Hinzufügen.",
        urlRequired: "Stellen-URL ist erforderlich.",
        descRequired: "Stellenbeschreibung ist erforderlich.",
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'EN');

    const toggleLanguage = () => {
        const newLang = lang === 'EN' ? 'DE' : 'EN';
        setLang(newLang);
        localStorage.setItem('app_lang', newLang);
    };

    const t = (key) => translations[lang][key] || key;

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
