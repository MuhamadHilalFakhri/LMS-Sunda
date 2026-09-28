import { t } from '@/lib/ui-language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faBullseye, faGraduationCap, faTrophy } from '@fortawesome/free-solid-svg-icons';
import type { WelcomeMainProps } from '@/pages/welcome-types';

export function StepsSection({ props }: { props: WelcomeMainProps }) {
    return (
<section id="cara-belajar" tabIndex={-1} className="scroll-mt-20 py-16 md:py-20">
                    <div className="mx-auto w-[min(100%-32px,1200px)]">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Cara belajar")}</p>
                            <h2 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{t("Belajar terarah, progres tetap tercatat.")}</h2>
                            <p className="mt-4 leading-7 text-[#586380]">{t("Mulai dari topik dasar lalu lanjutkan sesuai ritmemu. Sawala menyimpan pelajaran dan hasil latihan di akunmu.")}</p>
                        </div>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: faBookOpen, title: "Pilih kelas", description: "Bahasa Sunda atau Aksara Sunda." },
                                { icon: faGraduationCap, title: "Ikuti pelajaran", description: "Materi ditata dalam unit yang runtut." },
                                { icon: faBullseye, title: "Coba latihan", description: "Periksa pemahaman dan baca penjelasan." },
                                { icon: faTrophy, title: "Lihat progres", description: "Kembali ke pelajaran yang terakhir dibuka." },
                            ].map(({ icon: Icon, title, description }, index) => (
                                <article key={title} className="rounded-lg border border-[#d9dde8] bg-white p-5 shadow-[0_2px_4px_rgba(40,46,62,0.06)]">
                                    <div className="flex items-center justify-between">
                                        <span className="flex size-10 items-center justify-center rounded-lg bg-[#edefff] text-[#4255ff]"><FontAwesomeIcon icon={Icon} className="size-5" /></span>
                                        <span className="text-xs font-semibold text-[#939bb4]">0{index + 1}</span>
                                    </div>
                                    <h3 className="mt-5 font-semibold">{t(title)}</h3>
                                    <p className="mt-2 text-sm leading-6 text-[#586380]">{t(description)}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
    );
}
