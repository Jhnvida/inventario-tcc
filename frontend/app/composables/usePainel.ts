const painelAberto = ref(false);

export const usePainel = () => {
    const abrirPainel = () => {
        painelAberto.value = true;
    };

    const fecharPainel = () => {
        painelAberto.value = false;
    };

    const alternarPainel = () => {
        painelAberto.value = !painelAberto.value;
    };

    return {
        painelAberto,
        abrirPainel,
        fecharPainel,
        alternarPainel,
    };
};
