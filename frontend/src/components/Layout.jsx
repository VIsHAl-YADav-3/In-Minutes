import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import MobileNav from "./MobileNav.jsx";
import VishalChatbot from "./VishalChatbot.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Layout = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 pb-24 pt-4 md:pb-10">
        <Outlet />
      </main>
      <MobileNav />
      {user && <VishalChatbot open={chatOpen} onClose={() => setChatOpen(false)} />}
    </div>
  );
};

export default Layout;
