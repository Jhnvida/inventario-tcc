import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PrivateRoute } from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { Categorias } from "./pages/Categorias";
import { Dashboard } from "./pages/Dashboard";
import { Fornecedores } from "./pages/Fornecedores";
import { Login } from "./pages/Login";
import { Movimentacoes } from "./pages/Movimentacoes";
import { Pedidos } from "./pages/Pedidos";
import { Produtos } from "./pages/Produtos";
import { Usuarios } from "./pages/Usuarios";

export function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="produtos" element={<Produtos />} />
                            <Route path="movimentacoes" element={<Movimentacoes />} />
                            <Route path="pedidos" element={<Pedidos />} />
                            <Route path="fornecedores" element={<Fornecedores />} />
                            <Route path="categorias" element={<Categorias />} />
                            <Route path="usuarios" element={<Usuarios />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
