import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  customerLogout,
  fetchCustomerMe,
  type CustomerAccount,
} from "../lib/api.ts";

type CustomerAuthValue = {
  customer: CustomerAccount | null;
  loading: boolean;
  setCustomer: (customer: CustomerAccount | null) => void;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchCustomerMe()
      .then((result) => {
        if (alive) setCustomer(result.customer);
      })
      .catch(() => {
        if (alive) setCustomer(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<CustomerAuthValue>(
    () => ({
      customer,
      loading,
      setCustomer,
      async logout() {
        await customerLogout();
        setCustomer(null);
      },
    }),
    [customer, loading],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useCustomerAuth(): CustomerAuthValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}

export function RequireCustomer() {
  const { customer, loading } = useCustomerAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-sm font-semibold text-[#4e4036]">
        Checking session…
      </div>
    );
  }
  if (!customer) return <Navigate to="/account/login" replace />;
  return <Outlet />;
}
