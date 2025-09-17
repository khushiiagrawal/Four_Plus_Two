import ConditionalNavbar from "@/components/ui/ConditionalNavbar";

export default function AuthoritiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConditionalNavbar />
      {children}
    </>
  );
}
