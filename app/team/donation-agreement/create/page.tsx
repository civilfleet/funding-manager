import DonationAgreement from "@/components/forms/donation-agreement";

export default function Page() {
  return (
    <div className="flex flex-col p-4">
      <DonationAgreement
        data={{
          email: "",
          name: "",
        }}
      />
    </div>
  );
}
