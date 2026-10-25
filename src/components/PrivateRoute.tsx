import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "./ui/Skeleton";

export function PrivateRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 animate-fade-in">
                <div className="w-10 h-10 border-3 border-slate-800 border-t-transparent rounded-full animate-spin" />
                <div className="flex flex-col items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-700">Verificando credenciais...</p>
                    <Skeleton className="w-32 h-2" />
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
