const { Router } = require("express");
const controlador = require("../controllers/fornecedores");

const roteador = Router();

roteador.get("/", controlador.listar);

module.exports = roteador;
