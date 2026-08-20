import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./PrivateRoute.module.css";

export function PrivateRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className={styles.loading_container}>Carregando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
