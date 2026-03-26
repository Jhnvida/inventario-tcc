const { Router } = require("express");
const controlador = require("../controllers/movimentacoes");

const roteador = Router();

roteador.get("/", controlador.listar);

module.exports = roteador;
