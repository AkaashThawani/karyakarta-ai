"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Shield, Brain, ArrowRight, UserPlus, Check, TrendingUp, Users, Globe } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuthModal } from "@/hooks/use-auth-modal";
import Link from "next/link";

export default function Home() {
  const { openModal } = useAuthModal();
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Hero Section - Full Viewport Height */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-background dark:to-gray-900" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        <div className="container relative py-12 px-6 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Work Smarter
                  <br />
                  <span className="gradient-text">with AI</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Transform your workflow with intelligent assistance. Get instant insights, automate tasks, and boost productivity.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    Try Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  onClick={() => openModal('signup')}
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto h-14 px-8 text-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </Button>
              </div>
              
            </div>
            
            {/* Right Content - Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 transition-all hover:scale-105">
                <CardContent className="p-0 space-y-2">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div className="text-3xl font-bold">10x</div>
                  <div className="text-sm text-muted-foreground">Faster Results</div>
                </CardContent>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0 space-y-2">
                  <Users className="w-8 h-8 text-cyan-600" />
                  <div className="text-3xl font-bold">50k+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </CardContent>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0 space-y-2">
                  <Globe className="w-8 h-8 text-green-600" />
                  <div className="text-3xl font-bold">120+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </CardContent>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0 space-y-2">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 border-y bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Everything you need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI capabilities designed for modern workflows
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group transition-all duration-300 border-2 hover:border-primary/50 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get instant responses with our optimized AI infrastructure. No waiting, just results.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Thinking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced reasoning with full transparency. See exactly how AI thinks through problems.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bank-level encryption and compliance. Your data is always protected and private.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      {/* <section className="py-20">
        <div className="container max-w-4xl mx-auto px-6">
          <Card className="relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10" />
            <CardContent className="relative p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to boost your productivity?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals already using KaryaKarta AI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/chat">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8">
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section> */}
      
      <Footer />
    </main>
  );
}
