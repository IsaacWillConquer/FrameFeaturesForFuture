import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, LogOut, Accessibility, Volume2, VolumeX } from "lucide-react";
import { NAV } from "../../config/appConfig";
import { useAuth } from "../auth/AuthProvider";
import { logoutUser } from "../auth/authService";
import { useNotifications } from "../notifications/useNotifications";
import { speak, stopSpeaking } from "../../adapters/speechService";
import { useA11y } from "../a11y/A11yProvider";
import Dropdown from "../ui/Dropdown";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

export default function Topbar({ onMenuClick }) {
  const { user, profile, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useNotifications(user?.uid);
  const unread = notifications.filter((n) => !n.read).length;
  const { prefs } = useA11y();
  const [readingPage, setReadingPage] = useState(false);

  const navItem = [...NAV].sort((a, b) => b.to.length - a.to.length).find((n) => location.pathname.startsWith(n.to));
  const title = navItem?.label || "Dashboard";

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

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 print:hidden">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onMenuClick} aria-label="Open menu" className="rounded-md p-2 text-fg-muted hover:bg-surface-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-fg">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <Link
          to="/notifications"
          aria-label={`Notifications, ${unread} unread`}
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
            aria-label={readingPage ? "Stop reading the page" : "Read this page aloud"}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2">
            {readingPage
              ? <VolumeX className="h-5 w-5" aria-hidden="true" />
              : <Volume2 className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}

        <Dropdown
          label="Account menu"
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
            { label: "Accessibility settings", icon: Accessibility, onClick: () => navigate("/accessibility") },
            { label: "Log out", icon: LogOut, danger: true, onClick: handleLogout },
          ]}
        />
      </div>
    </header>
  );
}
