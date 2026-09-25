import { Link } from "@inertiajs/react";
import AppLogoIcon from "@/components/app-logo-icon";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-2">
            <a href="#auth-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lg">
                Lewati ke formulir
            </a>
            <main id="auth-content" tabIndex={-1} className="flex min-h-svh flex-col items-center justify-center p-5 md:p-10">
                <div className="w-full max-w-[440px]">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <AppLogoIcon className="mb-1 size-12 rounded-xl object-cover" />
                                <span className="font-extrabold text-[#493ee5]">Sawala</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
                                <p className="text-center text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        <div className="auth-form-card">{children}</div>
                    </div>
                </div>
            </main>
            <div className="relative hidden min-h-svh overflow-hidden bg-gradient-to-br from-[#493ee5] to-[#917feb] lg:block">
                <img
                    src="/stitch/auth-study.svg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#493ee5]/10 to-[#332880]/85" />
                <div className="absolute bottom-12 left-10 right-10 text-white">
                    <p className="text-xs font-extrabold tracking-widest text-white/80">
                        BAHASA · AKSARA · BUDAYA
                    </p>
                    <h2 className="mt-3 max-w-md text-3xl font-extrabold leading-tight">
                        Langkah kecil untuk semakin dekat dengan Bahasa Sunda.
                    </h2>
                    <p lang="su" className="sunda-script mt-4 text-3xl">
                        ᮝᮤᮜᮥᮏᮨᮀ ᮞᮥᮙ᮪ᮕᮤᮀ
                    </p>
                </div>
            </div>
        </div>
    );
}
