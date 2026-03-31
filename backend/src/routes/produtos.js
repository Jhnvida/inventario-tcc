const { Router } = require("express");
const controlador = require("../controllers/produtos");

const roteador = Router();

roteador.get("/", controlador.listar);

module.exports = roteador;
