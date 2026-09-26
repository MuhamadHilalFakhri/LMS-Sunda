import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { Bot, CheckCircle2, Save, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { TutorSettings } from '@/pages/admin/types';
import { TutorStatusCards } from '@/pages/admin/tutor-status-cards';

export function TutorSettingsPanel({ settings }: { settings: TutorSettings }) {
    const [form, setForm] = useState({
        api_url: settings.apiUrl,
        model: settings.model,
        api_key: '',
        enabled: settings.enabled,
        response_language: settings.responseLanguage,
        response_style: settings.responseStyle,
        max_tokens: settings.maxTokens,
        clear_api_key: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [testing, setTesting] = useState(false);
    const save = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        router.put('/admin/tutor-settings', form, {
            preserveScroll: true,
            onError: setErrors,
            onSuccess: () =>
                toast.success(t('Pengaturan Tutor AI berhasil disimpan.')),
            onFinish: () => setProcessing(false),
        });
    };
    const testConnection = () => {
        setTesting(true);
        router.post(
            '/admin/tutor-settings/test',
            {
                api_url: form.api_url,
                model: form.model,
                api_key: form.api_key,
                clear_api_key: form.clear_api_key,
            },
            {
                preserveScroll: true,
                onError: () =>
                    toast.error(t('Periksa URL API dan nama model.')),
                onFinish: () => setTesting(false),
            },
        );
    };
    const fieldClass =
        'mt-1.5 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-[#493ee5] focus:ring-2 focus:ring-[#493ee5]/15';
    const fieldLabel = 'text-xs font-bold text-foreground';

    return (
        <section className="mt-8 space-y-5">
            <TutorStatusCards settings={settings} />
            <form onSubmit={save} className="stitch-card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                            <Bot className="size-5" />
                        </span>
                        <div>
                            <h2 className="font-bold">
                                {t('Konfigurasi tutor')}
                            </h2>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                {t(
                                    'Tutor hanya menggunakan materi pelajaran yang sudah diterbitkan sebagai rujukan jawaban.',
                                )}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${settings.hasApiKey ? 'bg-[#eaf8ef] text-[#17633a]' : 'bg-[#fff4e5] text-[#925000]'}`}
                    >
                        {settings.hasApiKey
                            ? t(
                                  settings.keySource === 'database'
                                      ? 'Kunci tersimpan terenkripsi'
                                      : settings.keySource === 'environment'
                                        ? 'Kunci berasal dari konfigurasi server'
                                        : 'Kunci belum dikonfigurasi',
                              )
                            : t('API key belum diatur')}
                    </span>
                </div>
                <div className="grid gap-x-5 gap-y-4 p-5 md:grid-cols-2">
                    <label className={fieldLabel}>
                        {t('URL API')}
                        <input
                            className={fieldClass}
                            type="url"
                            value={form.api_url}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    api_url: event.target.value,
                                })
                            }
                            placeholder="https://api.openai.com/v1"
                        />
                        {errors.api_url && (
                            <span className="mt-1 block text-xs text-destructive">
                                {errors.api_url}
                            </span>
                        )}
                    </label>
                    <label className={fieldLabel}>
                        {t('Nama model')}
                        <input
                            className={fieldClass}
                            value={form.model}
                            onChange={(event) =>
                                setForm({ ...form, model: event.target.value })
                            }
                            placeholder="gpt-4o-mini"
                        />
                        {errors.model && (
                            <span className="mt-1 block text-xs text-destructive">
                                {errors.model}
                            </span>
                        )}
                    </label>
                    <label className={`${fieldLabel} md:col-span-2`}>
                        {t('API key baru (opsional)')}
                        <input
                            className={fieldClass}
                            type="password"
                            autoComplete="new-password"
                            value={form.api_key}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    api_key: event.target.value,
                                    clear_api_key: false,
                                })
                            }
                            placeholder={
                                settings.hasApiKey
                                    ? t(
                                          'Kosongkan untuk mempertahankan kunci saat ini',
                                      )
                                    : 'sk-...'
                            }
                        />
                        <span className="mt-1 block font-normal text-muted-foreground">
                            {t(
                                'Kunci disimpan terenkripsi dan tidak pernah ditampilkan kembali.',
                            )}
                        </span>
                        {errors.api_key && (
                            <span className="mt-1 block text-xs text-destructive">
                                {errors.api_key}
                            </span>
                        )}
                        {settings.keySource === 'database' && (
                            <button
                                type="button"
                                onClick={() =>
                                    setForm({
                                        ...form,
                                        api_key: '',
                                        clear_api_key: !form.clear_api_key,
                                    })
                                }
                                className={`mt-2 text-xs font-bold ${form.clear_api_key ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                            >
                                {form.clear_api_key
                                    ? t('Kunci tersimpan akan dihapus')
                                    : t('Hapus kunci tersimpan')}
                            </button>
                        )}
                    </label>
                    <label className={fieldLabel}>
                        {t('Bahasa jawaban')}
                        <select
                            className={fieldClass}
                            value={form.response_language}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    response_language: event.target
                                        .value as TutorSettings['responseLanguage'],
                                })
                            }
                        >
                            <option value="user">
                                {t('Ikuti bahasa akun pelajar')}
                            </option>
                            <option value="id">{t('Bahasa Indonesia')}</option>
                            <option value="su">{t('Bahasa Sunda')}</option>
                        </select>
                    </label>
                    <label className={fieldLabel}>
                        {t('Gaya jawaban')}
                        <select
                            className={fieldClass}
                            value={form.response_style}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    response_style: event.target
                                        .value as TutorSettings['responseStyle'],
                                })
                            }
                        >
                            <option value="warm">
                                {t('Hangat dan ringkas')}
                            </option>
                            <option value="concise">
                                {t('Sangat ringkas')}
                            </option>
                            <option value="step_by_step">
                                {t('Bertahap dengan contoh')}
                            </option>
                        </select>
                    </label>
                    <label className={fieldLabel}>
                        {t('Batas token jawaban')}
                        <input
                            className={fieldClass}
                            type="number"
                            min={100}
                            max={1500}
                            step={50}
                            value={form.max_tokens}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    max_tokens: Number(event.target.value),
                                })
                            }
                        />
                        {errors.max_tokens && (
                            <span className="mt-1 block text-xs text-destructive">
                                {errors.max_tokens}
                            </span>
                        )}
                    </label>
                    <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border px-3 py-2.5 text-sm font-semibold">
                        <input
                            type="checkbox"
                            checked={form.enabled}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    enabled: event.target.checked,
                                })
                            }
                            className="size-4 accent-[#493ee5]"
                        />
                        {t('Aktifkan Tutor AI untuk pelajar')}
                    </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-secondary/40 px-5 py-4">
                    <div className="max-w-2xl space-y-1">
                        <p className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                            <ShieldCheck className="size-4 shrink-0 text-[#17633a]" />
                            {t(
                                'Kunci API dikirim ke server Sawala dan tidak pernah diberikan ke browser pelajar.',
                            )}
                        </p>
                        <p className="pl-6 text-xs leading-5 text-muted-foreground">
                            {t(
                                'Uji koneksi mengirim satu permintaan singkat dengan pengaturan saat ini tanpa menyimpan perubahan.',
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing || testing}
                            onClick={testConnection}
                            className="min-h-10 gap-2"
                        >
                            <CheckCircle2 className="size-4" />
                            {testing
                                ? t('Menguji koneksi...')
                                : t('Uji koneksi')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || testing}
                            className="min-h-10 gap-2"
                        >
                            <Save className="size-4" />
                            {processing
                                ? t('Menyimpan...')
                                : t('Simpan pengaturan')}
                        </Button>
                    </div>
                </div>
            </form>
        </section>
    );
}
