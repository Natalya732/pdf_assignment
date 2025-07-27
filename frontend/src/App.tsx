import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { APP_ROUTES } from "./shared/constants/navigation";
import Notebook from "./features/notebook/components/entry/Notebook";
import ReactQueryProvider from "./shared/context/ReactQueryProvider";
import { Toaster } from "./shared/components/ui/sonner";

function App() {
  return (
    <ReactQueryProvider>
      <div id="app" className="h-screen w-screen">
        <Toaster mobileOffset={8} offset={{ right: 16 }} duration={4 * 1000} />
        <Router>
          <Routes>
            <Route path={APP_ROUTES.HOME} element={<Notebook />} />
          </Routes>
        </Router>
      </div>
    </ReactQueryProvider>
  );
}

export default App;
