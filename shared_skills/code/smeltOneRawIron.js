async function smeltOneRawIron(bot) {
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

  // Step 2: Smelt 1 raw iron using coal as fuel
  const rawIronCount = 1;
  const fuelName = "coal";
  await smeltItem(bot, "raw_iron", fuelName, rawIronCount);
  bot.chat("Smelted 1 raw iron into an iron ingot.");
}