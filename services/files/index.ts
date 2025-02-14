import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/utils";

const getFileById = async (id: string) => {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id,
      },
    });

    return file;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export { getFileById };
