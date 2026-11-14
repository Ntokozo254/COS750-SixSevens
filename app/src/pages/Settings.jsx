import { useEffect, useRef, useState } from "react";
import { Accessibility, CheckCircle2, ExternalLink, GraduationCap, RotateCcw, Square, UserRound, Volume2 } from "lucide-react";

const studyTips = {
  explore: {
    title: "Try a few ways to learn",
    tips: ["Start with the explanation, then trace a search one slot at a time.", "Use guided practice to discover which approaches help you explain the result."],
  },
  visual: {
    title: "Make the probe path visible",
    tips: ["Watch the highlighted slots in Trace a search and sketch the order they are inspected.", "Draw a small hash table and mark the home slot, collisions and wrap-around."],
  },
  aural: {
    title: "Talk through the algorithm",
    tips: ["Enable read-aloud and listen to a lesson explanation at a comfortable pace.", "Explain aloud why a search continues or stops at each inspected slot."],
  },
  "read-write": {
    title: "Put the steps into your own words",
    tips: ["Read the explanation beside the trace and write a short summary of each step.", "Write pseudocode for a search, including its stopping conditions, then check it against the lesson."],
  },
  kinesthetic: {
    title: "Learn by trying the steps",
    tips: ["Use Trace a search to test different keys and predict the next slot before advancing.", "Work through guided practice and use the feedback to revise your next attempt."],
  },
  multimodal: {
    title: "Combine a few approaches",
    tips: ["Pair the table visualisation with the written explanation or read-aloud.", "Trace an example, explain it in your own words, then check your understanding in practice."],
  },
};

function canUseSpeech() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
}

function availableVoices() {
  return canUseSpeech() ? window.speechSynthesis.getVoices() : [];
}

