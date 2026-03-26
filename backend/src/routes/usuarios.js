const { Router } = require("express");
const controlador = require("../controllers/usuarios");

const roteador = Router();

roteador.get("/", controlador.listar);

module.exports = roteador;
