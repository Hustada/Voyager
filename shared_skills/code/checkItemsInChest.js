async function checkItemsInChest(bot) {
  const chestPosition = new Vec3(-1022, 63, -193);
  await checkItemInsideChest(bot, chestPosition);
}