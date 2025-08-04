"use client";
import axios from "axios";
import { Calendar, Eye, MousePointer, Star, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AnalyticsPage() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState("daily");
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);

  // STEP 1: Get the logged-in admin info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get("/api/admin/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      const id = res.data.user._id;
      setRestaurantId(id);
    })
    .catch((err) => {
      console.error("Error loading admin info:", err);
      setLoading(false);
    });
  }, []);

  // STEP 2: Fetch menu items to get names instead of IDs
  useEffect(() => {
    if (!restaurantId) return;

    const token = localStorage.getItem("token");
    axios.get(`/api/menu/by-restaurant/${restaurantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      const itemsMap = {};
      if (res.data.items) {
        res.data.items.forEach(item => {
          itemsMap[item._id] = item.name;
        });
      }
      setMenuItems(itemsMap);
    })
    .catch((err) => {
      console.error("Error fetching menu items:", err);
    });
  }, [restaurantId]);

  // STEP 3: Fetch analytics for this restaurant
  useEffect(() => {
    if (!restaurantId) return;

    setLoading(true);
    axios.get(`/api/analytics?restaurantId=${restaurantId}&range=${range}`)
      .then((res) => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      });
  }, [restaurantId, range]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  const menuViews = analytics.data.find(d => d._id === "menu_viewed")?.count || 0;
  const itemClicks = analytics.data.find(d => d._id === "item_clicked")?.count || 0;
  const engagementRate = menuViews > 0 ? ((itemClicks / menuViews) * 100).toFixed(1) : 0;

  // Prepare data for charts
  const topItemsData = analytics.itemClicks.slice(0, 8).map(item => ({
    name: item.name || `Item ${item._id.slice(-4)}`,
    clicks: item.count,
    id: item._id
  }));

  const pieData = [
    { name: 'Menu Views', value: menuViews, color: '#3B82F6' },
    { name: 'Item Clicks', value: itemClicks, color: '#10B981' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-gray-600">Track your restaurants performance and customer engagement</p>
            </div>
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menu Views</p>
                <p className="text-2xl font-bold text-gray-900">{menuViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MousePointer className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Item Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{itemClicks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{engagementRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Items</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.itemClicks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Overview Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Items</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItemsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), 'Clicks']}
                  labelStyle={{ color: '#333' }}
                />
                <Bar dataKey="clicks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Clicked Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.itemClicks.map((item, index) => {
                  const percentage = itemClicks > 0 ? ((item.count / itemClicks) * 100).toFixed(1) : 0;
                  const itemName = item.name || `Item ${item._id.slice(-4)}`;
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{itemName}</div>
                        <div className="text-sm text-gray-500">Price: {item.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{item.count.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full bg-blue-600" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}