import { Camera, LoaderCircle, Pencil, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import AccountProfile from "@/features/profile/AccountProfile";
import { notifications } from "@/lib/notifications";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/validations/uploadSchema";

import { panelApi } from "../api";
import { Card, ErrorState, inputClass, Loading, PageHeading } from "../components/PanelUI";
import { useLoad } from "../hooks";
import type { Profile } from "../types";

type EditableTextField = Exclude<
  keyof Profile,
  "email" | "membership_reference" | "profile_image_url" | "interests" | "completion" | "years_experience"
>;

const fields: { name: EditableTextField; label: string; type?: string; full?: boolean }[] = [
  { name: "first_name", label: "First name" },
  { name: "last_name", label: "Last name" },
  { name: "preferred_name", label: "Preferred name" },
  { name: "phone", label: "Telephone", type: "tel" },
  { name: "country", label: "Country" },
  { name: "city", label: "City" },
  { name: "timezone", label: "Timezone" },
  { name: "job_title", label: "Job title" },
  { name: "employer", label: "Employer" },
  { name: "industry", label: "Industry" },
  { name: "professional_headline", label: "Professional headline", full: true },
  { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
  { name: "website_url", label: "Website", type: "url" },
];

const multipartFields: (keyof Profile)[] = [
  "first_name",
  "last_name",
  "preferred_name",
  "phone",
  "country",
  "city",
  "timezone",
  "biography",
  "job_title",
  "employer",
  "industry",
  "years_experience",
  "professional_headline",
  "qualifications",
  "certifications",
  "linkedin_url",
  "website_url",
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const load = useCallback((signal: AbortSignal) => panelApi.profile(signal), []);
  const { data, loading, error, reload, setData } = useLoad(load);
  const [form, setForm] = useState<Profile>();
  const [interests, setInterests] = useState<{ slug: string; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(data), [data]);
  useEffect(() => {
    void panelApi.interests().then(setInterests).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const nextPreview = URL.createObjectURL(image);
    setPreviewUrl(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [image]);

  const displayUser = useMemo(() => {
    if (!user || !data) return user;
    const name = `${data.first_name} ${data.last_name}`.trim() || user.name;
    return {
      ...user,
      first_name: data.first_name,
      last_name: data.last_name,
      name,
      profile_image_url: data.profile_image_url || user.profile_image_url,
    };
  }, [data, user]);

  function startEditing() {
    if (!data) return;
    setForm(data);
    setImage(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setForm(data);
    setImage(null);
    setIsEditing(false);
  }

  function selectImage(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      notifications.error("Only JPG, JPEG, PNG, and WebP images are allowed.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      notifications.error("Image must be less than 2MB.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    setImage(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const payload = new FormData();
      multipartFields.forEach((name) => {
        const value = form[name];
        payload.append(name, value === null || value === undefined ? "" : String(value));
      });
      form.interests.forEach((interest) => payload.append("interests", interest));
      if (image) payload.append("profile_image", image);

      const result = await panelApi.updateProfile(payload);
      setData(result);
      setForm(result);
      setImage(null);
      setIsEditing(false);
      await refreshUser();
      notifications.success("Profile saved");
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading || (!form && !error)) return <Loading />;
  if (error || !form || !displayUser) return <ErrorState message={error || "Profile unavailable."} retry={reload} />;

  if (!isEditing) {
    return (
      <AccountProfile
        user={displayUser}
        title="Professional profile"
        description="Your authenticated IPC account and member profile."
        badgeLabel={displayUser.membership_grade || "IPC member"}
        profileImageUrl={displayUser.profile_image_url}
        membershipReference={data.membership_reference}
        action={(
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-xs font-bold text-[#0B0B0B] shadow-sm transition-colors hover:bg-primary-400"
          >
            <Pencil size={15} />
            Edit profile
          </button>
        )}
      />
    );
  }

  const initials =
    `${form.first_name?.[0] || ""}${form.last_name?.[0] || ""}`.toUpperCase()
    || displayUser.email?.[0]?.toUpperCase()
    || "U";
  const profileImage = previewUrl || form.profile_image_url || displayUser.profile_image_url;

  return (
    <>
      <PageHeading
        title="Professional profile"
        description="Keep your contact and professional details current. Your email is managed by your secure account."
        action={(
          <button
            type="button"
            onClick={cancelEditing}
            className="rounded-xl border border-[#D4C6B5] bg-white px-5 py-3 text-xs font-bold text-[#332E29] transition-colors hover:bg-[#F7F2EB]"
          >
            Cancel editing
          </button>
        )}
      />
      <form onSubmit={(event) => void submit(event)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <div className="mb-7 flex flex-col gap-5 border-b border-[#E2D8CC] pb-7 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0">
              <span className="grid h-full w-full overflow-hidden rounded-2xl border-4 border-white bg-primary-500 text-2xl font-black text-[#0B0B0B] shadow-lg">
                {profileImage ? (
                  <img src={profileImage} alt={`${displayUser.name} profile`} className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center">{initials}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#0B0B0B] text-white shadow-lg transition-colors hover:bg-primary-700"
                aria-label="Change profile image"
              >
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="font-bold text-[#221E1A]">Profile image</h2>
              <p className="mt-1 text-sm text-[#756B61]">JPG, PNG or WebP, up to 2MB.</p>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary-800 hover:text-primary-950"
              >
                <Upload size={15} />
                {image ? "Choose another image" : "Upload new image"}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => selectImage(event.target.files?.[0])}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ name, label, type, full }) => (
              <label className={full ? "sm:col-span-2" : ""} key={name}>
                <span className="text-sm font-medium">{label}</span>
                <input
                  type={type}
                  className={inputClass}
                  value={String(form[name] ?? "")}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                />
              </label>
            ))}
            <label>
              <span className="text-sm font-medium">Years of experience</span>
              <input
                type="number"
                min={0}
                max={80}
                className={inputClass}
                value={form.years_experience ?? ""}
                onChange={(event) => setForm({
                  ...form,
                  years_experience: event.target.value === "" ? null : Number(event.target.value),
                })}
              />
            </label>
            <label>
              <span className="text-sm font-medium">Email address</span>
              <input className={`${inputClass} cursor-not-allowed bg-[#F1ECE5] text-[#756B61]`} value={form.email} readOnly />
            </label>
            <label>
              <span className="text-sm font-medium">Membership reference</span>
              <input
                className={`${inputClass} cursor-not-allowed bg-[#F1ECE5] font-semibold text-[#756B61]`}
                value={form.membership_reference || "Not assigned"}
                readOnly
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Biography</span>
              <textarea rows={5} className={inputClass} value={form.biography} onChange={(event) => setForm({ ...form, biography: event.target.value })} />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Qualifications</span>
              <textarea rows={3} className={inputClass} value={form.qualifications} onChange={(event) => setForm({ ...form, qualifications: event.target.value })} />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Certifications</span>
              <textarea rows={3} className={inputClass} value={form.certifications} onChange={(event) => setForm({ ...form, certifications: event.target.value })} />
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium">Professional interests</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.map((interest) => {
                  const selected = form.interests.includes(interest.slug);
                  return (
                    <label
                      key={interest.slug}
                      className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                        selected
                          ? "border-primary-600 bg-primary-50 text-primary-800"
                          : "border-background-300 bg-white hover:border-primary-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={() => setForm({
                          ...form,
                          interests: selected
                            ? form.interests.filter((slug) => slug !== interest.slug)
                            : [...form.interests, interest.slug],
                        })}
                      />
                      {interest.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
          <div className="mt-7 flex flex-wrap gap-3 border-t border-[#E2D8CC] pt-6">
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle size={17} className="animate-spin" />}
              {saving ? "Saving…" : "Save profile"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="rounded-xl border border-[#D4C6B5] bg-white px-5 py-3 text-xs font-bold text-[#332E29] transition-colors hover:bg-[#F7F2EB] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </Card>
        <Card className="h-fit">
          <p className="text-sm font-semibold">Profile completion</p>
          <p className="mt-3 text-4xl font-bold text-primary-700">{form.completion.percentage}%</p>
          <div className="mt-4 h-2 rounded-full bg-background-200">
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${form.completion.percentage}%` }} />
          </div>
          <p className="mt-5 text-xs leading-5 text-foreground-500">
            {form.completion.missing.length
              ? `Still to add: ${form.completion.missing.join(", ")}`
              : "Your profile is complete."}
          </p>
        </Card>
      </form>
    </>
  );
}
