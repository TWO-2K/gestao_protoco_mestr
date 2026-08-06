import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import AnimalDetail from '@/pages/AnimalDetail';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import { AnimalProvider } from '@/lib/AnimalContext';
import { AuthProvider } from '@/lib/AuthContext';
import RequireAuth from '@/lib/RequireAuth';
import RequireAdmin from '@/lib/RequireAdmin';


function App() {

  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <AnimalProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/animal/:id" element={<RequireAuth><AnimalDetail /></RequireAuth>} />
              <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </AnimalProvider>
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
