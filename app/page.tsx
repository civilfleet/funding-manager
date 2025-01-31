export default function Page() {
  return (
    <div className="flex flex-col w-1/2 mx-auto text-center">
      Welcome to Funding Management System (FMS) please visit:
      <a href="/login" className="text-blue-500">
        login
      </a>
      <a href="/admin" className="text-blue-500">
        admin
      </a>
      <a href="/organization" className="text-blue-500">
        organization
      </a>
    </div>
  );
}
