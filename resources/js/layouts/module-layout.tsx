import AppLogoIcon from '@/components/app-logo-icon';
import { t } from '@/lib/ui-language';
import type { LearningPath } from '@/types/learning';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function ModuleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { path } = usePage<{
        path: Pick<LearningPath, 'id' | 'slug' | 'title'>;
    }>().props;

    return (
        <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
            <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
                <Link
                    href="/dashboard"
                    className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <AppLogoIcon
                        alt=""
                        className="size-9 shrink-0 rounded-xl"
                    />
                    <span className="min-w-0">
                        <span className="block text-sm leading-5 font-extrabold text-[#3026c8]">
                            Sawala
                        </span>
                        <span className="block text-[10px] leading-4 text-muted-foreground">
                            {t('Ruang belajar')}
                        </span>
                    </span>
                </Link>
                <Link
                    href={`/belajar/${path.slug}`}
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary sm:px-4 sm:text-sm"
                >
                    <ArrowLeft className="size-4" />
                    <span className="hidden sm:inline">
                        {t('Kembali ke')} {path.title}
                    </span>
                    <span className="sm:hidden">{t('Kembali ke kelas')}</span>
                </Link>
            </header>
            <main className="min-h-0 flex-1">{children}</main>
        </div>
    );
}
