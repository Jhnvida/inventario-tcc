const aberto = ref(false);

export const usePainel = () => {
  const abrirPainel = () => {
    aberto.value = true;
  };

  const fecharPainel = () => {
    aberto.value = false;
  };

  return { aberto, abrirPainel, fecharPainel };
};
