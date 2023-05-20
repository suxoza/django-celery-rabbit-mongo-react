import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from './AuthProvider';

const PublicRoute = React.lazy(() => import('./pages/routes/PublicRoute'));
const PrivateRoute = React.lazy(() => import('./pages/routes/PrivateRoute'));

const Login = React.lazy(() => import('./pages/login'));
const Home = React.lazy(() => import('./pages/home'))




function App() {

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <React.Suspense fallback={''}>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
              </Route>

              <Route path="/" element={<PrivateRoute />}>
                <Route path="" element={<Home />} />
              </Route>
            </Routes>
          </React.Suspense>
        </Router>
      </AuthProvider>
    </div>
  )
}

export default App