
import { Settings as SettingsIcon, Accessibility, Volume2 } from "lucide-react";

export default function Settings() {
  return (
    <div className="content-wrap">
      <div className="page-intro">
        <div className="eyebrow">PERSONALISE YOUR EXPERIENCE</div>
        <h1>Settings</h1>
        <p>Manage your learning preferences.</p>
      </div>

      <div className="settings-list">
        <div className="settings-item">
          <div className="settings-item-icon">
            <Accessibility size={21} />
          </div>
          <div>
            <h3>Accessibility</h3>
            <p>Accessibility and display preferences will be available here.</p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-icon">
            <Volume2 size={21} />
          </div>
          <div>
            <h3>Audio preferences</h3>
            <p>Text-to-speech and audio preferences will be available here.</p>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-icon">
            <SettingsIcon size={21} />
          </div>
          <div>
            <h3>Learning preferences</h3>
            <p>Personal learning preferences will be available here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
