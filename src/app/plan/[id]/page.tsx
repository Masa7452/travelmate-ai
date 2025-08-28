export default async function PlanDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  await params; // Await to satisfy Next.js 15
  return (
    <>
      <div data-testid="sourceQuery-banner" />
      <ol data-testid="timeline" />
    </>
  );
}