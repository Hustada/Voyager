async function smeltRawCopper(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Check if a furnace is already placed nearby
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });

  // If no furnace is found, place one from the inventory
  if (!furnaceBlock) {
    const furnacePosition = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", furnacePosition);
    bot.chat("Placed a furnace.");
    furnaceBlock = bot.blockAt(furnacePosition);
  }

  // Step 2: Smelt 8 raw copper using coal as fuel
  const rawCopperCount = 8;
  const fuelName = "coal";
  await smeltItem(bot, "raw_copper", fuelName, rawCopperCount);
  bot.chat("Smelted 8 raw copper into copper ingots.");
}