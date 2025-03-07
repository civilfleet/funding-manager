// app/api/cron/reminders/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getDonationAgreementPastEightWeeks,
  getDonationAgreementPastSevenDays,
} from "@/services/donation-agreement";
import { sendEmail } from "@/lib/nodemailer";

export async function GET() {
  try {
    const donationsForReceiptReminder =
      await getDonationAgreementPastSevenDays();

    const donationsForBudgetReportReminder =
      await getDonationAgreementPastEightWeeks();

    // Send receipt reminders
    for (const donation of donationsForReceiptReminder) {
      sendEmail(
        {
          to: donation?.organization?.email as string,
          subject: "Reminder: Please Upload Your Donation Receipt",
          template: "reminder",
        },
        {
          fundingRequestName: donation?.fundingRequest?.name,
          reminderMessage: "Upload funds transfer receipt.",
          actionLink: `${process.env.NEXT_PUBLIC_BASE_URL}/organization/funding-request/${donation?.fundingRequest?.id}`,
          actionButtonText: "Upload Receipt",
          supportEmail: donation?.team?.email,
          teamName: donation?.team?.name,
        }
      );
    }

    // Send budget and report reminders
    for (const donation of donationsForBudgetReportReminder) {
      sendEmail(
        {
          to: donation?.organization?.email as string,
          subject: "Reminder: Please Upload Your Donation Receipt",
          template: "reminder",
        },
        {
          fundingRequestName: donation?.fundingRequest?.name,
          reminderMessage: "Upload budget statement and report.",
          actionLink: `${process.env.NEXT_PUBLIC_BASE_URL}/organization/funding-request/${donation?.fundingRequest?.id}`,
          actionButtonText: "Upload Receipt",
          supportEmail: donation?.team?.email,
          teamName: donation?.team?.name,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
