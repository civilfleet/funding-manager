import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function populateDefaultFormConfiguration() {
  try {
    console.log("Starting form configuration population...");

    // Get all teams that don't have form configuration yet
    const teams = await prisma.teams.findMany({
      where: {
        formSections: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`Found ${teams.length} teams without form configuration`);

    for (const team of teams) {
      console.log(`Creating default configuration for team: ${team.name}`);

      await prisma.$transaction(async (tx) => {
        // Create Basic Information section
        const basicSection = await tx.formSection.create({
          data: {
            name: "Basic Information",
            description: "Essential project details",
            order: 1,
            teamId: team.id,
          },
        });

        await tx.formField.createMany({
          data: [
            {
              key: "name",
              label: "Project Name",
              description:
                "Provide a clear, concise name for your funding request",
              type: "TEXT",
              placeholder: "Enter the name of your project",
              isRequired: true,
              order: 1,
              minLength: 3,
              sectionId: basicSection.id,
            },
            {
              key: "amountRequested",
              label: "Amount Requested",
              type: "NUMBER",
              placeholder: "0.00",
              isRequired: true,
              order: 2,
              minValue: 0,
              sectionId: basicSection.id,
            },
            {
              key: "expectedCompletionDate",
              label: "Expected Completion Date",
              type: "DATE",
              isRequired: true,
              order: 3,
              sectionId: basicSection.id,
            },
          ],
        });

        // Create Project Details section
        const projectSection = await tx.formSection.create({
          data: {
            name: "Project Details",
            description: "Detailed information about your project",
            order: 2,
            teamId: team.id,
          },
        });

        await tx.formField.createMany({
          data: [
            {
              key: "description",
              label: "Project Description",
              description:
                "Explain what your project is about and why it matters",
              type: "TEXTAREA",
              placeholder: "Provide a detailed description of your project",
              isRequired: true,
              order: 1,
              minLength: 10,
              sectionId: projectSection.id,
            },
            {
              key: "purpose",
              label: "Project Purpose",
              description: "Clearly state the objectives and intended outcomes",
              type: "TEXTAREA",
              placeholder: "Describe the purpose and goals of your project",
              isRequired: true,
              order: 2,
              minLength: 10,
              sectionId: projectSection.id,
            },
          ],
        });

        // Create Financial Planning section
        const financialSection = await tx.formSection.create({
          data: {
            name: "Financial Planning",
            description: "Financial sustainability and planning details",
            order: 3,
            teamId: team.id,
          },
        });

        await tx.formField.createMany({
          data: [
            {
              key: "refinancingConcept",
              label: "Refinancing Concept",
              description:
                "Detail how the project will be financially sustainable after initial funding",
              type: "TEXTAREA",
              placeholder: "Explain your refinancing strategy",
              isRequired: true,
              order: 1,
              minLength: 10,
              sectionId: financialSection.id,
            },
            {
              key: "sustainability",
              label: "Sustainability Plan",
              description:
                "Outline the long-term viability and impact of your project",
              type: "TEXTAREA",
              placeholder:
                "Describe how your project will be sustainable in the long term",
              isRequired: true,
              order: 2,
              minLength: 10,
              sectionId: financialSection.id,
            },
          ],
        });
      });

      console.log(`✓ Created default configuration for team: ${team.name}`);
    }

    console.log("Form configuration population completed successfully!");
  } catch (error) {
    console.error("Error populating form configurations:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  populateDefaultFormConfiguration()
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export { populateDefaultFormConfiguration };
