async function mineFiveCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest coal ore blocks
  let coalOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName["coal_ore"].id,
    maxDistance: 32,
    count: 5
  });

  // Step 2: If not enough coal ore blocks are found, explore until we find them
  if (coalOreBlocks.length < 5) {
    bot.chat("Not enough coal ore nearby, exploring to find more.");
    coalOreBlocks = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlocks({
        matching: mcData.blocksByName["coal_ore"].id,
        maxDistance: 32,
        count: 5
      });
    });
  }

  // Step 3: Mine the coal ore blocks
  if (coalOreBlocks.length >= 5) {
    bot.chat("Found enough coal ore, mining now.");
    await mineBlock(bot, "coal_ore", 5);
    bot.chat("Mined 5 coal ore.");
  } else {
    bot.chat("Could not find enough coal ore.");
  }
}