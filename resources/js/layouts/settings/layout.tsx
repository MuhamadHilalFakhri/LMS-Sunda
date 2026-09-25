import { usePage } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import AdminLayout from "@/layouts/admin-layout";
import LearningLayout from "@/layouts/learning-layout";
import type { Auth } from "@/types";
import { useUiLanguage } from "@/lib/ui-language";

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t } = useUiLanguage();
    const isAdmin = auth.user.role === "admin";

    const content = (
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="stitch-kicker">{t("AKUN SAWALA")}</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[30px]">
                        {t("Profil & pengaturan")}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("Atur profil, bahasa tampilan, dan keamanan akun Anda.")}
                    </p>
                </div>
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-lg font-extrabold text-[#493ee5]">
                        {auth.user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 leading-tight">
                        <strong className="block max-w-56 truncate text-sm font-extrabold">
                            {auth.user.name}
                        </strong>
                        <span className="mt-1 block max-w-56 truncate text-xs text-muted-foreground">
                            {auth.user.email} · {t(isAdmin ? "Admin" : "Pelajar")}
                        </span>
                    </span>
                </div>
            </div>
            <div className="min-w-0">{children}</div>
        </main>
    );

    return isAdmin ? <AdminLayout>{content}</AdminLayout> : <LearningLayout>{content}</LearningLayout>;
}
