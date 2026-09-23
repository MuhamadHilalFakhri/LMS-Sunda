import { Form, Head, router, usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import ProfileController from "@/actions/App/Http/Controllers/Settings/ProfileController";
import DeleteUser from "@/components/delete-user";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { edit } from "@/routes/profile";
import type { Auth } from "@/types";
import { send } from "@/routes/verification";
import { useState } from "react";
import { toast } from "sonner";
import { useUiLanguage, type UiLocale } from "@/lib/ui-language";

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const { locale, t } = useUiLanguage();
    const [savingLanguage, setSavingLanguage] = useState(false);
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
            <Head title={t("Pengaturan profil")} />

            <h1 className="sr-only">{t("Pengaturan profil")}</h1>

            <div className="stitch-card flex items-center gap-4 p-6">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#efedff] text-2xl font-extrabold text-[#493ee5]">
                    {auth.user.name.charAt(0).toUpperCase()}
                </span>
                <div>
                    <p className="stitch-kicker">{t("PROFIL SAYA")}</p>
                    <h2 className="mt-1 text-xl font-extrabold">{auth.user.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {auth.user.email} · {auth.user.role === "admin" ? "Admin" : t("Pelajar")}
                    </p>
                </div>
            </div>
            <div className="stitch-card space-y-6 p-6 md:p-7">
                <Heading
                    variant="small"
                    title={t("Profil")}
                    description={t("Perbarui nama dan alamat email Anda")}
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t("Nama")}</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder={t("Nama lengkap")}
                                />

                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t("Alamat email")}</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder={t("Alamat email")}
                                />

                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        {t("Alamat email Anda belum diverifikasi.")}{" "}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            {t("Kirim ulang email verifikasi.")}
                                        </Link>
                                    </p>

                                    {status === "verification-link-sent" && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            {t("Tautan verifikasi baru telah dikirim ke email Anda.")}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={processing} data-test="update-profile-button">
                                    {t("Simpan")}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <section className="stitch-card space-y-4 p-6 md:p-7" aria-labelledby="language-title">
                <div>
                    <h2 id="language-title" className="text-lg font-extrabold">{t("Bahasa tampilan")}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {t("Pilih bahasa untuk menu dan petunjuk aplikasi. Materi pelajaran tetap menggunakan bahasa aslinya.")}
                    </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={t("Bahasa tampilan")}>
                    {(["id", "su"] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={locale === value}
                            disabled={savingLanguage}
                            onClick={() => changeLanguage(value)}
                            className={`min-h-12 rounded-xl border px-4 text-left text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#493ee5] ${locale === value ? "border-[#493ee5] bg-[#efedff] text-[#493ee5]" : "border-border bg-card hover:border-[#aaa4ff]"}`}
                        >
                            {t(value === "id" ? "Bahasa Indonesia" : "Bahasa Sunda")}
                        </button>
                    ))}
                </div>
            </section>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: "Pengaturan profil",
            href: edit(),
        },
    ],
};
