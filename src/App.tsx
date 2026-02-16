import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Assets from "./pages/Assets";
import Expenses from "./pages/Expenses";
import Trips from "./pages/Trips";
import AIAssistant from "./pages/AIAssistant";
import PhysicalAssets from "./pages/PhysicalAssets";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => (
  <Router>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/physical-assets" element={<ProtectedRoute><PhysicalAssets /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default App;