const Vote = require("../models/Vote");
const Race = require("../models/Race");
const Participant = require("../models/Participant");
const { sendVoteUpdate } = require("../socket");

/**
 * Cast a vote for a meme in an active race.
 * @route POST /api/votes/:raceId
 */
const castVote = async (req, res) => {
  const { raceId } = req.params;
  const { walletAddress, memeId } = req.body;

  try {
    console.log(`🗳️ New vote: Race ${raceId}, Wallet ${walletAddress}, Meme ${memeId}`);

    // ✅ **1️⃣ Check if the race is active**
    const race = await Race.findOne({ raceId, status: "active" });
    if (!race) {
      return res.status(400).json({ message: "Race is not active or does not exist" });
    }

    // ✅ **2️⃣ Prevent voting in round 1**
    if (race.currentRound === 1) {
      return res.status(403).json({ message: "Voting is not allowed in round 1" });
    }

    // ✅ **3️⃣ Check if the user is a participant**
    const participant = await Participant.findOne({ raceId, walletAddress });
    if (!participant) {
      return res.status(403).json({ message: "You are not a participant in this race" });
    }

    // ✅ **4️⃣ Ensure the participant has not already voted this round**
    if (participant.hasVotedInRounds.includes(race.currentRound)) {
      return res.status(403).json({ message: "You have already voted in this round" });
    }

    // ✅ **5️⃣ Ensure the participant chose a meme in round 1**
    if (!participant.memeId) {
      return res.status(403).json({ message: "You did not choose a meme in round 1 and cannot vote" });
    }

    // ✅ **6️⃣ Ensure the participant votes for their chosen meme**
    if (memeId !== participant.memeId.toString()) {
      return res.status(403).json({ message: "You can only vote for the meme you chose in round 1" });
    }

    // ✅ **7️⃣ Save the vote**
    const newVote = new Vote({
      raceId,
      roundNumber: race.currentRound,
      walletAddress,
      memeId,
    });

    await newVote.save();

    // ✅ **8️⃣ Update the participant to record that they have voted**
    participant.hasVotedInRounds.push(race.currentRound);
    await participant.save();

    // ✅ **9️⃣ Count total votes for this meme**
    const totalVotes = await Vote.countDocuments({
        raceId,
        memeId,
        status: "pending",
        roundNumber: race.currentRound // ✅ Alleen stemmen van de huidige ronde meetellen
    });
    console.log(`📡 [SOCKET] Verzenden voteUpdate: Race ${raceId}, Meme ${memeId}, Ronde ${race.currentRound}, TotalVotes: ${totalVotes}`);

    // ✅ **🔄 Send WebSocket update with memeId & totalVotes**
    sendVoteUpdate({ raceId, memeId, totalVotes });

    res.status(201).json({ message: "Vote successfully cast", vote: newVote });
  } catch (error) {
    console.error("[ERROR] ❌ Error casting vote:", error);
    res.status(500).json({ message: "Error casting vote", error: error.message });
  }
};

module.exports = {
  castVote,
};