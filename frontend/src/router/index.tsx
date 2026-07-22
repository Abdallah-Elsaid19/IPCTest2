import { Suspense, useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import routes from "./config";

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();

  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
  }, [navigate]);

  return (
    <Suspense
      fallback={(
        <div className="min-h-[45vh] bg-background-50" role="status" aria-label="Loading page">
          <div className="h-0.5 w-full overflow-hidden bg-background-200">
            <div className="h-full w-1/3 animate-pulse bg-primary-500 motion-reduce:animate-none" />
          </div>
        </div>
      )}
    >
      {element}
    </Suspense>
  );
}
