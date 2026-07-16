const express = require("express");
const { getStadiumData } = require("../services/stadiumService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(getStadiumData());
});

router.get("/gates", (req, res) => {
  res.json({ gates: getStadiumData().gates });
});

router.get("/sections", (req, res) => {
  res.json({ sections: getStadiumData().sections });
});

router.get("/food", (req, res) => {
  res.json({ foodCounters: getStadiumData().foodCounters });
});

router.get("/transport", (req, res) => {
  res.json(getStadiumData().transport);
});

module.exports = router;
