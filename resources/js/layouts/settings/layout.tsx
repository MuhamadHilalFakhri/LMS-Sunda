import { Link, usePage } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { cn, toUrl } from "@/lib/utils";
import AdminLayout from "@/layouts/admin-layout";
import LearningLayout from "@/layouts/learning-layout";
import { edit } from "@/routes/profile";
import { edit as editSecurity } from "@/routes/security";
import type { Auth, NavItem } from "@/types";
import { useUiLanguage } from "@/lib/ui-language";

const sidebarNavItems: NavItem[] = [
    {
        title: "Profil",
        href: edit(),
        icon: null,
    },
    {
        title: "Keamanan",
        href: editSecurity(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t } = useUiLanguage();

    const content = (
        <div className="page-wrap py-7 md:py-9">
            <div className="mb-6 text-xs font-semibold text-muted-foreground">
                {t("Beranda")} / <span className="text-foreground">{t("Pengaturan")}</span>
            </div>
            <div className="rounded-[28px] bg-[#eeeaff] p-7 text-[#1b1b24] md:p-9">
                <p className="stitch-kicker">{t("AKUN SAWALA")}</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t("Profil & pengaturan")}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("Atur profil, bahasa tampilan, dan keamanan akun Anda.")}
                </p>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="stitch-card h-fit p-4">
                    <nav className="flex flex-col gap-1" aria-label={t("Pengaturan")}>
                        {sidebarNavItems.map((item, index) => (
                            <Link
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                                className={cn(
                                    "flex min-h-11 items-center rounded-xl px-3 text-sm font-bold",
                                    {
                                        "bg-[#493ee5] text-white": isCurrentOrParentUrl(item.href),
                                    },
                                )}
                            >
                                {t(item.title)}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <div className="min-w-0">
                    <section className="max-w-3xl space-y-6">{children}</section>
                </div>
            </div>
        </div>
    );

    return auth.user.role === "admin" ? (
        <AdminLayout>{content}</AdminLayout>
    ) : (
        <LearningLayout>{content}</LearningLayout>
    );
}
