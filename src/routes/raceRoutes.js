const express = require("express");
const { startRace, getRace, getAllRaces, updateRaceStatus } = require("../controllers/raceController");

const router = express.Router();

router.post("/", startRace); // Start een nieuwe race
router.get("/", getAllRaces); // ✅ Haal alle races op
router.get("/:raceId", getRace); // Haal een specifieke race op
router.patch("/:raceId/status", updateRaceStatus); // Wijzig de status van een race

module.exports = router;