import { prisma } from "@/lib/prisma";
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { business: true },
  });
}

export async function createBusinessAndUser(params: {
  businessName: string;
  userName: string;
  email: string;
  passwordHash: string;
}) {
  const { businessName, userName, email, passwordHash } = params;
  return prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: businessName,
      },
    });

    const user = await tx.user.create({
      data: {
        name: userName,
        email,
        passwordHash,
        businessId: business.id,
      },
    });
    return { business, user };
  });
}
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { business: true },
  });
}
