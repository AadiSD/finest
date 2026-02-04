import { SiteHeader } from "@/components/site-header";
import { Chatbot } from "@/components/chatbot";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      {children}
      <Chatbot />
    </div>
  );
}
