import { PrivacyControls } from "@/components/PrivacyControls";
import { PageHeader } from "@/components/ui";

const ITEMS = [
  ["Where your answers live", "Your answers, ledger and checklist are stored only in this browser. By default they clear when you close the tab. You can choose to remember them on this device below."],
  ["Documents", "Files you add to the document index never leave your device. We record only the file name and the category you choose."],
  ["What we send to our servers", "Anonymous funnel events (for example “assessment completed”, plus the state) with no amounts, names or free text. When you click an explanation button, the structured answers needed to answer that question are sent to generate the explanation."],
  ["AI", "Explanations are written by an AI model using only RecoveryPath's own content library and your structured answers. Your information is never used to train AI models. The AI never decides what applies to you — our rules do."],
  ["Payments", "Payments are handled by Stripe. Your card statement shows a neutral description."],
  ["Attorneys", "We never send your information to an attorney. You download or print the Case Passport and decide who receives it."],
  ["Quick exit & auto sign-out", "The Quick exit button (or pressing Esc twice) clears your data from this browser and opens a weather site. After 30 minutes of inactivity, your data is cleared and you're returned to the home page."],
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Privacy & safety" title="Built for people who need discretion">
        This product handles sensitive information, so we collect the minimum needed and keep most of it on your device.
      </PageHeader>
      <dl className="space-y-5">
        {ITEMS.map(([t, b]) => (
          <div key={t}>
            <dt className="font-semibold">{t}</dt>
            <dd className="mt-1 leading-relaxed text-ink-soft">{b}</dd>
          </div>
        ))}
      </dl>
      <PrivacyControls />
      <p className="mt-8 text-sm text-ink-mute">
        If someone monitors your devices, consider using a device they can&apos;t access, or a private browsing window. Browsing history may still
        show you visited this site.
      </p>
    </div>
  );
}
