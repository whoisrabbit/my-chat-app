import Chat from './components/Chat';
import Logo from './components/Logo';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Logo />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            InBuddy
          </h1>
        </div>
        <Chat />
      </div>
    </main>
  );
}
