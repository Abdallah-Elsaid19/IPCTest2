import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";

const bookingUrl =
  "https://outlook.office.com/book/ComplianceMeetingwithJennifer@kentbusinesscollege.com/s/9nmCp10uMUWen89mOwYSSA2?ismsaljsauthenabled";

const ipcLogoUrl =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png";

export default function BookingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="bg-background-100">
      <SEO {...pageSeo.booking} />
      <section
        aria-labelledby="booking-page-heading"
        className="relative overflow-hidden bg-[#0B0B0B] pb-10 pt-28 sm:pb-12 sm:pt-32 lg:pt-36"
      >
        <div className="absolute inset-0 dot-grid opacity-[0.025]" aria-hidden="true" />
        <div className="container-content relative z-10">
          <Link 
            to="/membership"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-600 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-4 focus-visible:ring-offset-background-100"
          >
            <i className="ri-arrow-left-line" aria-hidden="true" />
            Back to Membership
          </Link>

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <span className="eyebrow mb-4 block text-primary-600">
              Meet the IPC team
            </span>
            <h1
              id="booking-page-heading"
              className="font-heading text-4xl font-bold leading-tight text-white  sm:text-5xl lg:text-6xl"
            >
              Information Session
            </h1>
            <p className="mt-5 text-base leading-relaxed text-foreground-300 sm:text-lg">
              Book a focused conversation with the IPC team to discuss
              membership, organisational capability and the most suitable
              pathway for your organisation.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-14 lg:pb-16" aria-label="IPC information session booking">
        <div className="container-content">
          <div className="mx-auto  overflow-hidden border border-background-200/80 bg-background-50 shadow-xl shadow-background-950/5">
       
       

            {isLoading && !hasError && (
              <div
                className="flex items-center justify-center gap-3 border-b border-background-200 bg-background-50 px-5 py-4 text-sm font-medium text-foreground-600"
                role="status"
                aria-live="polite"
              >
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-background-200 border-t-primary-600"
                  aria-hidden="true"
                />
                Loading Microsoft Bookings…
              </div>
            )}

            {hasError ? (
              <div className="flex min-h-[500px] items-center justify-center px-6 py-16 text-center" role="alert">
                <div className="max-w-lg">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <i className="ri-external-link-line text-2xl" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 font-heading text-2xl font-semibold text-background-950">
                    Continue your information session booking
                  </h2>
                  <p className="mt-3 leading-relaxed text-foreground-600">
                    Microsoft Bookings could not be displayed here. Open the
                    secure booking page in a new tab to choose a meeting time.
                  </p>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-7 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                  >
                    Continue to Microsoft Bookings
                    <i className="ri-external-link-line" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ) : (
              <iframe
                src={bookingUrl}
                title="Book an IPC information session"
                className="block h-[2000px] w-full overflow-hidden border-0 sm:h-[1800px] lg:h-[1900px] "
                loading="lazy"
                scrolling="no"
                allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
              />
            )}

            {!hasError && (
              <div className="border-t border-background-200 bg-background-50  px-5 py-5 text-center sm:px-8">
                <p className="text-sm leading-relaxed text-foreground-600">
                  If the booking form does not appear, you can continue on the
                  secure Microsoft Bookings website.
                </p>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  Continue to Microsoft Bookings
                  <i className="ri-external-link-line" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
