import { t } from "@/lib/ui-language";
import { router } from "@inertiajs/react";
import { MessageSquareWarning } from '@/components/meya-icons';
import PaginationControls from "@/components/pagination-controls";
import { Empty } from "@/pages/admin/common-ui";
import { FeedbackCard } from "@/pages/admin/feedback-card";
import { SearchBar } from "@/pages/admin/search-bar";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";

export function FeedbackPanel({ model }: { model: AdminPageModel }) {
    const { feedback, feedbackPagination, feedbackStats, section, query, setQuery } = model;
    return (
        <section className="mt-8 space-y-5">
                            <SearchBar
                                query={query}
                                setQuery={setQuery}
                                placeholder="Cari nama pelajar atau isi umpan balik..."
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    router.get(
                                        "/admin",
                                        { section: "feedback", q: query.trim() || undefined, feedback_page: 1 },
                                        { preserveState: true, preserveScroll: true, replace: true, only: ["feedback", "feedbackPagination", "feedbackStats"] },
                                    );
                                }}
                            />
                            <div className="grid gap-3 sm:grid-cols-3">
                                {(
                                    [
                                        ["Baru", feedbackStats.new],
                                        ["Ditinjau", feedbackStats.reviewing],
                                        ["Selesai", feedbackStats.resolved],
                                    ] as const
                                ).map(([label, count]) => (
                                    <div key={label} className="stitch-card p-4">
                                        <p className="text-xs font-semibold text-muted-foreground">{t(label)}</p>
                                        <p className="mt-2 text-2xl font-extrabold">{count}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                {feedback.length ? (
                                    <>
                                        {feedback.map((item) => <FeedbackCard key={item.id} item={item} />)}
                                        <div className="stitch-card overflow-hidden">
                                            <PaginationControls pagination={feedbackPagination} preserveScroll />
                                        </div>
                                    </>
                                ) : (
                                    <div className="stitch-card p-5">
                                        <Empty
                                            icon={MessageSquareWarning}
                                            title={query ? "Masukan tidak ditemukan" : "Belum ada umpan balik"}
                                            detail={query ? "Coba kata kunci lain." : "Masukan dari pelajar akan muncul di sini setelah dikirim."}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
    );
}
