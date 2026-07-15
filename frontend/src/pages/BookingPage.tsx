import { useState } from "react";
import { Link } from "react-router-dom";

const bookingUrl =
  "https://outlook.office.com/book/IPC@kentbusinesscollege.com/s/ZND9gXN_Ckuhz75PflhCdQ2?ismsaljsauthenabled";

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
      <section
        aria-labelledby="booking-page-heading"
        className="border-b border-background-800 bg-background-950 pb-12 pt-28 sm:pb-16 sm:pt-32 lg:pt-36"
      >
        <div className="container-content">
          <Link
            to="/sponsorship"
            className="inline-flex items-center gap-2 text-sm font-medium text-background-300 transition-colors hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 focus-visible:ring-offset-background-950"
          >
            <i className="ri-arrow-left-line" aria-hidden="true" />
            Back to Sponsorship
          </Link>

          <div className="mt-8 max-w-3xl">
            <span className="eyebrow mb-4 block text-primary-400">
              Partnership
            </span>
            <h1
              id="booking-page-heading"
              className="font-heading text-4xl font-bold leading-tight text-background-50 sm:text-5xl lg:text-6xl"
            >
              Discuss Sponsorship
            </h1>
            <p className="mt-5 text-base leading-relaxed text-background-300 sm:text-lg">
              Book a meeting with the IPC team to discuss sponsorship
              opportunities, partnership options, and the most suitable package
              for your organisation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16" aria-label="Sponsorship meeting booking">
        <div className="container-content">
          <div className="overflow-hidden rounded-xl border border-background-200/80 bg-background-50 shadow-xl shadow-background-950/5">
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
                    Continue your booking with Microsoft
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
                title="Discuss IPC Sponsorship"
                className="block h-[850px] min-h-[800px] w-full border-0 md:h-[900px] lg:h-[1000px]"
                loading="lazy"
                allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
              />
            )}

            {!hasError && (
              <div className="border-t border-background-200 bg-background-50 px-5 py-5 text-center sm:px-8">
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

