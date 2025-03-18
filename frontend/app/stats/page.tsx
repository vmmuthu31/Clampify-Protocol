import { Button } from "@/components/ui/button";
import { ChartBar, TrendingUp, Users, Lock } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { 
            label: "Total Volume", 
            value: "$12.5M", 
            change: "+25%",
            icon: <ChartBar className="w-5 h-5 text-blue-400" />
          },
          { 
            label: "Total Tokens", 
            value: "1,234", 
            change: "+12",
            icon: <TrendingUp className="w-5 h-5 text-green-400" />
          },
          { 
            label: "Total Users", 
            value: "45.2K", 
            change: "+1.2K",
            icon: <Users className="w-5 h-5 text-purple-400" />
          },
          { 
            label: "Total Locked", 
            value: "$5.8M", 
            change: "+$500K",
            icon: <Lock className="w-5 h-5 text-orange-400" />
          }
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              {stat.icon}
              <span className="text-white/70">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-green-400">{stat.change} (24h)</div>
          </div>
        ))}
      </div>

      {/* Top Tokens Table */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Top Tokens</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-white/70">
                <th className="pb-4">Token</th>
                <th className="pb-4">Price</th>
                <th className="pb-4">24h Change</th>
                <th className="pb-4">Volume</th>
                <th className="pb-4">Market Cap</th>
                <th className="pb-4">Locked</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="py-4">$TOKEN{i + 1}</td>
                  <td>${(1.23 * (i + 1)).toFixed(2)}</td>
                  <td className="text-green-400">+{(5.67 * (i + 1)).toFixed(2)}%</td>
                  <td>${(234.56 * (i + 1)).toFixed(2)}K</td>
                  <td>${(1.23 * (i + 1)).toFixed(2)}M</td>
                  <td>{(75 + i * 2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 