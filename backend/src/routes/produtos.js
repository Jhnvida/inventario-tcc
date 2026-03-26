const { Router } = require("express");
const controlador = require("../controllers/produtos");

const roteador = Router();

roteador.get("/", controlador.listar);
roteador.get("/:id", controlador.detalhar);

module.exports = roteador;
