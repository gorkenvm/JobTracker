import React, { createContext, useState, useContext } from 'react';

const translations = {
    EN: {
        // App.jsx
        appTitle: "JobTracker",
        settings: "Settings",
        uploadCV: "Upload CV",
        sampleLetter: "Sample Letter",
        newApp: "New Application",
        searchPlaceholder: "Search company or position...",
        total: "Total",
        interview: "Interview",
        pending: "Pending",
        rejected: "Rejected",
        allStatus: "All (Status)",
        new: "New",
        applied: "Applied",
        newest: "Newest",
        scoreDesc: "Match: High → Low",
        scoreAsc: "Match: Low → High",
        noJobs: "No applications yet. Start tracking!",
        noResults: "No results found.",
        aiSettings: "AI Settings",
        provider: "Provider",
        aiModel: "AI Model",
        apiKey: "API Key",
        apiKeyPlaceholder: "Enter your API key",
        apiKeyNote: "This key is only saved locally (localStorage).",
        savePath: "Save Path 4 Motivation Letters (Word)",
        savePathPlaceholder: "e.g: C:\\Users\\User\\Downloads",
        cancel: "Cancel",
        save: "Save",
        settingsSaved: "Settings saved.",
        cvUploaded: "CV Uploaded successfully!",
        cvFailed: "CV Upload failed.",
        sampleUploaded: "Sample Letter uploaded successfully!",
        sampleFailed: "Upload failed.",

        // JobCard.jsx
        unknown: "Unknown",
        noLocation: "Location Not Specified",
        today: "Today",
        yesterday: "Yesterday",
        daysAgo: "days ago",
        detailsAI: "Details & AI Analysis",
        deleteJob: "Delete Job",
        noAnalysis: "No analysis available.",
        langReq: "Language Target:",
        notSpecified: "Not specified",
        goToLink: "Go to Job Link ↗",
        modLetterStudio: "Motivation Letter Studio",
        modelProvider: "Model Provider",
        modelToUse: "Model to Use",
        draftPlaceholder: "Your draft notes or points to highlight...",
        generating: "✨ Generating...",
        createMotivation: "✨ Create motivation",
        downloading: "Downloading...",
        downloadWord: "📥 Download (Word)",
        confirmDelete: "Are you sure you want to completely delete this job?",
        deleteFailed: "Error deleting job.",
        updateFailed: "Error updating info.",
        letterError: "Error generating letter:\n\nMake sure your CV is uploaded and API key is correct.",
        noPathError: "Please set a Download Path in the Settings menu.",
        letterSaved: "Letter saved as Word file:\n",
        downloadError: "Error during download:",
        matchText: "MATCH",
        providerModel: "Model",

        // JobForm.jsx
        newApplication: "New Application",
        jobLink: "Job Link (Optional)",
        jobLinkPlaceholder: "https://linkedin.com/jobs/...",
        jobDesc: "Job Description",
        jobDescPlaceholder: "Paste the job description here... (Required for AI analysis)",
        dateAdded: "Date Added:",
        analyzing: "AI Analyzing...",
        saveAndAnalyze: "Save and Analyze",
        formError: "Error adding application."
    },
    DE: {
        // App.jsx
        appTitle: "JobTracker",
        settings: "Einstellungen",
        uploadCV: "Lebenslauf",
        sampleLetter: "Musterbrief",
        newApp: "Neue Bewerbung",
        searchPlaceholder: "Firma oder Position suchen...",
        total: "Gesamt",
        interview: "Interview",
        pending: "Ausstehend",
        rejected: "Abgelehnt",
        allStatus: "Alle (Status)",
        new: "Neu",
        applied: "Beworben",
        newest: "Neueste",
        scoreDesc: "Passung: Hoch → Niedrig",
        scoreAsc: "Passung: Niedrig → Hoch",
        noJobs: "Noch keine Bewerbungen. Starte das Tracking!",
        noResults: "Keine Ergebnisse gefunden.",
        aiSettings: "KI-Einstellungen",
        provider: "Anbieter",
        aiModel: "KI-Modell",
        apiKey: "API-Schlüssel",
        apiKeyPlaceholder: "API-Schlüssel eingeben",
        apiKeyNote: "Dieser Schlüssel wird nur lokal gespeichert (localStorage).",
        savePath: "Speicherpfad f. Motivationsschreiben (Word)",
        savePathPlaceholder: "z.B.: C:\\Users\\User\\Downloads",
        cancel: "Abbrechen",
        save: "Speichern",
        settingsSaved: "Einstellungen gespeichert.",
        cvUploaded: "Lebenslauf erfolgreich hochgeladen!",
        cvFailed: "Hochladen des Lebenslaufs fehlgeschlagen.",
        sampleUploaded: "Musterbrief erfolgreich hochgeladen!",
        sampleFailed: "Hochladen fehlgeschlagen.",

        // JobCard.jsx
        unknown: "Unbekannt",
        noLocation: "Ort nicht angegeben",
        today: "Heute",
        yesterday: "Gestern",
        daysAgo: "Tage her",
        detailsAI: "Details & KI-Analyse",
        deleteJob: "Bewerbung löschen",
        noAnalysis: "Keine Analyse verfügbar.",
        langReq: "Sprachziel:",
        notSpecified: "Nicht angegeben",
        goToLink: "Zum Stellenangebot ↗",
        modLetterStudio: "Motivationsschreiben-Studio",
        modelProvider: "Modellanbieter",
        modelToUse: "Zu verwendendes Modell",
        draftPlaceholder: "Ihre Entwurfsnotizen oder hervorzuhebende Punkte...",
        generating: "✨ Wird erstellt...",
        createMotivation: "✨ Motivation erstellen",
        downloading: "Wird heruntergeladen...",
        downloadWord: "📥 Herunterladen (Word)",
        confirmDelete: "Sind Sie sicher, dass Sie diese Bewerbung vollständig löschen möchten?",
        deleteFailed: "Fehler beim Löschen der Bewerbung.",
        updateFailed: "Fehler beim Aktualisieren der Informationen.",
        letterError: "Fehler beim Erstellen des Schreibens:\n\nStellen Sie sicher, dass Ihr Lebenslauf hochgeladen und der API-Schlüssel korrekt ist.",
        noPathError: "Bitte legen Sie in den Einstellungen einen Download-Ordner (Download Path) fest.",
        letterSaved: "Schreiben als Word-Dokument gespeichert:\n",
        downloadError: "Fehler beim Herunterladen:",
        matchText: "PASSUNG",
        providerModel: "Modell",

        // JobForm.jsx
        newApplication: "Neue Bewerbung",
        jobLink: "Stellenlink (Optional)",
        jobLinkPlaceholder: "https://linkedin.com/jobs/...",
        jobDesc: "Stellenbeschreibung",
        jobDescPlaceholder: "Fügen Sie die Stellenbeschreibung hier ein... (Erforderlich für KI-Analyse)",
        dateAdded: "Hinzugefügt am:",
        analyzing: "KI analysiert...",
        saveAndAnalyze: "Speichern und analysieren",
        formError: "Fehler beim Hinzufügen der Bewerbung."
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

    const t = (key) => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
