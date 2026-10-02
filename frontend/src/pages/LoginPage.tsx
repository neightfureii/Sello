import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../../public/images/logo.png";
import login_bg from "../../public/images/login_bg.png";
import login_bg_mobile from "../../public/images/login_bg_mobile.png";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { InputField } from "../components/InputField";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/";

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex relative bg-white overflow-hidden">
      <div className="hidden md:block absolute top-10 left-10 z-20">
        <img src={logo} alt="Sello Logo" className="h-8" />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 z-10 relative">
        <div className="md:hidden absolute inset-0 z-0">
          <img
            src={login_bg_mobile}
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <Card className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo (Inside Card) */}
          <div className="md:hidden flex justify-center mb-6">
            <img src={logo} alt="Sello Logo" className="h-10" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-bold text-3xl mb-3 text-gray-900">
              Welcome to <span className="text-sello-blue">Sello</span>
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed px-4">
              Manage POS, inventory, accounting, analytics, and cashiers from
              one integrated platform
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            <InputField
              label="Email Address"
              placeholder="abc@gmail.com"
              type="email"
              icon={<MailIcon />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              label="Password"
              placeholder="••••••••••••"
              type={showPassword ? "text" : "password"}
              icon={<LockIcon />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:text-gray-700"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            <div className="flex items-center justify-between mt-1 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-sello-blue focus:ring-sello-blue"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="text-sm text-sello-blue hover:underline">
                Forgot Password?
              </a>
            </div>

            <Button type="submit">Login</Button>

            {error && (
              <p className="text-center text-sm text-sello-red mt-2">{error}</p>
            )}
          </form>
        </Card>
      </div>
      <div className="hidden md:flex w-1/2 bg-white items-center justify-center p-12">
        <img
          src={login_bg}
          alt="Dashboard Preview"
          className="max-w-full max-h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
}
