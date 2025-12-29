async function mineThreeIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest iron ore blocks
  let ironOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName["iron_ore"].id,
    maxDistance: 32,
    count: 3
  });

  // Step 2: If not enough iron ore blocks are found, explore until we find them
  if (ironOreBlocks.length < 3) {
    bot.chat("Not enough iron ore nearby, exploring to find more.");
    ironOreBlocks = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlocks({
        matching: mcData.blocksByName["iron_ore"].id,
        maxDistance: 32,
        count: 3
      });
    });
  }

  // Step 3: Equip the iron pickaxe if not already equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  if (ironPickaxe) {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  } else {
    bot.chat("No iron pickaxe available.");
    return;
  }

  // Step 4: Mine the iron ore blocks
  if (ironOreBlocks.length >= 3) {
    bot.chat("Found enough iron ore, mining now.");
    await mineBlock(bot, "iron_ore", 3);
    bot.chat("Mined 3 iron ore.");
  } else {
    bot.chat("Could not find enough iron ore.");
  }
}