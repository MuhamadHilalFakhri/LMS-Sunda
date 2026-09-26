import { t } from '@/lib/ui-language';
import { ListFilter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SearchBar({
    query,
    setQuery,
    placeholder,
    onSubmit,
}: {
    query: string;
    setQuery: (value: string) => void;
    placeholder: string;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
    const content = (
        <>
            <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <label className="sr-only" htmlFor="content-search">
                    {t('Cari konten')}
                </label>
                <Input
                    id="content-search"
                    className="h-11 bg-card pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t(placeholder)}
                />
            </div>
            {onSubmit ? (
                <Button
                    type="submit"
                    variant="outline"
                    className="min-h-11 shrink-0"
                >
                    <Search className="size-4" /> {t('Cari')}
                </Button>
            ) : (
                <ListFilter
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                />
            )}
        </>
    );

    return onSubmit ? (
        <form onSubmit={onSubmit} className="flex max-w-xl items-center gap-3">
            {content}
        </form>
    ) : (
        <div className="flex max-w-xl items-center gap-3">{content}</div>
    );
}
