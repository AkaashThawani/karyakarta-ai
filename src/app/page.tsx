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
            
            {/* Right Content - Feature Preview */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Everything you need</h3>
                <p className="text-muted-foreground">
                  Powerful AI capabilities designed for modern workflows
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="p-5 hover:shadow-lg transition-all">
                  <CardContent className="p-0 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Browser Automation</h4>
                      <p className="text-sm text-muted-foreground">
                        Navigate websites, fill forms, and automate tasks with intelligent multi-step execution
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="p-5 hover:shadow-lg transition-all">
                  <CardContent className="p-0 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Self-Learning AI</h4>
                      <p className="text-sm text-muted-foreground">
                        Adaptive system that learns from every interaction and improves over time
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="p-5 hover:shadow-lg transition-all">
                  <CardContent className="p-0 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Smart Routing</h4>
                      <p className="text-sm text-muted-foreground">
                        Multi-agent system with semantic hints and adaptive retry for reliable automation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
