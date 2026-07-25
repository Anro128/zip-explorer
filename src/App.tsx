import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { useExplorerStore } from './store/useExplorerStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const hasLoadedZips = useExplorerStore((s) => s.rootZips.length > 0);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasLoadedZips) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome, Firefox, and legacy browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasLoadedZips]);

  return <AppLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
