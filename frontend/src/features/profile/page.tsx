import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, LoaderCircle, Pencil, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";
import { useAuth } from "@/features/auth/AuthContext";
import { notifications } from "@/lib/notifications";
import { ACCEPTED_IMAGE_TYPES, getSelectedFile, MAX_IMAGE_SIZE } from "@/lib/validations/uploadSchema";
import { ukTelephoneSchema } from "@/lib/validations/ukTelephoneSchema";
import AccountProfile from "./AccountProfile";

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name must contain at least 2 characters").max(300, "Full name is too long"),
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(150, "Username is too long")
    .regex(/^[\p{L}\p{N}@.+_-]+$/u, "Use letters, numbers, and @/./+/-/_ only"),
  telephone: ukTelephoneSchema,
  image: z
    .custom<FileList | undefined>()
    .refine((value) => !getSelectedFile(value) || (getSelectedFile(value)?.size || 0) <= MAX_IMAGE_SIZE, "Image must be less than 2MB")
    .refine((value) => !getSelectedFile(value) || ACCEPTED_IMAGE_TYPES.includes(getSelectedFile(value)?.type || ""), "Only JPG, JPEG, PNG, and WebP images are allowed")
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user?.name || "", username: user?.username || "", telephone: user?.telephone || "" },
  });
  const selectedImage = watch("image");

  useEffect(() => {
    const file = getSelectedFile(selectedImage);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [selectedImage]);

  if (!user) return null;

  const startEditing = () => {
    reset({ fullName: user.name, username: user.username, telephone: user.telephone || "", image: undefined });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset({ fullName: user.name, username: user.username, telephone: user.telephone || "", image: undefined });
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const submit = async (values: FormValues) => {
    const payload = new FormData();
    payload.append("full_name", values.fullName.trim());
    payload.append("username", values.username.trim());
    payload.append("telephone", values.telephone);
    const image = getSelectedFile(values.image);
    if (image) payload.append("profile_image", image);

    try {
      await updateProfile(payload);
      setIsEditing(false);
      setPreviewUrl(null);
      notifications.success("Profile updated successfully.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "The profile could not be updated.");
    }
  };

  const profile = (
    <AccountProfile
      user={user}
      title="Member profile"
      description="Manage your IPC account details."
      badgeLabel="IPC member"
      profileImageUrl={previewUrl || user.profile_image_url}
      action={!isEditing ? (
        <button type="button" onClick={startEditing} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-xs font-bold text-[#0B0B0B] shadow-sm transition-colors hover:bg-primary-400">
          <Pencil size={15} /> Edit profile
        </button>
      ) : undefined}
      avatarAction={isEditing ? (
        <label className="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-[#FFFDF9] bg-[#0B0B0B] text-white shadow-lg transition-colors hover:bg-primary-700" title="Choose profile image">
          <Camera size={16} />
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" {...register("image")} />
        </label>
      ) : undefined}
    >
      {isEditing ? (
        <div className="mt-8">
          <div className="grid gap-5 md:grid-cols-2">
            <EditField label="Full name" error={errors.fullName?.message}>
              <input autoComplete="name" className={inputClass(Boolean(errors.fullName))} {...register("fullName")} />
            </EditField>
            <EditField label="Username" error={errors.username?.message}>
              <input autoComplete="username" className={inputClass(Boolean(errors.username))} {...register("username")} />
            </EditField>
            <EditField label="UK telephone number" error={errors.telephone?.message}>
              <input type="tel" autoComplete="tel" placeholder="07700 900123" className={inputClass(Boolean(errors.telephone))} {...register("telephone")} />
            </EditField>
            <ReadOnlyField label="Email address" value={user.email || "No email address"} />
            <ReadOnlyField label="Access level" value="User" icon={<UserRound size={16} className="text-primary-700" />} />
          </div>
          {errors.image && <p className="mt-3 text-xs font-medium text-red-600">{errors.image.message}</p>}
          <p className="mt-3 text-xs text-[#887C70]">Profile image: JPG, PNG or WebP, up to 2MB.</p>
          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#E2D8CC] pt-5">
            <button type="button" onClick={cancelEditing} disabled={isSubmitting} className="h-11 rounded-xl border border-[#D4C6B5] bg-white px-5 text-sm font-bold text-[#332E29] transition-colors hover:bg-[#F7F2EB] disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      ) : undefined}
    </AccountProfile>
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4ECE1] pb-12 pt-24 md:pt-32">
      <SEO {...pageSeo.profile} />
      {isEditing ? <form onSubmit={handleSubmit(submit)} noValidate>{profile}</form> : profile}
    </div>
  );
}

const inputClass = (invalid: boolean) =>
  `mt-2 h-14 w-full rounded-xl border bg-white px-4 text-sm font-semibold text-[#332E29] outline-none transition focus:ring-2 focus:ring-primary-500/20 ${invalid ? "border-red-500" : "border-[#D4C6B5] focus:border-primary-500"}`;

function EditField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">{label}{children}{error && <span className="mt-1.5 block text-xs normal-case tracking-normal text-red-600">{error}</span>}</label>;
}

function ReadOnlyField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">{label} <span className="text-[#A79B90]">(read only)</span></p><div className="mt-2 flex min-h-14 items-center gap-2 break-all rounded-xl border border-[#E2D8CC] bg-[#EEEAE5] px-4 py-3 text-sm text-[#887C70]">{icon}{value}</div></div>;
}
