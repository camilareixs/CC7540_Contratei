import AppShell from '@/components/app-shell'

export default async function CatchAllPage({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params
  return <AppShell path={`/${segments.join('/')}`} />
}
