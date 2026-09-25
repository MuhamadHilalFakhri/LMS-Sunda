import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, CaseSensitive, Check, Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { sundaneseCharacters, type SundaneseCharacterCategory } from "@/data/sundanese-characters";

const categories: { value: "all" | SundaneseCharacterCategory; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "vowels", label: "Aksara swara" },
    { value: "consonants", label: "Aksara konsonan" },
    { value: "marks", label: "Tanda bunyi" },
    { value: "digits", label: "Angka Sunda" },
    { value: "punctuation", label: "Tanda baca" },
    { value: "historic", label: "Aksara sajarah" },
];

const pageSize = 24;

export default function SundaneseCharactersPage() {
    const [category, setCategory] = useState<(typeof categories)[number]["value"]>("all");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [copied, setCopied] = useState<number | null>(null);
    const filtered = useMemo(() => {
        const needle = query.trim().toLocaleLowerCase();
        return sundaneseCharacters.filter((character) => {
            const inCategory = category === "all" || character.category === category;
            const matches = !needle || [character.name, character.reading, character.code]
                .some((value) => value.toLocaleLowerCase().includes(needle));
            return inCategory && matches;
        });
    }, [category, query]);
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

    const chooseCategory = (value: (typeof categories)[number]["value"]) => {
        setCategory(value);
        setPage(1);
    };

    const search = (value: string) => {
        setQuery(value);
        setPage(1);
    };

    const copy = async (codePoint: number, value: string, name: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(codePoint);
            toast.success(`${name}. ${t("Aksara berhasil disalin.")}`);
            window.setTimeout(() => setCopied(null), 1400);
        } catch {
            toast.error(t("Aksara tidak dapat disalin. Periksa izin clipboard browser."));
        }
    };

    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Kumpulan Aksara Sunda")} />
            <Link href="/belajar/aksara-sunda" className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-link hover:underline">
                <ArrowLeft className="size-4" /> {t("Kembali ke kelas Aksara")}
            </Link>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="stitch-kicker">{t("RUANG AKSARA")}</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t("Kumpulan Aksara Sunda")}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t("Jelajahi aksara swara, ngalagena, rarangkén, angka, tanda baca, serta bentuk historis.")}
                    </p>
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
                        {t("Tanda rarangkén ditampilkan dengan lingkaran bantu. Saat disalin, hanya tanda aslinya yang disalin.")}
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#efedff] px-3 py-2 text-sm font-bold text-[#493ee5]">
                    <CaseSensitive className="size-4" /> {sundaneseCharacters.length} {t("karakter")}
                </div>
            </header>

            <section className="stitch-card mt-6 p-4 md:p-5">
                <label className="flex min-h-11 items-center gap-3 rounded-xl border bg-background px-3">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(event) => search(event.target.value)}
                        placeholder={t("Cari nama, bunyi, atau kode Unicode")}
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#493ee5]"
                        aria-label={t("Cari aksara Sunda")}
                    />
                </label>
                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("Filter kelompok aksara")}>
                    {categories.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            aria-pressed={category === item.value}
                            onClick={() => chooseCategory(item.value)}
                            className={`min-h-9 rounded-full border px-3 text-xs font-bold transition-colors ${category === item.value ? "border-[#493ee5] bg-[#493ee5] text-white" : "border-border bg-card text-muted-foreground hover:border-[#aaa4ff] hover:text-foreground"}`}
                        >
                            {t(item.label)}
                        </button>
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{filtered.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} ${t("dari")} ${filtered.length}` : t("Tidak ada aksara yang cocok")}</span>
                    <span>{t("Pilih karakter untuk menyalinnya")}</span>
                </div>
            </section>

            {visible.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {visible.map((character) => (
                        <button
                            type="button"
                            key={character.codePoint}
                            onClick={() => void copy(character.codePoint, character.value, character.name)}
                            className="group stitch-card flex min-h-36 flex-col items-center justify-center px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#aaa4ff] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#493ee5]"
                            aria-label={`${t("Salin")} ${character.name}, ${character.code}`}
                        >
                            <span lang="su" className="sunda-script min-h-14 text-4xl leading-[1.5] text-[#493ee5]">
                                {character.glyph}
                            </span>
                            <span className="mt-2 line-clamp-1 text-xs font-extrabold">{t(character.name)}</span>
                            <span className="mt-1 text-[11px] text-muted-foreground">{character.reading}</span>
                            {character.note && <span className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{t(character.note)}</span>}
                            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                                {copied === character.codePoint ? <Check className="size-3 text-[#006c4a]" /> : <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />}
                                {character.code}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="stitch-card mt-4 p-8 text-center">
                    <CaseSensitive className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 font-bold">{t("Aksara tidak ditemukan")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("Coba kata kunci atau kelompok aksara yang lain.")}</p>
                </div>
            )}

            {filtered.length > pageSize && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
                    <span className="text-xs text-muted-foreground">{t("Halaman")} {page} {t("dari")} {pageCount}</span>
                    <div className="flex gap-2">
                        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="btn-secondary min-h-9 px-3 text-xs disabled:opacity-40">{t("Sebelumnya")}</button>
                        <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="btn-secondary min-h-9 px-3 text-xs disabled:opacity-40">{t("Berikutnya")} <ArrowRight className="size-3.5" /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
