async function mineOneLapisOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the lapis ore block nearby
  const lapisOreBlock = bot.findBlock({
    matching: mcData.blocksByName["lapis_ore"].id,
    maxDistance: 32
  });

  // Step 2: Check if a lapis ore block was found
  if (lapisOreBlock) {
    bot.chat("Found lapis ore, preparing to mine it.");

    // Step 3: Equip the iron pickaxe if not already equipped
    const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
    if (ironPickaxe) {
      await bot.equip(ironPickaxe, "hand");
      bot.chat("Equipped iron pickaxe.");
    } else {
      bot.chat("No iron pickaxe available.");
      return;
    }

    // Step 4: Mine the lapis ore block
    await mineBlock(bot, "lapis_ore", 1);
    bot.chat("Mined 1 lapis ore.");
  } else {
    bot.chat("Could not find any lapis ore nearby.");
  }
}