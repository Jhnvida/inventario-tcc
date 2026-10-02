import { Edit, Plus, Power, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { useClientes, type FiltroStatusCliente, type FiltroTipoCliente } from "../../hooks/useClientes";
import type { Cliente } from "../../types";
import { formatDocumento, formatTelefone } from "../../utils/formatters";
import { ClienteFormModal } from "./ClienteFormModal";
import styles from "./styles.module.css";

export function Clientes() {
    const {
        clientes,
        loading,
        busca,
        setBusca,
        filtroStatus,
        setFiltroStatus,
        filtroTipo,
        setFiltroTipo,
        toggleStatusCliente,
        deleteCliente,
    } = useClientes();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

    function handleOpenCreate() {
        setClienteToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(cliente: Cliente) {
        setClienteToEdit(cliente);
        setIsModalOpen(true);
    }

    async function handleToggleStatus(cliente: Cliente) {
        const novoStatus = !cliente.ativo;
        const acao = novoStatus ? "ativar" : "inativar";
        if (!window.confirm(`Deseja realmente ${acao} o cliente "${cliente.nome}"?`)) {
            return;
        }

        const res = await toggleStatusCliente(cliente.id, cliente.ativo);
        if (!res.success) {
            alert(res.error);
        }
    }

    async function handleDelete(cliente: Cliente) {
        if (!window.confirm(`Deseja realmente excluir o cliente "${cliente.nome}"? Ação irreversível.`)) {
            return;
        }

        const res = await deleteCliente(cliente.id);
        if (!res.success) {
            alert(res.error);
        }
    }

    return (
        <div className="page-container">
            <PageHeader title="Clientes" subtitle="Gerencie sua carteira de clientes, dados cadastrais e situação.">
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Novo Cliente
                </Button>
            </PageHeader>

            <div className={styles.filters_row}>
                <div className={`search-wrapper ${styles.search_field}`}>
                    <Search size={18} className="search-icon" />
                    <Input
                        placeholder="Buscar por nome, documento, e-mail ou cidade..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className={styles.select_filter}>
                    <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as FiltroTipoCliente)}>
                        <option value="todos">Todos os tipos</option>
                        <option value="PF">Pessoa Física</option>
                        <option value="PJ">Pessoa Jurídica</option>
                    </Select>
                </div>

                <div className={styles.select_filter}>
                    <Select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value as FiltroStatusCliente)}
                    >
                        <option value="todos">Todas as situações</option>
                        <option value="ativos">Apenas Ativos</option>
                        <option value="inativos">Apenas Inativos</option>
                    </Select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando clientes...</div>
                ) : clientes.length === 0 ? (
                    <div className="empty-state">Nenhum cliente encontrado.</div>
                ) : (
                    <>
                        <table className="data-table hidden-mobile">
                            <thead>
                                <tr>
                                    <th>Nome / Razão Social</th>
                                    <th className="text-center">Tipo</th>
                                    <th>CPF / CNPJ</th>
                                    <th>Contato</th>
                                    <th>Localização</th>
                                    <th className="text-center">Situação</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.04 },
                                    },
                                }}
                            >
                                {clientes.map((cliente) => (
                                    <motion.tr
                                        key={cliente.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -10 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                        <td>
                                            <div className="fw600">{cliente.nome}</div>
                                            {cliente.email && (
                                                <div className={styles.text_secondary}>{cliente.email}</div>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Badge variant={cliente.tipo_pessoa === "PJ" ? "draft" : "neutral"}>
                                                {cliente.tipo_pessoa === "PJ" ? "PJ" : "PF"}
                                            </Badge>
                                        </td>
                                        <td className="text-monospace">
                                            {formatDocumento(cliente.documento, cliente.tipo_pessoa)}
                                        </td>
                                        <td>{cliente.telefone ? formatTelefone(cliente.telefone) : "-"}</td>
                                        <td>
                                            {cliente.cidade || cliente.estado ? (
                                                <span>
                                                    {cliente.cidade || "-"}
                                                    {cliente.estado ? ` / ${cliente.estado}` : ""}
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Badge variant={cliente.ativo ? "success" : "critical"}>
                                                {cliente.ativo ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </td>
                                        <td className={styles.actions_cell}>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(cliente)}
                                                title="Editar Cliente"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleToggleStatus(cliente)}
                                                title={cliente.ativo ? "Inativar Cliente" : "Ativar Cliente"}
                                            >
                                                <Power
                                                    size={16}
                                                    style={{
                                                        color: cliente.ativo
                                                            ? "var(--color-warning-text, #f59e0b)"
                                                            : "var(--color-success-text)",
                                                    }}
                                                />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleDelete(cliente)}
                                                title="Excluir Cliente"
                                            >
                                                <Trash2 size={16} style={{ color: "var(--color-danger-text)" }} />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>

                        <div className="mobile-cards-list mobile-only">
                            {clientes.map((cliente) => (
                                <div key={cliente.id} className="mobile-card">
                                    <div className="mobile-card-header">
                                        <div>
                                            <div className="mobile-card-title">{cliente.nome}</div>
                                            <div className="mobile-card-subtitle">
                                                {formatDocumento(cliente.documento, cliente.tipo_pessoa)}
                                            </div>
                                        </div>
                                        <Badge variant={cliente.ativo ? "success" : "critical"}>
                                            {cliente.ativo ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </div>
                                    <div className="mobile-card-body">
                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Tipo</span>
                                            <span className="mobile-card-value">
                                                <Badge variant={cliente.tipo_pessoa === "PJ" ? "draft" : "neutral"}>
                                                    {cliente.tipo_pessoa === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                                                </Badge>
                                            </span>
                                        </div>
                                        {cliente.telefone && (
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Telefone</span>
                                                <span className="mobile-card-value">
                                                    {formatTelefone(cliente.telefone)}
                                                </span>
                                            </div>
                                        )}
                                        {cliente.email && (
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">E-mail</span>
                                                <span className="mobile-card-value">{cliente.email}</span>
                                            </div>
                                        )}
                                        {(cliente.cidade || cliente.estado) && (
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Localização</span>
                                                <span className="mobile-card-value">
                                                    {cliente.cidade || "-"}
                                                    {cliente.estado ? ` / ${cliente.estado}` : ""}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="mobile-card-body"
                                        style={{
                                            borderTop: "1px solid var(--color-border)",
                                            paddingTop: "12px",
                                            display: "flex",
                                            gap: "8px",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button variant="ghost" onClick={() => handleOpenEdit(cliente)} title="Editar">
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleToggleStatus(cliente)}
                                            title={cliente.ativo ? "Inativar" : "Ativar"}
                                        >
                                            <Power
                                                size={16}
                                                style={{
                                                    color: cliente.ativo
                                                        ? "var(--color-warning-text, #f59e0b)"
                                                        : "var(--color-success-text)",
                                                }}
                                            />
                                        </Button>
                                        <Button variant="ghost" onClick={() => handleDelete(cliente)} title="Excluir">
                                            <Trash2 size={16} style={{ color: "var(--color-danger-text)" }} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <ClienteFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clienteToEdit={clienteToEdit}
                onSuccess={() => setIsModalOpen(false)}
            />
        </div>
    );
}
