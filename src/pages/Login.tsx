import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, LogIn, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase, checkSupabaseConfig } from "@/lib/supabase";
import { motion } from "motion/react";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  React.useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/admin");
        }
      });
    } catch (e) {
      console.error("Supabase session check failed:", e);
    }
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      checkSupabaseConfig();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user role via RPC (Security Definer function) to verify admin access
      // This bypasses RLS issues while remaining secure
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
        
      if (rpcError) {
        console.error("Role check error:", rpcError.message);
        await supabase.auth.signOut();
        toast.error("Account validation failed.", {
          description: "We couldn't verify your administrative permissions. Please contact technical support.",
        });
        setIsLoading(false);
        return;
      }

      if (!isAdmin) {
        console.warn("Access denied. User is not an admin.");
        await supabase.auth.signOut();
        toast.error("Access denied. Admin credentials required.", {
          description: "Please use an authorized administrator account.",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back, Admin", {
        icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
      });
      navigate("/admin");
    } catch (error: any) {
      let message = error.message || "Authentication failed";
      if (error.message === "Failed to fetch") {
        message = "Connection error. Please check your Supabase configuration.";
      } else if (error.message === "Invalid login credentials") {
        message = "Invalid email or password.";
      } else if (error.message === "Email not confirmed") {
        message = "Email not confirmed. Please check your inbox for a verification link or contact support.";
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] as any
      } 
    }
  };

  return (
    <div className="dark min-h-screen w-full flex flex-col md:flex-row bg-[#09090b] selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar Section */}
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 text-white border-r border-white/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-emerald-950/40 z-0" />
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[100px] rounded-full" />
        
        {/* Logo/Brand */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="h-10 w-10 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          </div>
          <span className="font-bold tracking-tighter text-xl text-zinc-100">YUVA <span className="text-emerald-500">ADMIN</span></span>
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 cursor-default hover:to-white transition-all duration-500">Academic Control</span>
            </h1>
            <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-sm">
              The ultimate command center for Yuva Classes. Manage students, courses, and analytics with precision.
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-6 text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase">
          <span>Enterprise Grade</span>
          <div className="h-px w-8 bg-zinc-800" />
          <span>v2.4.0 (Stable)</span>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative bg-[#09090b]">
        {/* Background micro-dots */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[440px] relative z-10"
        >
          {/* Form Card */}
          <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
            {/* Hover glow effect */}
            <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-zinc-500 font-light">
                  Access the administrative dashboard.
                </p>
              </motion.div>

              <form onSubmit={handleAuth} className="space-y-5">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold text-zinc-500 ml-1">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@yuvaclasses.com"
                    className="h-12 bg-zinc-950/50 border-zinc-800 rounded-xl focus-visible:bg-zinc-950/70 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/10 transition-all text-zinc-100 placeholder:text-zinc-500 focus-visible:text-zinc-100 focus-visible:placeholder:text-zinc-400 selection:bg-emerald-500/30 selection:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-xs uppercase tracking-widest font-semibold text-zinc-500">
                      Password
                    </Label>
                  </div>
                  <div className="relative group/pass">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      className="h-12 bg-zinc-950/50 border-zinc-800 rounded-xl focus-visible:bg-zinc-950/70 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/10 transition-all text-zinc-100 placeholder:text-zinc-500 focus-visible:text-zinc-100 focus-visible:placeholder:text-zinc-400 selection:bg-emerald-500/30 selection:text-white pr-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-base transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group/btn" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Continue to Dashboard 
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-zinc-600 flex items-center justify-center gap-2 mx-auto italic">
                  Protected Administrative Interface
                </p>
              </motion.div>
            </motion.div>
          </div>
          
          <motion.p 
            variants={itemVariants}
            className="mt-10 text-center text-xs text-zinc-600 tracking-widest uppercase font-mono"
          >
            Secured by Yuva Systems • Tier 4 Compliance
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
