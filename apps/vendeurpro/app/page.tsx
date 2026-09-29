import { Dashboard } from "@/components/dashboard";
import { getVendeurDashboard } from "@vpct/db/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await getVendeurDashboard();
  return (
    <>
      {result.source === "error" ? (
        <p className="mx-auto max-w-[390px] bg-critical-surface px-4 py-3 text-sm text-critical-text">{result.message}</p>
      ) : null}
      <Dashboard data={result.dashboard} fictional={result.fictional} />
    </>
  );
}
