async function mineThreeLapisOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest lapis ore blocks
  let lapisOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName["lapis_ore"].id,
    maxDistance: 32,
    count: 3
  });

  // Step 2: Equip the iron pickaxe if not already equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  if (ironPickaxe) {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  } else {
    bot.chat("No iron pickaxe available.");
    return;
  }

  // Step 3: Mine the lapis ore blocks
  if (lapisOreBlocks.length >= 3) {
    bot.chat("Found enough lapis ore, mining now.");
    await mineBlock(bot, "lapis_ore", 3);
    bot.chat("Mined 3 lapis ore.");
  } else {
    bot.chat("Could not find enough lapis ore.");
  }
}