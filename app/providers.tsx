"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#1a1a1a",
                        color: "#fff",
                        border: "1px solid #22c55e",
                        borderRadius: "12px",
                    },
                    success: { iconTheme: { primary: "#22c55e", secondary: "#000" } },
                    error: { iconTheme: { primary: "#f97316", secondary: "#000" } },
                }}
            />
        </SessionProvider>
    );
}
