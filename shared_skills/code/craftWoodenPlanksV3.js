async function craftWoodenPlanks(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if the bot has at least 1 acacia log
  const acaciaLogCount = bot.inventory.count(mcData.itemsByName["acacia_log"].id);
  if (acaciaLogCount >= 1) {
    bot.chat("Crafting 4 wooden planks from 1 acacia log.");

    // Craft 4 wooden planks from 1 acacia log
    await craftItem(bot, "acacia_planks", 1);
    bot.chat("Crafted 4 wooden planks.");
  } else {
    bot.chat("Not enough acacia logs to craft wooden planks.");
  }
}