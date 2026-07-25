import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useLocation } from "react-router-dom";

import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-center px-4">
      <SEO {...pageSeo.notFound} canonicalPath={location.pathname} />
      
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <DotLottieReact
          src="https://lottie.host/e55f39f9-2532-405c-a769-085df4c69483/OmJoix8h6o.lottie"
          loop
          autoplay
          className="h-auto w-full max-w-md"
        />
       
  
      </div>
    </div>
  );
}
