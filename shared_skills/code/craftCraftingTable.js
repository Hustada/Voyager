async function craftCraftingTable(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if there are enough acacia planks to craft a crafting table
  const acaciaPlanksCount = bot.inventory.count(mcData.itemsByName["acacia_planks"].id);
  if (acaciaPlanksCount >= 4) {
    bot.chat("Crafting a crafting table from 4 acacia planks.");

    // Craft the crafting table
    await craftItem(bot, "crafting_table", 1);
    bot.chat("Crafted a crafting table.");
  } else {
    bot.chat("Not enough acacia planks to craft a crafting table.");
  }
}