import { AnimatedBackground } from "@/components/auth/animated-background"
import { AuthCard } from "@/components/auth/auth-card"

export default function AuthPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4">
            <AnimatedBackground />
            <div className="relative z-10 w-full max-w-md">
                <AuthCard />
            </div>
        </div>
    )
}