import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAdmins } from "./admin/AdminAdmins.tsx";
import { AdminAuthProvider, RequireOwner } from "./admin/AdminAuth.tsx";
import { AdminLogin } from "./admin/AdminLogin.tsx";
import { AdminMenu } from "./admin/AdminMenu.tsx";
import { AdminOrders } from "./admin/AdminOrders.tsx";
import { AdminSettings } from "./admin/AdminSettings.tsx";
import { AdminShell } from "./admin/AdminShell.tsx";
import {
  CartSheet,
  OrderBar,
  Toast,
  WhatsAppFab,
} from "./components/CartSheet.tsx";
import { Header } from "./components/Header.tsx";
import { Hero } from "./components/Hero.tsx";
import { MenuSection } from "./components/MenuSection.tsx";
import { Footer, Reviews, Story, Visit } from "./components/Sections.tsx";
import { Privacy } from "./pages/Privacy.tsx";
import { useStore } from "./store.tsx";

function PublicSite() {
  const { lang } = useStore();

  useEffect(() => {
    document.title = "RKN Punjabi Soya Chaap | Pure Veg, Naini Prayagraj";
    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.setAttribute(
      "href",
      "https://rkn-punjabi-soya-chaap.services.opuskiln.com/",
    );
  }, []);

  useEffect(() => {
    const nodes = [...document.querySelectorAll(".reveal")];
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "80px 0px" },
    );
    for (const node of nodes) {
      const top = node.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.92) node.classList.add("is-in");
      else observer.observe(node);
    }
    return () => observer.disconnect();
  }, [lang]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <MenuSection />
        <Story />
        <Reviews />
        <Visit />
      </main>
      <Footer />
      <CartSheet />
      <OrderBar />
      <WhatsAppFab />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route
        path="/admin/login"
        element={
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminAuthProvider>
            <RequireOwner />
          </AdminAuthProvider>
        }
      >
        <Route element={<AdminShell />}>
          <Route index element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="admins" element={<AdminAdmins />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
