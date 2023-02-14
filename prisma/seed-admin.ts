import { PrismaClient, Role } from "@prisma/client";
import { createInterface as readlineCreateInterface } from "readline";
import { stdin as input, stdout as output } from "process";
import { hashPassword } from "~/lib/accounts";

const prisma = new PrismaClient();

async function main() {
  const rl = readlineCreateInterface({ input, output });

  console.log(
    "This script will create a new admin user account based on the data you provide."
  );

  rl.question("Name: ", (name: string) => {
    rl.question("Admin e-mail: ", (email: string) => {
      rl.question("Admin password: ", async (password: string) => {
        const passwordHash = await hashPassword(password);

        try {
          const user = await prisma.user.create({
            data: {
              name,
              email,
              emailVerified: new Date(),
              passwordHash,
              role: Role.ADMIN,
            },
            select: {
              id: true,
            },
          });

          console.log("Successfully created new user with ID %d.", user.id);
          console.log(
            "You may now log in using the e-mail and password you chose."
          );
        } catch (e) {
          console.error("Failed to create admin account: %o", e);
        }

        rl.close();
      });
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
