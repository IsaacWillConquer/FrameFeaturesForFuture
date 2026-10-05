import { APP_NAME, APP_TAGLINE } from "../../config/appConfig";
import Card, { CardBody } from "../ui/Card";

// Centered card used by login, register, verify and 2FA screens.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold text-fg">{APP_NAME}</p>
          <p className="text-sm text-fg-muted">{APP_TAGLINE}</p>
        </div>
        <Card>
          <CardBody className="p-6">
            <h1 className="mb-1 text-xl font-bold text-fg">{title}</h1>
            {subtitle && <p className="mb-4 text-sm text-fg-muted">{subtitle}</p>}
            {children}
          </CardBody>
        </Card>
        {footer && <div className="mt-4 text-center text-sm text-fg-muted">{footer}</div>}
      </div>
    </div>
  );
}
