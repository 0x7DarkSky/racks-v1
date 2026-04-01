import { Toaster } from "./components/ui/toaster.jsx";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from "./lib/query-client";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from "./components/ui/UserNotRegisteredError.jsx";
import AppLayout from './components/racks/AppLayout';
import Landing from './pages/Landing';
import ProductFeed from './pages/ProductFeed';
import ProductAction from './pages/ProductAction';
import PostConfirmation from './pages/PostConfirmation';
import Dashboard from './pages/Dashboard';
import Redirect from "./pages/Redirect";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
<Routes>
  <Route path="/" element={<Landing />} />

  {/* 🔥 NOUVELLE ROUTE REDIRECT */}
  <Route path="/r/:productId" element={<Redirect />} />

  <Route element={<AppLayout />}>
    <Route path="/products" element={<ProductFeed />} />
    <Route path="/product/:productId" element={<ProductAction />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>

  <Route path="/posted" element={<PostConfirmation />} />
  <Route path="*" element={<PageNotFound />} />
</Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App