const express = require("express");
const { createOrder, getAllOrders } = require("../controllers/orderController.js");

const router = express.Router();

router.post("/createorder", createOrder);
router.get("/getallorders", getAllOrders);

module.exports = router;
