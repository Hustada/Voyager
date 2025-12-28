async function mineWoodLog(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Explore until we find a wood log (acacia_log in savanna)
  const logBlock = await exploreUntil(bot, new Vec3(1, 0, 1), 60, () => {
    return bot.findBlock({
      matching: mcData.blocksByName["acacia_log"].id,
      maxDistance: 32
    });
  });
  if (logBlock) {
    bot.chat("Found an acacia log, mining it now.");
    // Step 2: Mine the wood log
    await mineBlock(bot, "acacia_log", 1);
    bot.chat("Mined 1 acacia log.");
  } else {
    bot.chat("Could not find any acacia logs nearby.");
  }
}