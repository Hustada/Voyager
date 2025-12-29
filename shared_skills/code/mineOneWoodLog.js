async function mineOneWoodLog(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest acacia log block
  const acaciaLogBlock = bot.findBlock({
    matching: mcData.blocksByName["acacia_log"].id,
    maxDistance: 32
  });

  // Step 2: Check if an acacia log block was found
  if (acaciaLogBlock) {
    bot.chat("Found an acacia log, mining it now.");
    // Step 3: Mine the acacia log block
    await mineBlock(bot, "acacia_log", 1);
    bot.chat("Mined 1 acacia log.");
  } else {
    bot.chat("Could not find any acacia logs nearby.");
  }
}