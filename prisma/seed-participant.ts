import { program } from "commander";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "~/lib/accounts";

const prisma = new PrismaClient();

async function createAccount(name: string, email: string, password: string) {
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: new Date(),
        passwordHash,
        role: Role.PARTICIPANT,
      },
      select: {
        id: true,
      },
    });

    console.log("Successfully created new user with ID %d.", user.id);
    console.log("You may now log in using the e-mail and password you chose.");
  } catch (e) {
    console.error("Failed to create participant account: %o", e);
  }
}

program
  .name("seed-participant")
  .description(
    "This script will create a new participant account based on the data you provide."
  )
  .argument("<name>")
  .argument("<email>")
  .argument("<password>")
  .action((name, email, password) => {
    createAccount(name, email, password)
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });
  });

program.parse();
