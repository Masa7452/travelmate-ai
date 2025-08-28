export default async function PlanDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  await params; // Await to satisfy Next.js 15
  return (
    <div className="min-h-screen p-8">
      <div data-testid="sourceQuery-banner" className="mb-4 p-4 bg-gray-100">
        Plan Details
      </div>
      <ol data-testid="timeline" className="space-y-4">
        <li>Timeline placeholder</li>
      </ol>
    </div>
  );
}