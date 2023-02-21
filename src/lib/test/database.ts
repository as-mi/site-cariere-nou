import prisma from "~/lib/prisma";

/** Custom error class used to force Prisma to roll back a transaction. */
class Rollback extends Error {}

type PrismaClient = typeof prisma;
type $Transaction = PrismaClient["$transaction"];
type $TransactionCallback = Parameters<$Transaction>[0];
type TransactionClient = Parameters<$TransactionCallback>[0];

/**
 * Runs the given function inside a Prisma transaction,
 * which is rolled back as soon as the function returns.
 *
 * This allows the test code to not affect the local database.
 */
export const wrapInTransaction = async (
  perform: (tx: TransactionClient) => Promise<void>
) => {
  try {
    // Begin a new transaction
    await prisma.$transaction(async (tx) => {
      // Run the provided code
      await perform(tx);

      // Throw an exception to ensure modifications don't get commited
      throw new Rollback();
    });
  } catch (e) {
    // If the transaction failed due to an unexpected reason, rethrow the error
    if (!(e instanceof Rollback)) {
      throw e;
    }
  }
};
