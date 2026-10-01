const prisma = require('./prisma');
const { combos } = require('../../scripts/update-combos-content');

async function seedCombos() {
  try {
    const count = await prisma.combo.count();
    if (count > 0) {
      console.log('Combos already seeded in database.');
      return;
    }

    console.log(`Database table "Combo" is empty. Seeding ${combos.length} premium combos...`);

    await prisma.combo.createMany({
      data: combos.map((combo) => ({
        ...combo,
        image: '/Banner.png',
        isVisible: true,
      })),
    });
    console.log(`Seeded ${combos.length} premium combos successfully!`);
  } catch (err) {
    console.error('Error seeding combos:', err);
  }
}

module.exports = {
  seedCombos,
};
