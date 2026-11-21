import { useEffect } from "react";
import { CartSheet, OrderBar, Toast, WhatsAppFab } from "./components/CartSheet.tsx";
import { Header } from "./components/Header.tsx";
import { Hero } from "./components/Hero.tsx";
import { MenuSection } from "./components/MenuSection.tsx";
import { Footer, Reviews, Story, Visit } from "./components/Sections.tsx";
import { useStore } from "./store.tsx";

function Shell() {
  const { lang } = useStore();

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      { threshold: 0.14 },
    );
    nodes.forEach((node) => observer.observe(node));
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
  return <Shell />;
}
