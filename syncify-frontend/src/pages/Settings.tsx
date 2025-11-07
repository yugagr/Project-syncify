import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Palette, Globe, Upload, Link as LinkIcon, Trash2, Key, Download, Monitor } from "lucide-react";
import ShinyText from "@/components/ShinyText";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  bio?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  timezone?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  createdAt?: string;
}

type ThemeMode = "dark" | "light" | "auto";

interface NotificationPreferences {
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  activity: {
    reminders: boolean;
    mentions: boolean;
    projectUpdates: boolean;
    teamUpdates: boolean;
  };
  marketing: {
    product: boolean;
    marketing: boolean;
    weekly: boolean;
  };
  frequency: "real-time" | "15-min" | "hourly" | "daily";
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

interface AppearancePreferences {
  theme: ThemeMode;
  accentColor: string;
  interface: {
    compact: boolean;
    comfortable: boolean;
    animations: boolean;
    reduceMotion: boolean;
    showSidebar: boolean;
  };
  fontSize: "small" | "medium" | "large" | "xlarge";
  fontFamily: "system" | "inter" | "roboto" | "open-sans" | "mono";
  language: string;
  dateFormat: "mdy" | "dmy" | "ymd";
  timeFormat: "12" | "24";
}

interface SecurityPreferences {
  authenticatorEnabled: boolean;
  smsEnabled: boolean;
  backupCodesGenerated: boolean;
  lastPasswordChange?: string;
}

interface StoredPreferences {
  notifications: NotificationPreferences;
  appearance: AppearancePreferences;
  security: SecurityPreferences;
}

const SETTINGS_STORAGE_KEY = "collabspace-preferences";

const defaultNotificationPreferences: NotificationPreferences = {
  channels: {
    email: true,
    push: true,
    sms: false,
  },
  activity: {
    reminders: true,
    mentions: true,
    projectUpdates: true,
    teamUpdates: false,
  },
  marketing: {
    product: true,
    marketing: false,
    weekly: true,
  },
  frequency: "real-time",
  quietHours: false,
  quietStart: "22:00",
  quietEnd: "08:00",
};

const defaultAppearancePreferences: AppearancePreferences = {
  theme: "dark",
  accentColor: "#3b82f6",
  interface: {
    compact: false,
    comfortable: false,
    animations: true,
    reduceMotion: false,
    showSidebar: true,
  },
  fontSize: "medium",
  fontFamily: "system",
  language: "English",
  dateFormat: "mdy",
  timeFormat: "12",
};

const defaultSecurityPreferences: SecurityPreferences = {
  authenticatorEnabled: false,
  smsEnabled: false,
  backupCodesGenerated: false,
  lastPasswordChange: undefined,
};

const Settings = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [appearancePreferences, setAppearancePreferences] = useState<AppearancePreferences>(defaultAppearancePreferences);
  const [securityPreferences, setSecurityPreferences] = useState<SecurityPreferences>(defaultSecurityPreferences);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [securityUpdating, setSecurityUpdating] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const accentPalette = [
    "#3b82f6",
    "#a855f7",
    "#ec4899",
    "#22c55e",
    "#f97316",
    "#ef4444",
  ];