export default function Settings({ preferences, onPreferenceChange, onResetPreferences, storageAvailable }) {
  const [voices, setVoices] = useState(availableVoices);
  const [previewStatus, setPreviewStatus] = useState("");
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewRef = useRef(null);
  const speechSupported = canUseSpeech();
  const guidance = studyTips[preferences.preferredMode] || studyTips.explore;
  const initials = preferences.displayName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase() || "S";

  useEffect(() => {
    if (!speechSupported) return undefined;
    const synthesis = window.speechSynthesis;
    const loadVoices = () => setVoices(synthesis.getVoices());
    synthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      synthesis.removeEventListener("voiceschanged", loadVoices);
      if (previewRef.current) {
        previewRef.current.onend = null;
        previewRef.current.onerror = null;
        synthesis.cancel();
        previewRef.current = null;
      }
    };
  }, [speechSupported]);

  function stopPreview() {
    if (!previewRef.current) return;
    previewRef.current.onend = null;
    previewRef.current.onerror = null;
    previewRef.current = null;
    window.speechSynthesis.cancel();
    setPreviewPlaying(false);
    setPreviewStatus("Preview stopped.");
  }

  function playPreview() {
    if (!speechSupported || !preferences.speechEnabled) return;
    stopPreview();
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance("Welcome to HashLab. Take one concept at a time, explore the examples, and learn at your own pace.");
    utterance.rate = preferences.speechRate;
    const selectedVoice = voices.find((voice) => voice.voiceURI === preferences.speechVoice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.onend = () => {
      if (previewRef.current !== utterance) return;
      previewRef.current = null;
      setPreviewPlaying(false);
      setPreviewStatus("Preview finished.");
    };
    utterance.onerror = (event) => {
      if (previewRef.current !== utterance) return;
      previewRef.current = null;
      setPreviewPlaying(false);
      setPreviewStatus(event.error === "canceled" || event.error === "interrupted" ? "Preview stopped." : "Audio could not play. Try another voice or check your browser's audio settings.");
    };
    previewRef.current = utterance;
    setPreviewPlaying(true);
    setPreviewStatus("Playing the voice preview…");
    try {
      synthesis.resume();
      synthesis.speak(utterance);
    } catch {
      utterance.onend = null;
      utterance.onerror = null;
      previewRef.current = null;
      setPreviewPlaying(false);
      setPreviewStatus("Audio could not play. Try another voice or check your browser's audio settings.");
    }
  }

  function changeAudioPreference(key, value) {
    stopPreview();
    onPreferenceChange(key, value);
  }

  function resetSettings() {
    stopPreview();
    onResetPreferences();
  }

  return (
    <div className="content-wrap settings-page">
      <div className="settings-page-heading">
        <div className="page-intro">
          <div className="eyebrow">PERSONALISE YOUR EXPERIENCE</div>
          <h1>Settings</h1>
          <p>Make HashLab work for the way you like to learn.</p>
        </div>
        <button type="button" className="secondary-button" onClick={resetSettings}><RotateCcw size={15} aria-hidden="true" />Reset preferences</button>
      </div>
      <div className={storageAvailable ? "settings-save-status" : "settings-save-status is-warning"} role="status">
        <CheckCircle2 size={16} aria-hidden="true" />
        <span>{storageAvailable ? "Changes are saved automatically in this browser." : "Changes apply for this session. Browser storage is unavailable, so they may not be kept after you leave."}</span>
      </div>
      <div className="settings-grid">
        <section className="settings-card" aria-labelledby="settings-profile-title">
          <div className="settings-card-header">
            <div className="settings-item-icon blue"><UserRound size={21} aria-hidden="true" /></div>
            <div className="settings-card-copy"><h2 id="settings-profile-title">Profile</h2><p>Personalise your student profile on this device.</p></div>
          </div>
          <div className="settings-profile-preview">
            <div className="settings-profile-avatar" aria-hidden="true">{initials}</div>
            <div className="settings-profile-details"><strong>{preferences.displayName.trim() || "Your student profile"}</strong><span>{preferences.studentNumber.trim() || "COS212 learner"}</span></div>
          </div>
          <div className="settings-fields">
            <label className="settings-field" htmlFor="settings-display-name"><span>Display name</span>
              <input id="settings-display-name" type="text" autoComplete="nickname" maxLength={60} placeholder="How should we address you?" value={preferences.displayName} onChange={(event) => onPreferenceChange("displayName", event.target.value)} />
            </label>
            <label className="settings-field" htmlFor="settings-student-number"><span>Student number <small>(optional)</small></span>
              <input id="settings-student-number" type="text" maxLength={20} autoComplete="off" placeholder="Your student number" value={preferences.studentNumber} onChange={(event) => onPreferenceChange("studentNumber", event.target.value)} />
            </label>
            <p className="settings-help">Your profile is saved in this browser. It does not create an account.</p>
          </div>
        </section>

        <section className="settings-card" aria-labelledby="settings-accessibility-title">
          <div className="settings-card-header">
            <div className="settings-item-icon purple"><Accessibility size={21} aria-hidden="true" /></div>
            <div className="settings-card-copy"><h2 id="settings-accessibility-title">Accessibility</h2><p>Adjust reading and display preferences throughout HashLab.</p></div>
          </div>
          <div className="settings-fields">
            <label className="settings-field" htmlFor="settings-reading-size"><span>Reading text size</span>
              <select id="settings-reading-size" aria-describedby="settings-reading-help" value={preferences.readingSize} onChange={(event) => onPreferenceChange("readingSize", event.target.value)}><option value="standard">Standard</option><option value="large">Large</option><option value="extra-large">Extra large</option></select>
            </label>
            <p id="settings-reading-help" className="settings-help">Adjusts body and lesson text for more comfortable reading.</p>
            <label className="settings-toggle" htmlFor="settings-high-contrast">
              <span className="settings-toggle-copy"><strong>Higher contrast</strong><span>Use darker text and clearer borders for reading.</span></span>
              <input id="settings-high-contrast" type="checkbox" role="switch" checked={preferences.highContrast} onChange={(event) => onPreferenceChange("highContrast", event.target.checked)} />
            </label>
            <label className="settings-toggle" htmlFor="settings-reduce-motion">
              <span className="settings-toggle-copy"><strong>Reduce motion</strong><span>Limit interface animation and transitions. Your device's reduced-motion preference is always respected.</span></span>
              <input id="settings-reduce-motion" type="checkbox" role="switch" checked={preferences.reduceMotion} onChange={(event) => onPreferenceChange("reduceMotion", event.target.checked)} />
            </label>
          </div>
        </section>

        <section className="settings-card" aria-labelledby="settings-audio-title">
          <div className="settings-card-header">
            <div className="settings-item-icon orange"><Volume2 size={21} aria-hidden="true" /></div>
            <div className="settings-card-copy"><h2 id="settings-audio-title">Audio preferences</h2><p>Listen to page explanations with your browser's read-aloud voices.</p></div>
          </div>
          <div className="settings-fields">
            {!speechSupported && <p className="settings-help">Read-aloud is unavailable in this browser. Try a browser with text-to-speech support.</p>}
            <label className="settings-toggle" htmlFor="settings-speech-enabled">
              <span className="settings-toggle-copy"><strong>Enable read-aloud</strong><span>Show playback controls on each page. Audio starts when you press Read page.</span></span>
              <input id="settings-speech-enabled" type="checkbox" role="switch" checked={preferences.speechEnabled} disabled={!speechSupported && !preferences.speechEnabled} onChange={(event) => changeAudioPreference("speechEnabled", event.target.checked)} />
            </label>
            <div className="settings-field-grid">
              <label className="settings-field" htmlFor="settings-speech-voice"><span>Voice</span>
                <select id="settings-speech-voice" value={preferences.speechVoice} disabled={!speechSupported || !preferences.speechEnabled} onChange={(event) => changeAudioPreference("speechVoice", event.target.value)}>
                  <option value="">Browser default</option>
                  {preferences.speechVoice && !voices.some((voice) => voice.voiceURI === preferences.speechVoice) && <option value={preferences.speechVoice}>Saved voice unavailable — browser default will be used</option>}
                  {voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                </select>
              </label>
              <label className="settings-field" htmlFor="settings-speech-rate"><span>Speaking speed</span>
                <select id="settings-speech-rate" value={preferences.speechRate} disabled={!speechSupported || !preferences.speechEnabled} onChange={(event) => changeAudioPreference("speechRate", Number(event.target.value))}>
                  <option value={0.75}>0.75× · Slower</option><option value={1}>1× · Normal</option><option value={1.25}>1.25× · Faster</option><option value={1.5}>1.5× · Fastest</option>
                  {![0.75, 1, 1.25, 1.5].includes(preferences.speechRate) && <option value={preferences.speechRate}>{preferences.speechRate}× · Saved speed</option>}
                </select>
              </label>
            </div>
            <div className="settings-audio-actions">
              <button type="button" className="secondary-button" disabled={!speechSupported || !preferences.speechEnabled} onClick={playPreview}><Volume2 size={15} aria-hidden="true" />Preview voice</button>
              <button type="button" className="secondary-button" disabled={!previewPlaying} onClick={stopPreview}><Square size={13} aria-hidden="true" />Stop preview</button>
            </div>
            <p className="settings-help" role="status">{previewStatus || "Choose a voice and preview it before reading a lesson."}</p>
          </div>
        </section>

        <section className="settings-card" aria-labelledby="settings-learning-title">
          <div className="settings-card-header">
            <div className="settings-item-icon green"><GraduationCap size={21} aria-hidden="true" /></div>
            <div className="settings-card-copy"><h2 id="settings-learning-title">Learning preferences</h2><p>Choose a study focus and set a manageable session goal.</p></div>
          </div>
          <div className="settings-fields">
            <label className="settings-field" htmlFor="settings-preferred-mode"><span>Preferred learning approach</span>
              <select id="settings-preferred-mode" value={preferences.preferredMode} onChange={(event) => onPreferenceChange("preferredMode", event.target.value)}>
                <option value="explore">Still exploring</option><option value="visual">Visual · diagrams and patterns</option><option value="aural">Aural · listening and discussing</option><option value="read-write">Read/write · explanations and notes</option><option value="kinesthetic">Kinesthetic · trying and practising</option><option value="multimodal">Multimodal · a mix of approaches</option>
              </select>
            </label>
            <label className="settings-field" htmlFor="settings-study-goal"><span>Study session goal</span>
              <select id="settings-study-goal" value={preferences.studyGoal} onChange={(event) => onPreferenceChange("studyGoal", Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => (index + 1) * 5).map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select>
            </label>
            <div className="settings-study-tips" aria-live="polite"><h3>{guidance.title}</h3><p>Aim for {preferences.studyGoal} minutes in your next study session.</p><ul>{guidance.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>
            <div className="settings-vark-card">
              <h3>Explore your learning preferences with VARK</h3>
              <p>VARK explores visual, aural, read/write and kinesthetic preferences. Use it to reflect on study strategies and try a mix of approaches as you learn.</p>
              <a className="settings-vark-link" href="https://vark-learn.com/the-vark-questionnaire/" target="_blank" rel="noopener noreferrer">Take the official VARK questionnaire<ExternalLink size={14} aria-hidden="true" /><span className="settings-help">(opens in a new tab)</span></a>
            </div>
          </div>
        </section>
      </div>
      <p className="settings-help">Resetting preferences restores the default settings and keeps your learning progress.</p>
    </div>
  );
}
