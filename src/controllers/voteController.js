const Race = require('../models/Race');
const Participant = require('../models/Participant');
const Vote = require('../models/Vote'); // Model voor stemlogging

const voteForMeme = async (req, res) => {
  const { raceId } = req.params; // Race ID uit de URL
  const { wallet, votedMeme } = req.body; // Wallet en gekozen meme uit de body

  try {
    // Zoek de race
    const race = await Race.findOne({ raceId });
    if (!race) {
      return res.status(404).json({ message: 'Race not found' });
    }

    // Controleer of de race gesloten is
    if (race.status === 'closed') {
      return res.status(400).json({ message: 'The race is closed. Voting is no longer allowed.' });
    }

    // Controleer of stemmen mogelijk is (ronde 2 t/m 6)
    if (race.currentRound < 2 || race.currentRound > 6) {
      return res.status(400).json({ message: `Voting is only allowed from round 2 to 6. Current round: ${race.currentRound}` });
    }

    // Zoek de deelnemer
    const participant = await Participant.findOne({ raceId, wallet });
    if (!participant) {
      return res.status(400).json({ message: 'Participant not found for this race' });
    }

    // Controleer of de deelnemer alleen kan stemmen op de gekozen meme
    if (participant.chosenMeme !== votedMeme) {
      return res.status(400).json({
        message: `Invalid vote: You can only vote for your chosen meme (${participant.chosenMeme})`,
      });
    }

    // Controleer of de deelnemer al heeft gestemd in deze ronde
    const alreadyVoted = participant.votes.some((vote) => vote.roundNumber === race.currentRound);
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this round.' });
    }

    // Vind de meme binnen de race
    const meme = race.memes.find((m) => m.name === votedMeme);
    if (!meme) {
      return res.status(400).json({ message: `Meme not found: ${votedMeme}` });
    }

    // Verhoog het aantal stemmen voor de meme
    meme.votes += 1;

    // Log de stem in de `Participant`-gegevens
    participant.votes.push({
      roundNumber: race.currentRound,
      timestamp: new Date(),
    });
    await participant.save();

    // Log de stem in de `Vote`-collectie voor toekomstige analyses
    const voteLog = new Vote({
      raceId,
      round: race.currentRound,
      wallet,
      meme: votedMeme,
      timestamp: new Date(),
    });
    await voteLog.save();

    // Sla de wijzigingen in de race op
    await race.save();

    res.status(200).json({
      message: 'Vote registered successfully',
      votedMeme,
      currentVotes: meme.votes,
    });
  } catch (error) {
    console.error('Error in voteForMeme:', error);
    res.status(500).json({ message: 'Something went wrong while processing your vote.' });
  }
};

module.exports = { voteForMeme };