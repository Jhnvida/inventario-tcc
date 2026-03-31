const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/dashboard", require("./routes/dashboard"));
app.use("/categorias", require("./routes/categorias"));
app.use("/fornecedores", require("./routes/fornecedores"));
app.use("/produtos", require("./routes/produtos"));
app.use("/pedidos", require("./routes/pedidos"));
app.use("/movimentacoes", require("./routes/movimentacoes"));
app.use("/usuarios", require("./routes/usuarios"));

app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" });
});

const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});

module.exports = app;
