import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, LogOut, Accessibility, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { NAV, hasRole } from "../../config/appConfig";
import { useAuth } from "../auth/AuthProvider";
import { logoutUser } from "../auth/authService";
import { useNotifications } from "../notifications/useNotifications";
import { speak, stopSpeaking, listen } from "../../adapters/speechService";
import { matchCommand } from "../a11y/voiceCommands";
import { useA11y } from "../a11y/A11yProvider";
import { useI18n } from "../i18n/I18nProvider";
import Dropdown from "../ui/Dropdown";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
const canListen = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function Topbar({ onMenuClick }) {
  const { user, profile, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useNotifications(user?.uid);
  const unread = notifications.filter((n) => !n.read).length;
  const { prefs, update } = useA11y();
  const { t, lang, setLang, languages } = useI18n();
  const [readingPage, setReadingPage] = useState(false);
  const [listening, setListening] = useState(false);
  const [commandMsg, setCommandMsg] = useState("");

  const navItem = [...NAV].sort((a, b) => b.to.length - a.to.length).find((n) => location.pathname.startsWith(n.to));
  const title = navItem ? t(navItem.labelKey, navItem.label) : t("nav_dashboard", "Dashboard");

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  // Reads the main content of the current page aloud (Web Speech API).
  function readPage() {
    if (readingPage) {
      stopSpeaking();
      setReadingPage(false);
      return;
    }
    const main = document.getElementById("main");
    if (!main?.innerText) return;
    setReadingPage(true);
    speak(main.innerText, { rate: prefs?.ttsRate, onEnd: () => setReadingPage(false) });
  }

  function runCommand(text) {
    const cmd = matchCommand(text);
    if (!cmd) {
      setCommandMsg(`Heard “${text}” — no matching command.`);
      return;
    }
    if (cmd.type === "navigate") {
      const target = NAV.find((n) => n.to === cmd.to);
      if (target && hasRole(role, target.minRole)) {
        navigate(cmd.to);
        setCommandMsg(`Opening ${t(target.labelKey, target.label)}.`);
      } else {
        setCommandMsg("You don't have access to that page.");
      }
      return;
    }
    if (cmd.type === "logout") { handleLogout(); return; }
    if (cmd.type === "readPage") { readPage(); setCommandMsg("Reading the page."); return; }
    if (cmd.type === "stopRead") { stopSpeaking(); setReadingPage(false); setCommandMsg("Stopped."); return; }
    if (cmd.type === "toggleDark") { update({ dark: !prefs?.dark }); setCommandMsg("Toggled dark mode."); return; }
    if (cmd.type === "toggleContrast") { update({ contrast: !prefs?.contrast }); setCommandMsg("Toggled high contrast."); return; }
  }

  function toggleVoice() {
    if (listening) return;
    setCommandMsg("Listening...");
    const rec = listen(
      (text) => { setListening(false); runCommand(text); },
      () => { setListening(false); setCommandMsg("Could not hear that. Try again."); }
    );
    if (!rec) { setCommandMsg("Voice commands need Chrome or Edge over HTTPS."); return; }
    rec.onend = () => setListening(false);
    setListening(true);
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 print:hidden">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onMenuClick} aria-label={t("topbar_open_menu", "Open menu")} className="rounded-md p-2 text-fg-muted hover:bg-surface-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-fg">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label={t("language", "Language")}
          className="hidden rounded-lg border border-border bg-surface px-2 py-1 text-sm text-fg min-h-11 sm:block"
        >
          {Object.entries(languages).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>

        <Link
          to="/notifications"
          aria-label={`${t("nav_notifications", "Notifications")}, ${unread}`}
          className="relative rounded-lg p-2 min-h-11 min-w-11 inline-flex items-center justify-center text-fg-muted hover:bg-surface-2"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white">
              {unread}
            </span>
          )}
        </Link>

        {canSpeak && (
          <button type="button" onClick={readPage} aria-pressed={readingPage}
            aria-label={readingPage ? t("topbar_stop_read", "Stop reading the page") : t("topbar_read_page", "Read this page aloud")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2">
            {readingPage
              ? <VolumeX className="h-5 w-5" aria-hidden="true" />
              : <Volume2 className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}

        {canListen && (
          <button type="button" onClick={toggleVoice} aria-pressed={listening}
            aria-label={t("topbar_voice_command", "Voice command")} title={t("topbar_voice_command", "Voice command")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2">
            {listening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}

        <Dropdown
          label={t("topbar_account_menu", "Account menu")}
          trigger={
            <span className="flex items-center gap-2">
              <Avatar name={profile?.name || user?.email} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-fg">{profile?.name || user?.email}</span>
                <Badge variant="neutral">{role}</Badge>
              </span>
            </span>
          }
          items={[
            { label: t("topbar_accessibility", "Accessibility settings"), icon: Accessibility, onClick: () => navigate("/accessibility") },
            { label: t("topbar_logout", "Log out"), icon: LogOut, danger: true, onClick: handleLogout },
          ]}
        />
      </div>

      <p className="sr-only" role="status" aria-live="polite">{commandMsg}</p>
      {commandMsg && (
        <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 rounded-b-lg bg-surface-2 px-3 py-1 text-xs text-fg-muted shadow">
          {commandMsg}
        </span>
      )}
    </header>
  );
}
