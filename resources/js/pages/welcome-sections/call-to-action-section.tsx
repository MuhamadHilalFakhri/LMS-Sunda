import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import type { WelcomeMainProps } from '@/pages/welcome-types';

export function CallToActionSection({ props }: { props: WelcomeMainProps }) {
    const { auth, destination } = props;
    return (
<section className="px-4 pb-16 md:pb-20">
                    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-6 rounded-[24px] bg-[#edefff] px-6 py-8 sm:px-10 md:flex-row md:items-center md:px-14 md:py-11">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Mulai dari satu pelajaran")}</p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-[-.03em] sm:text-3xl">{t("Sedikit demi sedikit, kamu akan semakin akrab dengan Sunda.")}</h2>
                            <p className="mt-3 leading-7 text-[#586380]">{t("Buat akun untuk menyimpan progres dan melanjutkan kapan saja.")}</p>
                        </div>
                        <Link href={destination} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#4255ff] px-6 text-sm font-semibold text-white hover:bg-[#3548eb]">
                            {t(auth.user ? "Lanjut belajar" : "Buat akun gratis")} <FontAwesomeIcon icon={faArrowRightLong} className="size-4" />
                        </Link>
                    </div>
                </section>
    );
}
