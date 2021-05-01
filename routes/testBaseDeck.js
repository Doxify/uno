const express = require("express");
const router = express.Router();
const db = require("../database/connection");

const BaseDeck = require("../database/base_deck_orm.js")
router.get("/", (request, response) => {
    console.log(BaseDeck.getDeck());
});


module.exports = router;