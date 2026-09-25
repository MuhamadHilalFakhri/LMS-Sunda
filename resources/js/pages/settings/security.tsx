import { Form, Head } from "@inertiajs/react";
import { KeyRound } from "lucide-react";
import { useRef } from "react";
import SecurityController from "@/actions/App/Http/Controllers/Settings/SecurityController";
import DeleteUser from "@/components/delete-user";
import InputError from "@/components/input-error";
import ManagePasskeys from "@/components/manage-passkeys";
import type { Props as ManagePasskeysProps } from "@/components/manage-passkeys";
import ManageTwoFactor from "@/components/manage-two-factor";
import type { Props as ManageTwoFactorProps } from "@/components/manage-two-factor";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/ui-language";
import { edit } from "@/routes/security";

export type SecuritySettingsProps = {
    passwordRules: string;
} & ManagePasskeysProps & ManageTwoFactorProps;

export default function Security(props: SecuritySettingsProps) {
    return (
        <>
            <Head title={t("Keamanan akun")} />
            <SecuritySettingsContent {...props} />
        </>
    );
}

export function SecuritySettingsContent(props: SecuritySettingsProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,.9fr)]">
                <section className="stitch-card p-5 md:p-7" aria-label={t("Ubah kata sandi")}>
                    <div className="mb-6 flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]">
                            <KeyRound className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-lg font-extrabold">{t("Ubah kata sandi")}</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {t("Gunakan kata sandi yang kuat dan tidak digunakan di tempat lain")}
                            </p>
                        </div>
                    </div>

                    <Form
                        {...SecurityController.update.form()}
                        options={{ preserveScroll: true }}
                        resetOnError={["password", "password_confirmation", "current_password"]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) passwordInput.current?.focus();
                            if (errors.current_password) currentPasswordInput.current?.focus();
                        }}
                        className="space-y-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">{t("Kata sandi saat ini")}</Label>
                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        autoComplete="current-password"
                                        placeholder={t("Kata sandi saat ini")}
                                    />
                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid content-start gap-2">
                                        <Label htmlFor="password">{t("Kata sandi baru")}</Label>
                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            autoComplete="new-password"
                                            placeholder={t("Kata sandi baru")}
                                            passwordrules={props.passwordRules}
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="grid content-start gap-2">
                                        <Label htmlFor="password_confirmation">{t("Ulangi kata sandi baru")}</Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            placeholder={t("Ulangi kata sandi baru")}
                                            passwordrules={props.passwordRules}
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>

                                <div className="flex justify-end border-t pt-4">
                                    <Button disabled={processing} data-test="update-password-button">
                                        <KeyRound className="size-4" /> {t("Simpan kata sandi")}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <div className="space-y-4">
                    {props.canManageTwoFactor && (
                        <section className="stitch-card p-5 md:p-6" aria-label={t("Autentikasi dua faktor")}>
                            <ManageTwoFactor
                                canManageTwoFactor={props.canManageTwoFactor}
                                requiresConfirmation={props.requiresConfirmation}
                                twoFactorEnabled={props.twoFactorEnabled}
                            />
                        </section>
                    )}
                    {props.canManagePasskeys && (
                        <section className="stitch-card p-5 md:p-6" aria-label={t("Passkey")}>
                            <ManagePasskeys canManagePasskeys={props.canManagePasskeys} passkeys={props.passkeys} />
                        </section>
                    )}
                    <section className="stitch-card p-5 md:p-6">
                        <DeleteUser />
                    </section>
                </div>
        </div>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: "Keamanan akun",
            href: edit(),
        },
    ],
};