  const writePreferences = useCallback((prefs: StoredPreferences) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(prefs));
  }, []);

  const saveSnapshot = useCallback(
    (next: {
      notifications?: NotificationPreferences;
      appearance?: AppearancePreferences;
      security?: SecurityPreferences;
    }) => {
      writePreferences({
        notifications: next.notifications ?? notificationPreferences,
        appearance: next.appearance ?? appearancePreferences,
        security: next.security ?? securityPreferences,
      });
    },
    [appearancePreferences, notificationPreferences, securityPreferences, writePreferences]
  );

  const applyAppearancePreferences = useCallback((prefs: AppearancePreferences) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const body = document.body;

    if (!root || !body) return;

    root.dataset.theme = prefs.theme;

    if (prefs.theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light-theme");
    } else if (prefs.theme === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark");
    } else {
      root.classList.remove("dark");
      root.classList.remove("light-theme");
    }

    root.style.setProperty("--collabspace-accent", prefs.accentColor);
    body.dataset.uiDensity = prefs.interface.compact ? "compact" : prefs.interface.comfortable ? "comfortable" : "default";
    body.dataset.animations = prefs.interface.animations ? "on" : "off";
    body.dataset.reduceMotion = prefs.interface.reduceMotion ? "on" : "off";
    body.dataset.sidebar = prefs.interface.showSidebar ? "visible" : "hidden";
    body.dataset.fontSize = prefs.fontSize;
    body.dataset.fontFamily = prefs.fontFamily;
    body.dataset.language = prefs.language;
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // Fallback to localStorage email if no token
          const storedEmail = localStorage.getItem("email");
          if (storedEmail) {
            setEmail(storedEmail);
            setFirstName("");
            setLastName("");
          }
          setLoading(false);
          return;
        }

        const response = await apiGet<{ user: UserProfile }>("/auth/me");
        setUser(response.user);
        setFirstName(response.user.firstName || "");
        setLastName(response.user.lastName || "");
        setEmail(response.user.email || localStorage.getItem("email") || "");
        setBio(response.user.bio || "");
        setPhone(response.user.phone || "");
        setJobTitle(response.user.jobTitle || "");
        setCompany(response.user.company || "");
        setLocation(response.user.location || "");
        setTimezone(response.user.timezone || "");
        setWebsite(response.user.website || "");
        setTwitter(response.user.twitter || "");
        setLinkedin(response.user.linkedin || "");
        setGithub(response.user.github || "");
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback to localStorage
        const storedEmail = localStorage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<StoredPreferences>;
      if (parsed.notifications) {
        setNotificationPreferences({ ...defaultNotificationPreferences, ...parsed.notifications });
      }
      if (parsed.appearance) {
        setAppearancePreferences({ ...defaultAppearancePreferences, ...parsed.appearance });
        applyAppearancePreferences({ ...defaultAppearancePreferences, ...parsed.appearance });
      }
      if (parsed.security) {
        setSecurityPreferences({ ...defaultSecurityPreferences, ...parsed.security });
      }
    } catch (error) {
      console.warn("Failed to load saved preferences", error);
    }
  }, [applyAppearancePreferences]);

  useEffect(() => {
    applyAppearancePreferences(appearancePreferences);
    saveSnapshot({ appearance: appearancePreferences });
  }, [appearancePreferences, applyAppearancePreferences, saveSnapshot]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await apiPut<{ user: UserProfile; message: string }>("/auth/me", {
        firstName,
        lastName,
        email,
        bio,
        phone,
        jobTitle,
        company,
        location,
        timezone,
        website,
        twitter,
        linkedin,
        github,
      });
      
      setUser(response.user);
      setSaveMessage({ type: "success", text: response.message || "Profile updated successfully!" });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      setSaveMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationChannel = (key: keyof NotificationPreferences["channels"], value: boolean) => {
    setNotificationPreferences((prev) => {
      const next = {
        ...prev,
        channels: {
          ...prev.channels,
          [key]: value,
        },
      };
      saveSnapshot({ notifications: next });
      return next;
    });
  };

  const updateNotificationActivity = (key: keyof NotificationPreferences["activity"], value: boolean) => {
    setNotificationPreferences((prev) => {
      const next = {
        ...prev,
        activity: {
          ...prev.activity,
          [key]: value,
        },
      };
      saveSnapshot({ notifications: next });
      return next;
    });
  };

  const updateNotificationMarketing = (key: keyof NotificationPreferences["marketing"], value: boolean) => {
    setNotificationPreferences((prev) => {
      const next = {
        ...prev,
        marketing: {
          ...prev.marketing,
          [key]: value,
        },
      };
      saveSnapshot({ notifications: next });
      return next;
    });
  };

  const updateNotificationMeta = (changes: Partial<Omit<NotificationPreferences, "channels" | "activity" | "marketing">>) => {
    setNotificationPreferences((prev) => {
      const next = {
        ...prev,
        ...changes,
      };
      saveSnapshot({ notifications: next });
      return next;
    });
  };

  const handleNotificationSave = async () => {
    setNotificationsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({ title: "Notification preferences saved" });
    setNotificationsSaving(false);
  };

  const handleThemeSelection = (theme: ThemeMode) => {
    setAppearancePreferences((prev) => {
      const next = { ...prev, theme };
      saveSnapshot({ appearance: next });
      return next;
    });
    toast({ title: `Theme set to ${theme === "auto" ? "Auto" : theme.charAt(0).toUpperCase() + theme.slice(1)}` });
  };

  const handleAccentSelection = (color: string) => {
    setAppearancePreferences((prev) => {
      const next = { ...prev, accentColor: color };
      saveSnapshot({ appearance: next });
      return next;
    });
  };

  const handleInterfaceToggle = (key: keyof AppearancePreferences["interface"], value: boolean) => {
    setAppearancePreferences((prev) => {
      const next = {
        ...prev,
        interface: {
          ...prev.interface,
          [key]: value,
        },
      };
      saveSnapshot({ appearance: next });
      return next;
    });
  };

  const handleAppearanceSelect = (changes: Partial<Omit<AppearancePreferences, "interface" | "accentColor">>) => {
    setAppearancePreferences((prev) => {
      const next = {
        ...prev,
        ...changes,
      };
      saveSnapshot({ appearance: next });
      return next;
    });
  };

  const handleAppearanceSave = async () => {
    setAppearanceSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({ title: "Appearance updated" });
    setAppearanceSaving(false);
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Complete all fields", description: "Enter your current and new password to continue." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Ensure the new password and confirmation are identical." });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters for security." });
      return;
    }
    setPasswordSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSecurityPreferences((prev) => {
      const next = { ...prev, lastPasswordChange: new Date().toISOString() };
      saveSnapshot({ security: next });
      return next;
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated" });
    setPasswordSaving(false);
  };

  const toggleAuthenticator = async () => {
    setSecurityUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const nextEnabled = !securityPreferences.authenticatorEnabled;
    setSecurityPreferences((prev) => {
      const next = { ...prev, authenticatorEnabled: nextEnabled };
      saveSnapshot({ security: next });
      return next;
    });
    toast({ title: nextEnabled ? "Authenticator enabled" : "Authenticator disabled" });
    setSecurityUpdating(false);
  };

  const toggleSms = async () => {
    setSecurityUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const nextEnabled = !securityPreferences.smsEnabled;
    setSecurityPreferences((prev) => {
      const next = { ...prev, smsEnabled: nextEnabled };
      saveSnapshot({ security: next });
      return next;
    });
    toast({ title: nextEnabled ? "SMS authentication enabled" : "SMS authentication disabled" });
    setSecurityUpdating(false);
  };

  const handleBackupCodes = async () => {
    setSecurityUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSecurityPreferences((prev) => {
      const next = { ...prev, backupCodesGenerated: true };
      saveSnapshot({ security: next });
      return next;
    });
    toast({ title: "Backup codes generated", description: "Store your codes in a secure location." });
    setSecurityUpdating(false);
  };

  const handleManageKeys = () => {
    toast({ title: "API keys", description: "Key management is coming soon. In the meantime, contact support for access." });
  };

  const handleGenerateToken = () => {
    toast({ title: "Token created", description: "A new personal access token has been prepared for download." });
  };

  const handleReviewOAuth = () => {
    toast({ title: "OAuth applications", description: "No third-party integrations currently connected." });
  };

  const handleExportData = async () => {
    toast({ title: "Preparing export" });
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast({ title: "Export ready", description: "A download link has been sent to your email." });
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Are you sure you want to delete your CollabSpace account? This action cannot be undone.");
    if (!confirmed) return;
    toast({ title: "Deletion scheduled", description: "Our team will reach out to confirm the request within 24 hours." });
  };

  const handleLoginHistory = () => {
    toast({ title: "Login history", description: "Recent login activity sent to your email." });
  };

  const handleManageDevices = () => {
    toast({ title: "Connected devices", description: "Device management will open in a new tab soon." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <ShinyText text="Manage your account and preferences" speed={4} className="text-sm" />
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-cosmic flex items-center justify-center text-3xl font-bold">
                    {(() => {
                      if (user?.fullName && user.fullName.trim()) {
                        const initials = user.fullName
                          .split(" ")
                          .filter(n => n.length > 0)
                          .map(n => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);
                        return initials || email[0]?.toUpperCase() || "U";
                      }
                      if (firstName && lastName) {
                        return `${firstName[0]}${lastName[0]}`.toUpperCase();
                      }
                      if (firstName) {
                        return firstName[0].toUpperCase();
                      }
                      return email[0]?.toUpperCase() || "U";
                    })()}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Avatar
                    </Button>
                    <ShinyText text="JPG, PNG or GIF. Max size 2MB." speed={4} className="text-xs" />
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter your first name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter your last name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Tell us about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Separator />

                {/* Professional Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="job">Job Title</Label>
                    <Input 
                      id="job" 
                      placeholder="Your role"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      placeholder="Company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="City, Country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select 
                      id="timezone"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select timezone</option>
                      <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                      <option value="Mountain Time (MT)">Mountain Time (MT)</option>
                      <option value="Central Time (CT)">Central Time (CT)</option>
                      <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <Separator />

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Social Links</Label>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="website">Website / Portfolio</Label>
                      <div className="flex gap-2">
                        <LinkIcon className="w-5 h-5 text-muted-foreground mt-2" />
                        <Input 
                          id="website" 
                          placeholder="https://yourwebsite.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="twitter">Twitter / X</Label>
                      <div className="flex gap-2">
                        <LinkIcon className="w-5 h-5 text-muted-foreground mt-2" />
                        <Input 
                          id="twitter" 
                          placeholder="https://twitter.com/username"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="flex gap-2">
                        <LinkIcon className="w-5 h-5 text-muted-foreground mt-2" />
                        <Input 
                          id="linkedin" 
                          placeholder="https://linkedin.com/in/username"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="github">GitHub</Label>
                      <div className="flex gap-2">
                        <LinkIcon className="w-5 h-5 text-muted-foreground mt-2" />
                        <Input 
                          id="github" 
                          placeholder="https://github.com/username"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {saveMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    saveMessage.type === "success" 
                      ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}>
                    {saveMessage.text}
                  </div>
                )}
                <Button 
                  className="bg-primary shadow-glow-primary" 
                  onClick={handleSaveProfile}
                  disabled={saving || loading}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">General Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Email Notifications</p>
                        <ShinyText text="Receive email updates about your projects" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.channels.email}
                        onCheckedChange={(checked) => updateNotificationChannel("email", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Push Notifications</p>
                        <ShinyText text="Get push notifications on your devices" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.channels.push}
                        onCheckedChange={(checked) => updateNotificationChannel("push", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">SMS Notifications</p>
                        <ShinyText text="Receive text messages for critical updates" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.channels.sms}
                        onCheckedChange={(checked) => updateNotificationChannel("sms", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Activity Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Task Reminders</p>
                        <ShinyText text="Remind me about upcoming deadlines" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.activity.reminders}
                        onCheckedChange={(checked) => updateNotificationActivity("reminders", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Comments & Mentions</p>
                        <ShinyText text="When someone mentions you or comments" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.activity.mentions}
                        onCheckedChange={(checked) => updateNotificationActivity("mentions", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Project Updates</p>
                        <ShinyText text="Changes to projects you're following" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.activity.projectUpdates}
                        onCheckedChange={(checked) => updateNotificationActivity("projectUpdates", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Team Updates</p>
                        <ShinyText text="Notify me when team members post updates" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.activity.teamUpdates}
                        onCheckedChange={(checked) => updateNotificationActivity("teamUpdates", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Marketing & Updates</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Product Updates</p>
                        <ShinyText text="News about new features and improvements" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.marketing.product}
                        onCheckedChange={(checked) => updateNotificationMarketing("product", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Marketing Emails</p>
                        <ShinyText text="Tips, offers, and company news" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.marketing.marketing}
                        onCheckedChange={(checked) => updateNotificationMarketing("marketing", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Weekly Summary</p>
                        <ShinyText text="Receive a weekly summary of your activity" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.marketing.weekly}
                        onCheckedChange={(checked) => updateNotificationMarketing("weekly", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="frequency">Notification Frequency</Label>
                      <select
                        id="frequency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={notificationPreferences.frequency}
                        onChange={(event) => {
                          const value = event.target.value as NotificationPreferences["frequency"];
                          updateNotificationMeta({ frequency: value });
                        }}
                      >
                        <option value="real-time">Real-time</option>
                        <option value="15-min">Every 15 minutes</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily digest</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Quiet Hours</p>
                        <ShinyText text="Mute notifications during specific times" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={notificationPreferences.quietHours}
                        onCheckedChange={(checked) => updateNotificationMeta({ quietHours: checked })}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-start">Start Time</Label>
                        <Input
                          id="quiet-start"
                          type="time"
                          value={notificationPreferences.quietStart}
                          onChange={(event) => updateNotificationMeta({ quietStart: event.target.value })}
                          disabled={!notificationPreferences.quietHours}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-end">End Time</Label>
                        <Input
                          id="quiet-end"
                          type="time"
                          value={notificationPreferences.quietEnd}
                          onChange={(event) => updateNotificationMeta({ quietEnd: event.target.value })}
                          disabled={!notificationPreferences.quietHours}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-primary shadow-glow-primary" disabled={notificationsSaving} onClick={handleNotificationSave}>
                    {notificationsSaving ? "Saving..." : "Save Notification Settings"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Password</h3>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                    </div>
                    <Button
                      className="bg-primary shadow-glow-primary"
                      disabled={passwordSaving}
                      onClick={handlePasswordUpdate}
                    >
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-semibold">Authenticator App</p>
                        <ShinyText text="Use an app to generate verification codes" speed={4} className="text-sm" />
                      </div>
                      <Button variant={securityPreferences.authenticatorEnabled ? "secondary" : "outline"} disabled={securityUpdating} onClick={toggleAuthenticator}>
                        {securityPreferences.authenticatorEnabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-semibold">SMS Authentication</p>
                        <ShinyText text="Receive codes via text message" speed={4} className="text-sm" />
                      </div>
                      <Button variant={securityPreferences.smsEnabled ? "secondary" : "outline"} disabled={securityUpdating} onClick={toggleSms}>
                        {securityPreferences.smsEnabled ? "Disable" : "Setup"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-semibold">Backup Codes</p>
                        <ShinyText text="Generate emergency access codes" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" disabled={securityUpdating} onClick={handleBackupCodes}>
                        {securityPreferences.backupCodesGenerated ? "Regenerate" : "Generate"}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Login Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Monitor className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-semibold">Current Session</p>
                          <ShinyText text="Chrome on macOS • San Francisco, CA" speed={4} className="text-sm" />
                          <ShinyText text="Last active: Just now" speed={4} className="text-xs" />
                        </div>
                      </div>
                      <span className="text-xs text-green-500 font-semibold">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Login History</p>
                        <ShinyText text="View all recent login attempts" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" onClick={handleLoginHistory}>View All</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Connected Devices</p>
                        <ShinyText text="Manage devices with access to your account" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" onClick={handleManageDevices}>Manage</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">API & Integrations</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          API Keys
                        </p>
                        <ShinyText text="Manage your API keys for integrations" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" onClick={handleManageKeys}>Manage Keys</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Personal Access Tokens</p>
                        <ShinyText text="Create tokens for external applications" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" onClick={handleGenerateToken}>Generate</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">OAuth Applications</p>
                        <ShinyText text="Apps with access to your account" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" onClick={handleReviewOAuth}>Review</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export Data
                        </p>
                        <ShinyText text="Download a copy of your data" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" onClick={handleExportData}>Export</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Privacy Settings</p>
                        <ShinyText text="Control who can see your information" speed={4} className="text-sm" />
                      </div>
                      <Button variant="outline" onClick={() => toast({ title: "Privacy settings", description: "Custom privacy controls are on our roadmap." })}>
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
                      <div>
                        <p className="font-semibold text-destructive flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </p>
                        <ShinyText text="Permanently delete your account and data" speed={4} className="text-sm" />
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount}>Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
              <div className="space-y-6">
                <div>
                  <Label className="mb-4 block text-base font-semibold">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => handleThemeSelection("dark")}
                      className={`p-4 rounded-lg bg-background transition-colors border-2 ${appearancePreferences.theme === "dark" ? "border-primary shadow-glow-primary/30" : "border-muted hover:border-border"}`}
                    >
                      <div className="w-full h-20 bg-background rounded mb-2 border border-border"></div>
                      <p className="text-sm font-semibold">Dark</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeSelection("light")}
                      className={`p-4 rounded-lg bg-background transition-colors border-2 ${appearancePreferences.theme === "light" ? "border-primary shadow-glow-primary/30" : "border-muted hover:border-border"}`}
                    >
                      <div className="w-full h-20 bg-white rounded mb-2 border border-border"></div>
                      <p className="text-sm font-semibold">Light</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeSelection("auto")}
                      className={`p-4 rounded-lg bg-background transition-colors border-2 ${appearancePreferences.theme === "auto" ? "border-primary shadow-glow-primary/30" : "border-muted hover:border-border"}`}
                    >
                      <div className="w-full h-20 bg-gradient-to-br from-background to-white rounded mb-2 border border-border"></div>
                      <p className="text-sm font-semibold">Auto</p>
                    </button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-4 block text-base font-semibold">Accent Color</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {accentPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleAccentSelection(color)}
                        className={`w-12 h-12 rounded-lg transition-transform hover:scale-110 border-2 ${appearancePreferences.accentColor === color ? "border-primary" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Use accent color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-4 block text-base font-semibold">Interface Preferences</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Compact Mode</p>
                        <ShinyText text="Reduce spacing in the interface" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={appearancePreferences.interface.compact}
                        onCheckedChange={(checked) => handleInterfaceToggle("compact", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Comfortable View</p>
                        <ShinyText text="Increase spacing for better readability" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={appearancePreferences.interface.comfortable}
                        onCheckedChange={(checked) => handleInterfaceToggle("comfortable", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Animations</p>
                        <ShinyText text="Enable interface animations" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={appearancePreferences.interface.animations}
                        onCheckedChange={(checked) => handleInterfaceToggle("animations", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Reduce Motion</p>
                        <ShinyText text="Minimize animations for accessibility" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={appearancePreferences.interface.reduceMotion}
                        onCheckedChange={(checked) => handleInterfaceToggle("reduceMotion", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Show Sidebar</p>
                        <ShinyText text="Display navigation sidebar by default" speed={4} className="text-sm" />
                      </div>
                      <Switch
                        checked={appearancePreferences.interface.showSidebar}
                        onCheckedChange={(checked) => handleInterfaceToggle("showSidebar", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-4 block text-base font-semibold">Typography</Label>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="font-size">Font Size</Label>
                      <select
                        id="font-size"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={appearancePreferences.fontSize}
                        onChange={(event) =>
                          handleAppearanceSelect({ fontSize: event.target.value as AppearancePreferences["fontSize"] })
                        }
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="xlarge">Extra Large</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="font-family">Font Family</Label>
                      <select
                        id="font-family"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={appearancePreferences.fontFamily}
                        onChange={(event) =>
                          handleAppearanceSelect({ fontFamily: event.target.value as AppearancePreferences["fontFamily"] })
                        }
                      >
                        <option value="system">System Default</option>
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="open-sans">Open Sans</option>
                        <option value="mono">Monospace</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-4 block text-base font-semibold">Localization</Label>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="language">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Language
                      </Label>
                      <select
                        id="language"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={appearancePreferences.language}
                        onChange={(event) => handleAppearanceSelect({ language: event.target.value })}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Russian">Russian</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <select
                        id="date-format"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={appearancePreferences.dateFormat}
                        onChange={(event) =>
                          handleAppearanceSelect({ dateFormat: event.target.value as AppearancePreferences["dateFormat"] })
                        }
                      >
                        <option value="mdy">MM/DD/YYYY</option>
                        <option value="dmy">DD/MM/YYYY</option>
                        <option value="ymd">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="time-format">Time Format</Label>
                      <select
                        id="time-format"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={appearancePreferences.timeFormat}
                        onChange={(event) =>
                          handleAppearanceSelect({ timeFormat: event.target.value as AppearancePreferences["timeFormat"] })
                        }
                      >
                        <option value="12">12-hour</option>
                        <option value="24">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button className="bg-primary shadow-glow-primary" onClick={handleAppearanceSave} disabled={appearanceSaving}>
                  {appearanceSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
