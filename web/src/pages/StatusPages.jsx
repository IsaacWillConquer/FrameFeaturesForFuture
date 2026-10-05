import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, ShieldAlert, UserX } from "lucide-react";
import { logoutUser } from "../core/auth/authService";
import Button from "../core/ui/Button";
import Card, { CardBody } from "../core/ui/Card";

function StatusLayout({ icon: Icon, title, message, children }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-3 p-8 text-center">
          <Icon aria-hidden="true" className="h-10 w-10 text-fg-muted" />
          <h1 className="text-xl font-bold text-fg">{title}</h1>
          <p className="text-fg-muted">{message}</p>
          <div className="mt-2">{children}</div>
        </CardBody>
      </Card>
    </div>
  );
}

export function NotFound() {
  return (
    <StatusLayout icon={FileQuestion} title="Page not found" message="We couldn't find the page you were looking for.">
      <Link to="/dashboard" className="text-primary underline">Go to dashboard</Link>
    </StatusLayout>
  );
}

export function Forbidden() {
  return (
    <StatusLayout icon={ShieldAlert} title="No access" message="Your role does not allow this page.">
      <Link to="/dashboard" className="text-primary underline">Go to dashboard</Link>
    </StatusLayout>
  );
}

export function Deactivated() {
  const navigate = useNavigate();
  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }
  return (
    <StatusLayout icon={UserX} title="Account deactivated" message="An administrator turned off this account. Contact them if this is a mistake.">
      <Button onClick={handleLogout}>Log out</Button>
    </StatusLayout>
  );
}
