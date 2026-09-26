import { t } from '@/lib/ui-language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faCircleQuestion, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import type { WelcomeMainProps } from '@/pages/welcome-types';

export function TutorSection({ props }: { props: WelcomeMainProps }) {
    return (
<section id="tutor" tabIndex={-1} data-reveal className="scroll-mt-20 border-y border-[#e7e9f0] bg-white py-16 md:py-20">
                    <div className="mx-auto grid w-[min(100%-32px,1200px)] items-center gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-16">
                        <div className="rounded-[24px] bg-[#ffeadb] p-5 sm:p-7">
                            <div className="overflow-hidden rounded-lg bg-white shadow-[0_4px_16px_rgba(40,46,62,0.1)]">
                                <div className="flex items-center gap-3 border-b border-[#d9dde8] px-5 py-4">
                                    <span className="flex size-9 items-center justify-center rounded-full bg-[#edefff] text-[#4255ff]"><FontAwesomeIcon icon={faWandMagicSparkles} className="size-4" /></span>
                                    <div><p className="text-sm font-semibold">{t("Tutor AI Bahasa Sunda")}</p><p className="text-xs text-[#586380]">{t("Belajar dari materi yang diterbitkan")}</p></div>
                                </div>
                                <div className="space-y-4 p-5 sm:p-6">
                                    <div className="max-w-[86%] rounded-lg bg-[#f6f7fb] p-3 text-sm leading-6">{t("Kapan saya memakai kata punten?")}</div>
                                    <div className="ml-auto max-w-[92%] rounded-lg bg-[#edefff] p-3 text-sm leading-6 text-[#2e3856]">{t("Punten dapat digunakan saat meminta izin atau memulai percakapan dengan sopan.")}</div>
                                    <div className="ml-auto flex max-w-[92%] items-start gap-2 rounded-md border border-[#d9dde8] p-3 text-xs leading-5 text-[#586380]">
                                        <FontAwesomeIcon icon={faBookOpen} className="mt-0.5 size-4 shrink-0 text-[#4255ff]" />
                                        <span><strong className="block text-[#282e3e]">{t("Rujukan pelajaran")}</strong>{t("Sapaan dan ungkapan · Bahasa Sunda")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Belajar dengan bantuan AI")}</p>
                            <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">{t("Punya pertanyaan? Mulai dari materi yang sedang kamu pelajari.")}</h2>
                            <p className="mt-4 max-w-xl leading-7 text-[#586380]">{t("Tutor AI membantu menjelaskan materi, melatih percakapan teks, dan memberi saran tulisan. Jawaban menyertakan rujukan materi agar kamu bisa memeriksa kembali konteksnya.")}</p>
                            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#586380]"><FontAwesomeIcon icon={faCircleQuestion} className="mt-0.5 size-4 shrink-0 text-[#4255ff]" />{t("Jawaban AI dapat keliru. Gunakan materi dan rujukan sebagai panduan belajar.")}</p>
                        </div>
                    </div>
                </section>
    );
}
