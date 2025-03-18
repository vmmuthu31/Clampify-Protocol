import { ChartBar, TrendingUp, Users, Lock } from "lucide-react";

export default function StatsPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0A041A]">
      <div className="container mx-auto px-4 pt-20">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { 
              label: "Total Volume", 
              value: "$12.5M", 
              change: "+25%",
              icon: <ChartBar className="w-5 h-5 text-[#618AFF]" />
            },
            { 
              label: "Total Tokens", 
              value: "1,234", 
              change: "+12",
              icon: <TrendingUp className="w-5 h-5 text-[#00FFA3]" />
            },
            { 
              label: "Total Users", 
              value: "45.2K", 
              change: "+1.2K",
              icon: <Users className="w-5 h-5 text-[#FF3B69]" />
            },
            { 
              label: "Total Locked", 
              value: "$5.8M", 
              change: "+$500K",
              icon: <Lock className="w-5 h-5 text-[#FF3E9C]" />
            }
          ].map((stat, i) => (
            <div key={i} className="rounded-[24px] bg-gradient-to-b from-[#FF3B691A] to-[#FF3B6900] p-[1px]">
              <div className="rounded-[24px] bg-[#130B1D] p-6">
                <div className="flex items-center gap-3 mb-4">
                  {stat.icon}
                  <span className="text-white/60">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-[#00FFA3]">{stat.change} (24h)</div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Tokens Table */}
        <div className="rounded-[24px] bg-gradient-to-b from-[#FF3B691A] to-[#FF3B6900] p-[1px]">
          <div className="rounded-[24px] bg-[#130B1D] p-8">
            <h2 className="text-[#FF3B69] text-2xl font-bold mb-6">Top Tokens</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/60">
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
                    <tr key={i} className="border-t border-[#ffffff1a]">
                      <td className="py-4">$TOKEN{i + 1}</td>
                      <td>${(1.23 * (i + 1)).toFixed(2)}</td>
                      <td className="text-[#00FFA3]">+{(5.67 * (i + 1)).toFixed(2)}%</td>
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
      </div>
    </main>
  );
} 