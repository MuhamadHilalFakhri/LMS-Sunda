import { Form, Head, Link, router, usePage } from "@inertiajs/react";
import { Languages, ShieldCheck, UserRound } from "lucide-react";
import ProfileController from "@/actions/App/Http/Controllers/Settings/ProfileController";
import InputError from "@/components/input-error";
import { SecuritySettingsContent, type SecuritySettingsProps } from "@/pages/settings/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUiLanguage, type UiLocale } from "@/lib/ui-language";
import { edit } from "@/routes/profile";
import { send } from "@/routes/verification";
import type { Auth } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

type PageProps = {
    auth: Auth;
};

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
} & SecuritySettingsProps;

export default function Profile(props: Props) {
    const { mustVerifyEmail, status } = props;
    const page = usePage<PageProps>();
    const { auth } = page.props;
    const { locale, t } = useUiLanguage();
    const [savingLanguage, setSavingLanguage] = useState(false);
    const initialSection = new URLSearchParams(page.url.split("?")[1] ?? "").get("section");
    const [activeSection, setActiveSection] = useState<"profile" | "security">(
        initialSection === "security" ? "security" : "profile",
    );

    const changeLanguage = (value: UiLocale) => {
        if (value === locale || savingLanguage) return;
        setSavingLanguage(true);
        document.documentElement.lang = value;
        router.patch("/settings/language", { ui_locale: value }, {
            preserveScroll: true,
            onSuccess: () => toast.success(value === "su" ? "Basa parantos dirobih." : "Bahasa berhasil diubah."),
            onError: () => { document.documentElement.lang = locale; },
            onFinish: () => setSavingLanguage(false),
        });
    };

    return (
        <>
            <Head title={t(activeSection === "security" ? "Keamanan akun" : "Profil")} />
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1.5" role="group" aria-label={t("Menu profil")}>
                <button
                    id="profile-tab"
                    type="button"
                    aria-pressed={activeSection === "profile"}
                    aria-controls="profile-panel"
                    onClick={() => setActiveSection("profile")}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${activeSection === "profile" ? "bg-[#493ee5] text-white shadow-sm" : "text-muted-foreground hover:bg-[#f5f2ff] hover:text-[#493ee5]"}`}
                >
                    <UserRound className="size-4" /> {t("Profil")}
                </button>
                <button
                    id="security-tab"
                    type="button"
                    aria-pressed={activeSection === "security"}
                    aria-controls="security-panel"
                    onClick={() => setActiveSection("security")}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${activeSection === "security" ? "bg-[#493ee5] text-white shadow-sm" : "text-muted-foreground hover:bg-[#f5f2ff] hover:text-[#493ee5]"}`}
                >
                    <ShieldCheck className="size-4" /> {t("Keamanan akun")}
                </button>
            </div>
            <div id="profile-panel" role="tabpanel" aria-labelledby="profile-tab" className={activeSection === "profile" ? "grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]" : "hidden"}>
                <section className="stitch-card p-5 md:p-7" aria-labelledby="profile-title">
                    <div className="mb-6 flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                            <UserRound className="size-5" />
                        </span>
                        <div>
                            <h2 id="profile-title" className="text-lg font-extrabold">{t("Informasi profil")}</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">{t("Nama dan alamat email untuk akun Sawala Anda.")}</p>
                        </div>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid content-start gap-2">
                                        <Label htmlFor="name">{t("Nama")}</Label>
                                        <Input
                                            id="name"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder={t("Nama lengkap")}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid content-start gap-2">
                                        <Label htmlFor="email">{t("Alamat email")}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder={t("Alamat email")}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                                        {t("Alamat email Anda belum diverifikasi.")} {" "}
                                        <Link href={send()} as="button" className="font-bold underline underline-offset-4">
                                            {t("Kirim ulang email verifikasi.")}
                                        </Link>
                                        {status === "verification-link-sent" && (
                                            <p className="mt-1 font-semibold">{t("Tautan verifikasi baru telah dikirim ke email Anda.")}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end border-t pt-4">
                                    <Button disabled={processing} data-test="update-profile-button">
                                        {t("Simpan profil")}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section className="stitch-card p-5 md:p-7" aria-labelledby="language-title">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                            <Languages className="size-5" />
                        </span>
                        <div>
                            <h2 id="language-title" className="text-lg font-extrabold">{t("Bahasa tampilan")}</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {t("Ubah bahasa menu dan petunjuk aplikasi. Materi tetap memakai bahasa aslinya.")}
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={t("Bahasa tampilan")}>
                        {(["id", "su"] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={locale === value}
                                disabled={savingLanguage}
                                onClick={() => changeLanguage(value)}
                                className={`min-h-11 rounded-xl border px-4 text-left text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#493ee5] ${locale === value ? "border-[#493ee5] bg-[#efedff] text-[#493ee5]" : "border-border bg-card hover:border-[#aaa4ff]"}`}
                            >
                                {t(value === "id" ? "Bahasa Indonesia" : "Bahasa Sunda")}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
            <section id="security-panel" role="tabpanel" aria-labelledby="security-tab" className={activeSection === "security" ? "block" : "hidden"}>
                <SecuritySettingsContent {...props} />
            </section>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: "Profil",
            href: edit(),
        },
    ],
};
