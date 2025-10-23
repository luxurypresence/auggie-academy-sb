import { Shapes, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Contacts", path: "/contacts" },
  { name: "Leads", path: "/" },
  { name: "Opportunities", path: "/opportunities" },
  { name: "Reports", path: "/reports" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/leads");
    }
    return location.pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase() || "U";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Shapes className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold">SalesTracker</span>
            </div>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Side - User Info and Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.firstName}</span>
              </span>
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 flex items-center justify-center text-white font-medium">
              {getUserInitials()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
