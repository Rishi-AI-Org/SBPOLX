import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Default categories
  const categoryNames = [
    "Textbooks",
    "Electronics",
    "Furniture",
    "Clothing",
    "Kitchen & Appliances",
    "Sports & Fitness",
    "Stationery",
    "Miscellaneous",
  ];

  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Created ${categoryNames.length} default categories`);

  // Whitelist emails - ADD YOUR STUDENT EMAILS HERE
  const allowedEmails = [
    "admin@example.edu",
    // Add more institutional emails below:
    // "student1@institution.edu",
    // "student2@institution.edu",
  ];

  for (const email of allowedEmails) {
    await prisma.allowedEmail.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }
  console.log(`Whitelisted ${allowedEmails.length} emails`);

  // Create admin user
  const adminEmail = "admin@example.edu";
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      displayName: "Admin",
      isAdmin: true,
    },
  });
  console.log(
    `Admin user created: ${adminEmail} / admin123 (CHANGE THIS PASSWORD)`
  );

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
