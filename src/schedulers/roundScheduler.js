const cron = require('node-cron');
const Race = require('../models/Race');
const { processRound } = require('../controllers/roundController');

console.log('[INFO] ⏳ Round scheduler started...');

// 🔄 Elke minuut controleren of een ronde verlopen is
cron.schedule('* * * * *', async () => {
    console.log('[INFO] 🔍 Checking for races with expired rounds...');
    
    try {
        const now = new Date();
        const activeRaces = await Race.find({ status: 'active', roundEndTime: { $lte: now } });

        if (activeRaces.length === 0) {
            console.log('[INFO] ✅ No expired rounds found.');
            return;
        }

        console.log(`[INFO] ⏳ Found ${activeRaces.length} races with expired rounds. Processing...`);

        for (const race of activeRaces) {
            try {
                await processRound(race);
                console.log(`[INFO] ✅ Processed round ${race.currentRound} for race ${race.raceId}`);
            } catch (error) {
                console.error(`[ERROR] ❌ Failed to process round for race ${race.raceId}:`, error);
            }
        }
    } catch (error) {
        console.error('[ERROR] ❌ Failed to check races:', error);
    }
});