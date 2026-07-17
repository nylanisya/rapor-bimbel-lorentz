import { useState } from "react";
import { checkIsAuthenticated, setAuthenticated } from "./storage";
import LoginPage from "./components/LoginPage";
import RaporBimbelLorentz from "./components/RaporBimbelLorentz";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkIsAuthenticated);

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setAuthenticated(true);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <RaporBimbelLorentz
      onLogout={() => {
        setAuthenticated(false);
        setIsAuthenticated(false);
      }}
    />
  );
}
