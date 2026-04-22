const { Router } = require("express");
const controlador = require("../controllers/fornecedores");

const roteador = Router();

roteador.get("/", controlador.listar);
roteador.get("/:id", controlador.buscarPorId);
roteador.post("/", controlador.criar);
roteador.put("/:id", controlador.atualizar);
roteador.delete("/:id", controlador.remover);

module.exports = roteador;
