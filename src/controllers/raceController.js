const Race = require('../models/Race');
const Meme = require('../models/Meme');
const Participant = require('../models/Participant'); // Import the new Participant model

// New race start
const startRace = async (req, res) => {
  const { raceId } = req.body;

  try {
    // Check if the race ID already exists
    const existingRace = await Race.findOne({ raceId });
    if (existingRace) {
      return res.status(400).json({ message: 'Race ID already exists' });
    }

    // Retrieve exactly 6 random memes from the database
    const randomMemes = await Meme.aggregate([{ $sample: { size: 6 } }]);
    if (randomMemes.length < 6) {
      return res.status(400).json({ message: 'Not enough memes in the database' });
    }

    // Create a new race
    const race = new Race({
      raceId,
      memes: randomMemes.map((meme) => ({ name: meme.name, url: meme.url })), // Include meme URL for frontend usage
      currentRound: 1,
      roundEndTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // Set round end time to 8 hours from now
    });

    // Save the race to the database
    await race.save();
    res.status(201).json({ message: 'Race created successfully', race });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create race' });
  }
};

// Controller to fetch race details by ID
const getRace = async (req, res) => {
  const { raceId } = req.params;

  try {
    // Find the race by its ID
    const race = await Race.findOne({ raceId });
    if (!race) {
      return res.status(404).json({ message: 'Race not found' });
    }

    // Find all participants for the race
    const participants = await Participant.find({ raceId });

    // Combine race data with participants
    res.status(200).json({
      ...race.toObject(), // Convert Mongoose document to plain object
      participants, // Add participants from the separate collection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch race details' });
  }
};

// Export both controllers
module.exports = {
  startRace,
  getRace,
};