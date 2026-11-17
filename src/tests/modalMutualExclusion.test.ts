import assert from "node:assert";
import test from "node:test";
import { modalRegistry } from "../components/ui/Modal/modalRegistry.ts";

test("Exclusão mútua: gerenciamento de estado entre Detalhes e Formulário/Editor", () => {
    type ActiveModal = "none" | "details" | "form";

    let activeModal: ActiveModal = "none";
    let pedidoSelecionado: { id: string } | null = null;
    let pedidoEditando: { id: string } | null = null;

    function handleOpenCreate() {
        pedidoSelecionado = null;
        pedidoEditando = null;
        activeModal = "form";
    }

    function handleOpenEdit(pedido: { id: string }) {
        pedidoSelecionado = null;
        pedidoEditando = pedido;
        activeModal = "form";
    }

    function handleOpenDetails(pedido: { id: string }) {
        pedidoEditando = null;
        pedidoSelecionado = pedido;
        activeModal = "details";
    }

    function handleCloseModals() {
        activeModal = "none";
        setPedidoSelecionado(null);
        setPedidoEditando(null);
    }

    function setPedidoSelecionado(val: { id: string } | null) {
        pedidoSelecionado = val;
    }
    function setPedidoEditando(val: { id: string } | null) {
        pedidoEditando = val;
    }

    assert.strictEqual(activeModal, "none");
    assert.strictEqual(pedidoSelecionado, null);
    assert.strictEqual(pedidoEditando, null);

    handleOpenDetails({ id: "pedido-1" });
    assert.strictEqual(activeModal, "details", "Deveria abrir modal de detalhes");
    assert.strictEqual(activeModal === "form", false);
    assert.deepStrictEqual(pedidoSelecionado, { id: "pedido-1" });
    assert.strictEqual(pedidoEditando, null);

    handleOpenEdit({ id: "pedido-1" });
    assert.strictEqual(activeModal === "details", false, "Detalhes deve estar fechado");
    assert.strictEqual(activeModal === "form", true, "Formulário deve estar aberto");
    assert.strictEqual(pedidoSelecionado, null, "Estado do pedido selecionado deve ter sido limpo");
    assert.deepStrictEqual(pedidoEditando, { id: "pedido-1" });

    handleOpenDetails({ id: "pedido-2" });
    assert.strictEqual(activeModal === "details", true, "Detalhes deve estar aberto");
    assert.strictEqual(activeModal === "form", false, "Formulário deve estar fechado");
    assert.deepStrictEqual(pedidoSelecionado, { id: "pedido-2" });
    assert.strictEqual(pedidoEditando, null, "Estado do formulário deve ter sido limpo");

    handleOpenCreate();
    assert.strictEqual(activeModal === "details", false);
    assert.strictEqual(activeModal === "form", true);
    assert.strictEqual(pedidoSelecionado, null);
    assert.strictEqual(pedidoEditando, null);

    handleCloseModals();
    assert.strictEqual(activeModal === "none", true);
    assert.strictEqual(pedidoSelecionado, null);
    assert.strictEqual(pedidoEditando, null);
});

test("Exclusão mútua: exclusão de item ativo fecha modais associados", () => {
    type ActiveModal = "none" | "details" | "form";

    let activeModal: ActiveModal = "details";
    let pedidoSelecionado: { id: string } | null = { id: "pedido-delete-1" };
    let pedidoEditando: { id: string } | null = null;

    function handleCloseModals() {
        activeModal = "none";
        pedidoSelecionado = null;
        pedidoEditando = null;
    }

    function handleDelete(id: string) {
        if (pedidoSelecionado?.id === id || pedidoEditando?.id === id) {
            handleCloseModals();
        }
    }

    handleDelete("outro-pedido");
    assert.strictEqual(activeModal, "details");
    assert.notStrictEqual(pedidoSelecionado, null);

    handleDelete("pedido-delete-1");
    assert.strictEqual(activeModal, "none");
    assert.strictEqual(pedidoSelecionado, null);
});

test("modalRegistry: coordena ciclo de vida global e fecha outros modais instantaneamente", () => {
    modalRegistry.reset();

    let modal1ForceClosed = false;
    let modal2ForceClosed = false;

    modalRegistry.register("modal_1", () => {
        modal1ForceClosed = true;
    });
    modalRegistry.notifyOpened("modal_1");

    assert.strictEqual(modalRegistry.getCurrentOpenModalId(), "modal_1");
    assert.strictEqual(modal1ForceClosed, false);

    modalRegistry.register("modal_2", () => {
        modal2ForceClosed = true;
    });
    modalRegistry.notifyOpened("modal_2");

    assert.strictEqual(modalRegistry.getCurrentOpenModalId(), "modal_2");
    assert.strictEqual(modal1ForceClosed, true, "Modal 1 deve ter sido forçado a fechar imediatamente");
    assert.strictEqual(modal2ForceClosed, false, "Modal 2 é o modal ativo recém-aberto");

    modalRegistry.notifyClosed("modal_2");
    assert.strictEqual(modalRegistry.getCurrentOpenModalId(), null);

    modalRegistry.unregister("modal_1");
    modalRegistry.unregister("modal_2");
    assert.strictEqual(modalRegistry.getSubscribersCount(), 0);
});

test("Preservação de pedido durante animação de saída dos detalhes", () => {
    let pedidoProp: { id: string; status: string } | null = { id: "ped-100", status: "enviado" };
    const activePedidoRef = { current: pedidoProp };

    if (pedidoProp) {
        activePedidoRef.current = pedidoProp;
    }

    let currentPedido = pedidoProp ?? activePedidoRef.current;
    assert.strictEqual(currentPedido?.id, "ped-100");

    pedidoProp = null;
    if (pedidoProp) {
        activePedidoRef.current = pedidoProp;
    }
    currentPedido = pedidoProp ?? activePedidoRef.current;

    assert.notStrictEqual(currentPedido, null);
    assert.strictEqual(currentPedido?.id, "ped-100");
    assert.strictEqual(currentPedido?.status, "enviado");
});
