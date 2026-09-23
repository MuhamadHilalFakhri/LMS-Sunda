import { BookOpen, PenLine } from "lucide-react";
import type { LearningPath } from "@/types/learning";
import { t } from "@/lib/ui-language";

export default function AdminPathArtwork({ path }: { path: LearningPath }) {
    const aksara = path.slug.includes("aksara");
    const Icon = aksara ? PenLine : BookOpen;
    const glyphs = aksara ? ["ᮃ", "ᮊ", "ᮞ"] : ["ᮘ", "ᮞ", "ᮔ"];

    return (
        <div
            className={`relative isolate flex min-h-44 items-center justify-between gap-6 overflow-hidden px-6 py-6 text-white md:px-8 ${aksara ? "bg-gradient-to-r from-[#3e319f] via-[#5446c8] to-[#8775ec]" : "bg-gradient-to-r from-[#075a49] via-[#0b8065] to-[#55bca2]"}`}
        >
            <div
                aria-hidden="true"
                className="absolute -right-10 -top-32 size-80 rounded-full border-[40px] border-white/10"
            />
            <div
                aria-hidden="true"
                className="absolute bottom-[-120px] left-[45%] size-64 rounded-full border-[32px] border-white/10"
            />
            <div className="relative z-10 min-w-0">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/20">
                    <Icon className="size-5" />
                </span>
                <p className="mt-3 text-[11px] font-extrabold tracking-widest text-white/75">
                    {t("KELAS BELAJAR")}
                </p>
                <p className="mt-1 max-w-xl text-xl font-extrabold tracking-tight md:text-2xl">
                    {t(path.title)}
                </p>
            </div>
            <div aria-hidden="true" className="relative hidden shrink-0 items-center gap-2 sm:flex">
                {glyphs.map((glyph, index) => (
                    <span
                        key={`${glyph}-${index}`}
                        lang="su"
                        className={`sunda-script flex size-16 items-center justify-center rounded-2xl border border-white/40 bg-white/15 text-4xl shadow-lg backdrop-blur-sm md:size-20 md:text-5xl ${index === 1 ? "-translate-y-4" : ""}`}
                    >
                        {glyph}
                    </span>
                ))}
            </div>
        </div>
    );
}
