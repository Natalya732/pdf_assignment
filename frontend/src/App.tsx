
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { APP_ROUTES } from "./shared/constants/navigation";
import Notebook from "./features/notebook/components/entry/Notebook";
import ReactQueryProvider from "./shared/context/ReactQueryProvider";
import { Toaster } from "./shared/components/ui/sonner";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { healthCheck } from "./features/notebook/services/notebook";
import { useState, useEffect } from "react";

function App() {
  const [isDelayed, setIsDelayed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const checkServerHealth = async () => {
    setIsChecking(true);
    const isHealthy = await healthCheck();
    if (isHealthy) {
      setIsChecking(false);
    } else {
      if (retryCount < 5) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 3000);
      } else {
        setIsChecking(false);
      }
    }
  };

  useEffect(() => {
    checkServerHealth();
    setTimeout(() => {
      setIsDelayed(true);
    }, 2000);
  }, [retryCount]);

  if (!isDelayed) return null;
  if (isChecking) {
    return (
      <LoadingScreen
        message="Waking up the servers..."
        subMessage="Our free servers are starting up. This usually takes 2-3 minutes. Please wait while we get everything ready for you."
      />
    );
  }

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
