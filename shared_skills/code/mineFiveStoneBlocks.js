async function mineFiveStoneBlocks(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the nearest stone blocks
  let stoneBlocks = bot.findBlocks({
    matching: mcData.blocksByName["stone"].id,
    maxDistance: 32,
    count: 5
  });

  // Step 2: If not enough stone blocks are found, explore until we find them
  if (stoneBlocks.length < 5) {
    bot.chat("Not enough stone nearby, exploring to find more.");
    stoneBlocks = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlocks({
        matching: mcData.blocksByName["stone"].id,
        maxDistance: 32,
        count: 5
      });
    });
  }

  // Step 3: Mine the stone blocks
  if (stoneBlocks.length >= 5) {
    bot.chat("Found enough stone, mining now.");
    await mineBlock(bot, "stone", 5);
    bot.chat("Mined 5 stone blocks.");
  } else {
    bot.chat("Could not find enough stone.");
  }
}