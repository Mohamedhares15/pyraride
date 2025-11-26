"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/shared/PasswordInput";
import { Loader2, Camera, HelpCircle, Shield, Mail } from "lucide-react";
import NextImage from "next/image";

interface ProfileResponse {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phoneNumber: string | null;
    profileImageUrl: string | null;
    role: string;
    createdAt: string;
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function optimizeImageFile(file: File): Promise<string> {
  const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    throw new Error("Please upload a PNG, JPG, or WEBP image.");
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load image."));
      img.src = imageUrl;
    });

    const maxDimension = 512;
    const scale =
      imageElement.width > imageElement.height
        ? Math.min(1, maxDimension / imageElement.width)
        : Math.min(1, maxDimension / imageElement.height);

    const targetWidth = Math.max(1, Math.round(imageElement.width * scale));
    const targetHeight = Math.max(1, Math.round(imageElement.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not optimise image.");
    ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

    const optimizedBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    if (!optimizedBlob) throw new Error("Could not optimise image.");

    const optimizedFile = new File([optimizedBlob], "profile.webp", {
      type: "image/webp",
    });

    return await fileToDataUrl(optimizedFile);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageDataUrl, setProfileImageDataUrl] = useState<
    string | null | undefined
  >(undefined);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const formattedCreatedAt = useMemo(() => {
    if (!createdAt) return null;
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(createdAt));
    } catch (error) {
      return null;
    }
  }, [createdAt]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to load profile");
        }
        const data: ProfileResponse = await response.json();
        setEmail(data.user.email);
        setFullName(data.user.fullName ?? "");
        setPhoneNumber(data.user.phoneNumber ?? "");
        setProfileImageUrl(data.user.profileImageUrl ?? null);
        setProfileImageDataUrl(undefined);
        setCreatedAt(data.user.createdAt);
      } catch (error) {
        console.error(error);
        setProfileError("Unable to load profile. Please try again later.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [status, router]);

  const handleImageSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please upload an image file.");
      return;
    }

    try {
      setProfileError(null);
      const optimizedDataUrl = await optimizeImageFile(file);
      setProfileImageUrl(optimizedDataUrl);
      setProfileImageDataUrl(optimizedDataUrl);
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error ? error.message : "Could not process the image."
      );
    }
  };

  const handleRemoveImage = () => {
    setProfileImageUrl(null);
    setProfileImageDataUrl(null);
  };

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);

    try {
      setIsSavingProfile(true);
      const payload: Record<string, unknown> = {
        email,
        fullName,
        phoneNumber,
      };

      if (profileImageDataUrl !== undefined) {
        payload.profileImageDataUrl = profileImageDataUrl;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const { user }: ProfileResponse = await response.json();
      setProfileMessage("Profile updated successfully.");
      setProfileImageDataUrl(undefined);

      await update({
        name: user.fullName || user.email,
        email: user.email,
        image: user.profileImageUrl ?? undefined,
      });
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error ? error.message : "Failed to update profile."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setIsSavingPassword(true);

      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }

      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setPasswordError(
        error instanceof Error ? error.message : "Failed to update password."
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 md:py-14">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Your Profile
        </h1>
        <p className="max-w-2xl text-sm md:text-base text-muted-foreground">
          Keep your personal information up to date and manage your account
          security.
        </p>
        {formattedCreatedAt && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Member since {formattedCreatedAt}
          </p>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card className="p-6 md:p-8">
          <form className="space-y-6" onSubmit={handleProfileSave}>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                  {profileImageUrl ? (
                    <NextImage
                      src={profileImageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      {fullName
                        ? fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      const input = document.getElementById(
                        "profile-image-input"
                      ) as HTMLInputElement | null;
                      input?.click();
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    {profileImageUrl ? "Change photo" : "Upload photo"}
                  </Button>
                  {profileImageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs text-red-600 hover:text-red-600"
                      onClick={handleRemoveImage}
                    >
                      Remove photo
                    </Button>
                  )}
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageSelection}
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or WEBP. Large images are automatically optimised so your profile loads instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="+201234567890"
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Account role</Label>
                <Input
                  id="role"
                  value={session?.user?.role ?? "rider"}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {profileError && (
              <p className="text-sm text-red-600">{profileError}</p>
            )}
            {profileMessage && (
              <p className="text-sm text-green-600">{profileMessage}</p>
            )}

            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save changes
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold">Change password</h2>
                <p className="text-xs text-muted-foreground">
                  Keep your account secure with a strong password.
                </p>
              </div>
            </div>

            <form className="space-y-3" onSubmit={handlePasswordSave}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <PasswordInput
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="text-sm text-green-600">{passwordMessage}</p>
              )}

              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update password
              </Button>
            </form>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold">Need help?</h2>
                <p className="text-xs text-muted-foreground">
                  Our team is ready to answer questions about bookings,
                  stables, and more.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-card/60"
              >
                <Mail className="h-4 w-4 text-primary" />
                Contact support
              </Link>
              <Link
                href="/faq"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-card/60"
              >
                <HelpCircle className="h-4 w-4 text-primary" />
                Visit FAQ
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


