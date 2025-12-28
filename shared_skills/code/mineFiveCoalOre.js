async function mineFiveCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Explore until 5 coal ore blocks are found
  let coalOreBlocks = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
    return bot.findBlocks({
      matching: mcData.blocksByName["coal_ore"].id,
      maxDistance: 32,
      count: 5
    });
  });

  // Step 2: Check if enough coal ore blocks were found
  if (coalOreBlocks.length >= 5) {
    bot.chat("Found enough coal ore, mining now.");

    // Step 3: Equip the iron pickaxe if not already equipped
    const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
    if (ironPickaxe) {
      await bot.equip(ironPickaxe, "hand");
    }

    // Step 4: Mine the coal ore blocks
    await mineBlock(bot, "coal_ore", 5);
    bot.chat("Mined 5 coal ore.");
  } else {
    bot.chat("Could not find enough coal ore.");
  }
}