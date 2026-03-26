const { Router } = require("express");
const controlador = require("../controllers/categorias");

const roteador = Router();

roteador.get("/", controlador.listar);

module.exports = roteador;
