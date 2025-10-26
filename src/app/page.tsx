import MoodCanvas from '@/components/mood-canvas';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <MoodCanvas />
    </main>
  );
}
