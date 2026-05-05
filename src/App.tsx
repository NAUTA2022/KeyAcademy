import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThirdwebProvider } from 'thirdweb/react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Events from './pages/Events';
import Courses from './pages/Courses';
import CoursePlayer from './pages/CoursePlayer';
import Help from './pages/Help';
import AdminPanel from './pages/AdminPanel';
import Membership from './pages/Membership';
import { useNotionSync } from './hooks/useNotionSync';

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-14 md:pl-48 transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

/** Runs the Notion sync once when the app mounts. */
function NotionSyncRunner() {
  const { syncing, error } = useNotionSync();
  // Renders nothing — side-effects only.
  // In dev you'll see console logs; errors fall back to localStorage silently.
  void syncing;
  void error;
  return null;
}

export default function App() {
  return (
    <ThirdwebProvider>
      <BrowserRouter>
        {/* Sync Notion → localStorage on every page load */}
        <NotionSyncRunner />

        <Routes>
          {/* Full-screen pages — no Layout wrapper */}
          <Route path="/courses/:id/learn" element={<CoursePlayer />} />
          <Route path="/admin/*" element={<AdminPanel />} />

          {/* All other pages use the Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/membership" element={<Membership />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThirdwebProvider>
  );
}
