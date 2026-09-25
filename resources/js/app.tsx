import { createInertiaApp } from "@inertiajs/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthLayout from "@/layouts/auth-layout";
import SettingsLayout from "@/layouts/settings/layout";
import LearningLayout from "@/layouts/learning-layout";
import ModuleLayout from "@/layouts/module-layout";
import AdminLayout from "@/layouts/admin-layout";

const appName = import.meta.env.VITE_APP_NAME || "Sawala";

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === "welcome":
                return null;
            case name === "learning/module":
                return ModuleLayout;
            case name === "dashboard" || name.startsWith("learning/"):
                return LearningLayout;
            case name.startsWith("admin/"):
                return AdminLayout;
            case name.startsWith("auth/"):
                return AuthLayout;
            case name.startsWith("settings/"):
                return [SettingsLayout];
            default:
                return LearningLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: "#493ee5",
    },
});
