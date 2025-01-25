const Participant = require('../models/Participant'); // Nieuw model
const Race = require('../models/Race'); // Om te controleren of de race bestaat

const registerWallet = async (req, res) => {
  const { raceId } = req.params;
  const { wallet, chosenMeme } = req.body;

  try {
    // Check if the race exists
    const race = await Race.findOne({ raceId });
    if (!race) {
      return res.status(404).json({ message: 'Race not found' });
    }

    // Check if the wallet is already registered for this race
    const existingParticipant = await Participant.findOne({ raceId, wallet });
    if (existingParticipant) {
      return res.status(400).json({ message: 'Wallet already registered' });
    }

    // Validate that the chosen meme exists in the race
    const validMeme = race.memes.find((meme) => meme.name === chosenMeme);
    if (!validMeme) {
      return res.status(400).json({ message: `Invalid meme selection: ${chosenMeme}` });
    }

    // Create a new participant
    const participant = new Participant({ raceId, wallet, chosenMeme });
    await participant.save();

    res.status(201).json({ message: 'Wallet registered successfully', participant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { registerWallet };