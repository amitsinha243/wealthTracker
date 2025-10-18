import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Assets from "./pages/Assets";
import Expenses from "./pages/Expenses";
import NotFound from "./pages/NotFound";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default App;