async function mineThreeCopperOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest copper ore blocks
  let copperOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName["copper_ore"].id,
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

  // Step 3: Mine the copper ore blocks
  if (copperOreBlocks.length >= 3) {
    bot.chat("Found enough copper ore, mining now.");
    await mineBlock(bot, "copper_ore", 3);
    bot.chat("Mined 3 copper ore.");
  } else {
    bot.chat("Could not find enough copper ore.");
  }
}