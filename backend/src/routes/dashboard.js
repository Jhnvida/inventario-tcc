const { Router } = require("express");
const controlador = require("../controllers/dashboard");

const roteador = Router();

roteador.get("/", controlador.resumo);

module.exports = roteador;
