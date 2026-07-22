import { SimpleInterestForm } from "@/components/forms/SimpleInterestForm";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";
import { buildContactPageSchema } from "@/lib/seo/structuredData";

export default function Contact() {
  return (
    <div className="pt-24 md:pt-32 pb-20 px-5 md:px-0  max-w-2xl mx-auto">
      <SEO {...pageSeo.contact} structuredData={buildContactPageSchema(pageSeo.contact.description)} />
      <div className="max-w-3xl mb-10">
        <div className="contact-motion-track mb-5 h-1 max-w-3xl" aria-hidden="true">
          <span className="contact-motion-line contact-motion-line-forward" />
        </div>
        <h1 className="font-heading text-4xl text-center md:text-5xl text-background-950 my-10">Contact</h1>
        <div className="contact-motion-track mb-6 h-1 max-w-3xl" aria-hidden="true">
          <span className="contact-motion-line contact-motion-line-reverse" />
        </div>
        <p className="text-foreground-600 text-lg max-w-reading">
          Send IPC a membership, recognition, events, awards, sponsorship or general enquiry.
        </p>
      </div>
      <div className="bg-background-100 border border-background-200/70 p-6 md:p-8 max-w-3xl">
        <SimpleInterestForm type="contact" />
      </div>
    </div>
  );
}
