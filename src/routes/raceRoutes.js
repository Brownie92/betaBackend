const express = require("express");
const { startRace, getRace, getAllRaces, updateRaceStatus } = require("../controllers/raceController");

const router = express.Router();

// ✅ Start a new race
router.post("/", startRace);

// ✅ Retrieve all races
router.get("/", getAllRaces);

// ✅ Retrieve a specific race by ID
router.get("/:raceId", getRace);

// ✅ Update the status of a race
router.patch("/:raceId/status", updateRaceStatus);

module.exports = router;