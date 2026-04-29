require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboard");
const produtosRoutes = require("./routes/produtos");
const fornecedoresRoutes = require("./routes/fornecedores");
const pedidosRoutes = require("./routes/pedidos");
const movimentacoesRoutes = require("./routes/movimentacoes");
const metaRoutes = require("./routes/meta");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.use("/dashboard", dashboardRoutes);
app.use("/produtos", produtosRoutes);
app.use("/fornecedores", fornecedoresRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/movimentacoes", movimentacoesRoutes);
app.use("/", metaRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Erro interno.", detail: err.message });
});

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
