const Race = require('../models/Race');
const Participant = require('../models/Participant');
const Vote = require('../models/Vote'); // Nieuw model voor stemlogging

const voteForMeme = async (req, res) => {
  const { raceId } = req.params;
  const { wallet, votedMeme } = req.body;

  try {
    // Controleer of de race bestaat
    const race = await Race.findOne({ raceId });
    if (!race) {
      return res.status(404).json({ message: 'Race not found' });
    }

    // Controleer of de race gesloten is
    if (race.status === 'closed') {
      return res.status(400).json({
        message: 'The race has ended. Voting is no longer allowed.'
      });
    }

    // Controleer of stemmen mogelijk is (ronde 2 t/m 6)
    if (race.currentRound < 2 || race.currentRound > 6) {
      return res.status(400).json({
        message: `Voting is only allowed from round 2 to 6. Current round: ${race.currentRound}`
      });
    }

    // Controleer of de deelnemer bestaat in de aparte collectie
    const participant = await Participant.findOne({ raceId, wallet });
    if (!participant) {
      return res.status(400).json({ message: 'Wallet not registered for this race' });
    }

    // Controleer of de deelnemer stemt op zijn gekozen meme
    if (participant.chosenMeme !== votedMeme) {
      return res.status(400).json({
        message: `Invalid vote: You can only vote for your chosen meme (${participant.chosenMeme})`
      });
    }

    // Controleer of de gekozen meme geldig is in de race
    const meme = race.memes.find((m) => m.name === votedMeme);
    if (!meme) {
      return res.status(400).json({ message: `Invalid meme selection: ${votedMeme}` });
    }

    // Log de stem in de votes-collectie
    const vote = new Vote({
      raceId,
      round: race.currentRound,
      wallet,
      meme: votedMeme,
      timestamp: new Date()
    });
    await vote.save();

    // Voeg de stem toe aan de meme
    meme.votes += 1;

    // Sla de wijzigingen op in de race
    await race.save();

    res.status(200).json({
      message: 'Vote registered successfully',
      votedMeme
    });
  } catch (error) {
    console.error('Error in voteForMeme:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { voteForMeme };