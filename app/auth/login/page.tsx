import { LoginPanel } from "@/features/workspace/components/login-panel";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;

  return <LoginPanel error={params.error} sent={params.sent === "true"} />;
}
