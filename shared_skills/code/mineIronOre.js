async function mineIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Locate the iron ore block nearby
  const ironOreBlock = bot.findBlock({
    matching: mcData.blocksByName["iron_ore"].id,
    maxDistance: 32
  });
  if (ironOreBlock) {
    bot.chat("Found iron ore, mining it now.");

    // Step 2: Use the stone pickaxe to mine the iron ore
    await mineBlock(bot, "iron_ore", 1);
    bot.chat("Mined 1 iron ore.");
  } else {
    bot.chat("Could not find any iron ore nearby.");
  }
}