import StitchShell from "@/layouts/stitch-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <StitchShell admin>{children}</StitchShell>;
}
