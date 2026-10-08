import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { logAction } from "../core/logger";
import VerificationFallback from "../core/security/VerificationFallback";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";

// A reusable "prove it's you" gate. In a real app you'd show this before a
// sensitive action (changing payout details, deleting an account, etc.).
// Whoever passes gets a short-lived confirmation.
export default function VerifyIdentity() {
  const { user, profile } = useAuth();
  const [verifiedBy, setVerifiedBy] = useState(null);
  const [error, setError] = useState("");

  async function handleVerified(method) {
    setError("");
    setVerifiedBy(method);
    try {
      await logAction(user.uid, "reverify", method);
    } catch {
      /* logging is best-effort */
    }
  }

  return (
    <div>
      <PageHeader title="Re-verify identity" description="Try each method. If one fails, the others still work." />

      <Alert type="info">
        This is the fallback chain: device biometrics, then face, then an authenticator code, then staff help.
        Nobody should ever be locked out.
      </Alert>

      {verifiedBy ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 p-8 text-center">
            <ShieldCheck aria-hidden="true" className="h-10 w-10 text-success" />
            <p className="text-lg font-semibold text-fg">Identity verified</p>
            <Badge variant="success">via {verifiedBy}</Badge>
            <button onClick={() => setVerifiedBy(null)} className="text-sm text-primary underline min-h-11">Verify again</button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Choose a method" />
          <CardBody>
            <Alert>{error}</Alert>
            <VerificationFallback uid={user.uid} name={profile?.name || user.email} email={user.email} onVerified={handleVerified} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
