async function obtainAcaciaLogs(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check how many acacia logs are needed
  const logsNeeded = 4;
  const currentLogs = bot.inventory.count(mcData.itemsByName["acacia_log"].id);
  const logsToMine = logsNeeded - currentLogs;
  if (logsToMine > 0) {
    bot.chat(`Need to mine ${logsToMine} more acacia logs.`);

    // Locate the nearest acacia log blocks
    const acaciaLogBlocks = bot.findBlocks({
      matching: mcData.blocksByName["acacia_log"].id,
      maxDistance: 32,
      count: logsToMine
    });
    if (acaciaLogBlocks.length > 0) {
      bot.chat("Found acacia logs, mining now.");
      await mineBlock(bot, "acacia_log", logsToMine);
      bot.chat(`Mined ${logsToMine} acacia logs.`);
    } else {
      bot.chat("Could not find enough acacia logs nearby.");
    }
  } else {
    bot.chat("Already have enough acacia logs.");
  }
}