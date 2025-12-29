async function mineThreeIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest iron ore blocks
  let ironOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName["iron_ore"].id,
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

  // Step 3: Mine the iron ore blocks
  if (ironOreBlocks.length >= 3) {
    bot.chat("Found enough iron ore, mining now.");
    await mineBlock(bot, "iron_ore", 3);
    bot.chat("Mined 3 iron ore.");
  } else {
    bot.chat("Could not find enough iron ore.");
  }
}