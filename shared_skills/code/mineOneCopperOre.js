async function mineOneCopperOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest copper ore block
  const copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName["copper_ore"].id,
    maxDistance: 32
  });

  // Step 2: Check if a copper ore block was found
  if (copperOreBlock) {
    bot.chat("Found copper ore, preparing to mine it.");

    // Step 3: Equip the iron pickaxe if not already equipped
    const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
    if (ironPickaxe) {
      await bot.equip(ironPickaxe, "hand");
      bot.chat("Equipped iron pickaxe.");
    } else {
      bot.chat("No iron pickaxe available.");
      return;
    }

    // Step 4: Mine the copper ore block
    await mineBlock(bot, "copper_ore", 1);
    bot.chat("Mined 1 copper ore.");
  } else {
    bot.chat("Could not find any copper ore nearby.");
  }
}