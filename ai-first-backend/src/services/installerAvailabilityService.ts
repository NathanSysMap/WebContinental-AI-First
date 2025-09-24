import { PrismaClient, Shift } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAvailability(data: {installerId: string, date: Date, shift: Shift}) {
    const existing = await prisma.installerAvailability.findFirst({
        where: { 
          installerId: data.installerId,
          date: data.date,
          shift: data.shift
         },
    });

    if (existing) {
        throw new Error("O período selecionado já está ocupado, selecione outro turno ou outro dia!");
    }
    
    const availability = await prisma.installerAvailability.create({
        data: {
          installerId: data.installerId,
          date: data.date,
          shift: data.shift
        }
    });

    return availability;
}

export async function updateAvailability(id: number, data: any) {
  return prisma.installerAvailability.update({
    where: { id },
    data,
  });
}

export async function listAvailabilitiesByInstaller(installerId: string) {
  return prisma.installerAvailability.findMany({
    where: {
       installerId,
       available: true
       },
    orderBy: [{ date: "asc" }, { shift: "asc" }],
  });
}

export async function findAvailableInstallers(city: string, state: string, minDate: Date) {
  return prisma.installer.findMany({
    where: {
      active: true,
      city,
      state,
      availability: {
        some: {
          date: { gte: minDate },
          available: true,
        },
      },
    },
    include: { availability: true },
  });
}

export async function occupyAvailability(id: number) {
  return prisma.installerAvailability.update({
    where: { id },
    data: { available: false },
  });
}

export async function generateInstallerAvailabilities(installerId: string, days: number) {
  const today = new Date();

  for(let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    if(date.getDay() === 0 || date.getDay() === 6) continue;

    await createAvailability({installerId, date, shift: Shift.MANHA});

    await createAvailability({installerId, date, shift: Shift.TARDE});


  }

  console.log("Disponibilidades criadas para o profissional");
}