import { sendEmail } from "@/lib/nodemailer";

export default async function Page() {
  await sendEmail(
    {
      to: "ahsanjsdev@gmail.com",
      subject: "Hello",
      template: "welcome",
    },
    {
      name: "Ahsan",
      email: "ahsanjsdev@gmail.com",
    }
  );
  return <div className="flex flex-col w-1/2">reports page</div>;
}
