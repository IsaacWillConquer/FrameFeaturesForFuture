import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../auth/authService";
import { IDLE_WARN_MIN, IDLE_LOGOUT_MIN } from "../../config/appConfig";
import Button from "../ui/Button";

// Logs out after IDLE_LOGOUT_MIN minutes of no activity. Warns first.
export default function IdleGuard() {
  const navigate = useNavigate();
  const lastActive = useRef(Date.now());
  const warned = useRef(false);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    const mark = () => {
      if (!warned.current) lastActive.current = Date.now(); // after the warning, only the button resets it
    };
    events.forEach((e) => window.addEventListener(e, mark));

    const timer = setInterval(async () => {
      const idleMinutes = (Date.now() - lastActive.current) / 60000;
      if (idleMinutes >= IDLE_LOGOUT_MIN) {
        clearInterval(timer);
        await logoutUser();
        navigate("/login");
      } else if (idleMinutes >= IDLE_WARN_MIN && !warned.current) {
        warned.current = true;
        setWarning(true);
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, mark));
    };
  }, [navigate]);

  function stay() {
    lastActive.current = Date.now();
    warned.current = false;
    setWarning(false);
  }

  if (!warning) return null;
  return (
    <div role="alert" className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-black border-t-4 border-yellow-600 p-4 flex flex-wrap items-center gap-4 justify-center">
      <p>You will be logged out soon because you've been inactive.</p>
      <Button onClick={stay} autoFocus>
        Stay logged in
      </Button>
    </div>
  );
}
