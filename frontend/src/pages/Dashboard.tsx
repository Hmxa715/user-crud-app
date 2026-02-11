/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getUsers, getUserGrowth } from "../api";

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    getUsers().then(res => setTotalUsers(res.data.length));
    getUserGrowth().then(res => setGrowthData(res.data));
  }, []);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of users and activity
          </p>
        </div>
        <div className="text-sm text-gray-400">Live data</div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl shadow p-6">
          <p className="text-sm opacity-80">Total Users</p>
          <h2 className="text-5xl font-bold mt-3">{totalUsers}</h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Active Users</p>
          <h2 className="text-4xl font-semibold mt-3">
            {Math.floor(totalUsers * 0.8)}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">New This Week</p>
          <h2 className="text-4xl font-semibold mt-3">
            {
              growthData.filter(d => {
                const date = new Date(d.date);
                const now = new Date();
                return (
                  now.getTime() - date.getTime() <
                  7 * 24 * 60 * 60 * 1000
                );
              }).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">System Status</p>
          <h2 className="text-xl font-semibold mt-4 text-green-600">
            All Systems Normal
          </h2>
        </div>
      </div>

      {/* Graph + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium">User Growth</p>
            <span className="text-sm text-gray-400">By date</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count"  fill="#2b7fff" radius={[6, 6, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-medium mb-4">Recent Users</p>

          <ul className="space-y-3 text-sm">
            {growthData.slice(-3).reverse().map((item, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-gray-600">
                  {item.count} users added
                </span>
                <span className="text-gray-400">{item.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
