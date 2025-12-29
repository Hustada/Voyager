async function mineThreeCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest coal ore blocks
  let coalOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName["coal_ore"].id,
    maxDistance: 32,
    count: 3
  });

  // Step 2: Check if there are enough coal ore blocks
  if (coalOreBlocks.length >= 3) {
    bot.chat("Found enough coal ore, preparing to mine.");

    // Step 3: Equip the iron pickaxe if not already equipped
    const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
    if (ironPickaxe) {
      await bot.equip(ironPickaxe, "hand");
      bot.chat("Equipped iron pickaxe.");
    } else {
      bot.chat("No iron pickaxe available.");
      return;
    }

    // Step 4: Mine the coal ore blocks
    await mineBlock(bot, "coal_ore", 3);
    bot.chat("Mined 3 coal ore.");
  } else {
    bot.chat("Could not find enough coal ore nearby.");
  }
}