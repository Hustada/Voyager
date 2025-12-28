async function craftWoodenPickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Place the crafting table near the bot
  const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, "crafting_table", craftingTablePosition);
  bot.chat("Placed the crafting table.");

  // Step 2: Craft the wooden pickaxe
  await craftItem(bot, "wooden_pickaxe", 1);
  bot.chat("Crafted a wooden pickaxe.");
}