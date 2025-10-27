import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Shield, Brain, Rocket, Star } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden border-b border-border/50">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-blue-500/5" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <div className="container relative py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Badge with animation */}
          <div className="flex justify-center animate-float">
            <Badge variant="secondary" className="px-4 py-2 text-sm glass border-primary/20">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              <span className="font-medium">Powered by Advanced AI</span>
            </Badge>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text">KaryaKarta AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your intelligent companion for seamless productivity and instant insights
            </p>
          </div>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
            <Card className="group hover:scale-105 transition-all duration-300 glass border-primary/10 hover:border-primary/30">
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Instant responses powered by cutting-edge AI technology for real-time assistance
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:scale-105 transition-all duration-300 glass border-primary/10 hover:border-primary/30">
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">Smart Thinking</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Advanced reasoning with transparent thought process visualization
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:scale-105 transition-all duration-300 glass border-primary/10 hover:border-primary/30">
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your conversations are encrypted and stored with enterprise-grade security
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Stats or Quick Features */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Fast Performance</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
