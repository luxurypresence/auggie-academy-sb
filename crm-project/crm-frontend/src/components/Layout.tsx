import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-app">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
