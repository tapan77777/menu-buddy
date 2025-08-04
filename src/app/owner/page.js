"use client";
import {
  Edit3,
  Eye,
  MapPin,
  Plus,
  Save,
  Search,
  Store,
  Trash2,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

const OwnerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    logoUrl: '',
    address: '',
    email: '',
    slug: ''
  });

  

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurant');
      const data = await response.json();
      setRestaurants(data.map(restaurant => ({
        id: restaurant._id,
        name: restaurant.name,
        logo: restaurant.logoUrl || '🍽️',
        address: restaurant.address,
        email: restaurant.email,
        slug: restaurant.slug,
        visits: restaurant.visits || 0,
        dateAdded: restaurant.createdAt
      })));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVisits = restaurants.reduce((sum, restaurant) => sum + restaurant.visits, 0);
  const averageVisits = Math.round(totalVisits / restaurants.length) || 0;

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (restaurant) => {
    setEditingId(restaurant.id);
    setEditForm({
      name: restaurant.name,
      logoUrl: restaurant.logo,
      address: restaurant.address
    });
  };

  const saveEdit = async () => {
    try {
      await fetch(`/api/restaurant/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      fetchRestaurants();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const deleteRestaurant = async (id) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await fetch(`/api/restaurant/${id}`, { method: 'DELETE' });
        fetchRestaurants();
      } catch (error) {
        console.error('Error deleting restaurant:', error);
      }
    }
  };

  const addRestaurant = async () => {
    if (!newRestaurant.name || !newRestaurant.address || !newRestaurant.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await fetch('/api/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRestaurant)
      });
      fetchRestaurants();
      setNewRestaurant({ name: '', logoUrl: '', address: '', email: '', slug: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">MenuBuddy Owner Dashboard</h1>
              <p className="text-gray-600">Manage your restaurant network and track performance</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{restaurants.length}</div>
              <div className="text-sm text-gray-500">Total Restaurants</div>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{restaurants.length}</h3>
                <p className="text-gray-600 text-sm">Total Restaurants</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{totalVisits.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm">Total Visits</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{averageVisits}</h3>
                <p className="text-gray-600 text-sm">Avg Visits/Restaurant</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {restaurants.length > 0 ? Math.max(...restaurants.map(r => r.visits)) : 0}
                </h3>
                <p className="text-gray-600 text-sm">Top Restaurant Visits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Restaurant
              </button>
            </div>
          </div>
        </div>

        {/* Add Restaurant Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Restaurant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
                  <input
                    type="text"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newRestaurant.email}
                    onChange={(e) => setNewRestaurant({...newRestaurant, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="restaurant@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={newRestaurant.slug}
                    onChange={(e) => setNewRestaurant({...newRestaurant, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="restaurant-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={newRestaurant.logoUrl}
                    onChange={(e) => setNewRestaurant({...newRestaurant, logoUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://logo-url.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={newRestaurant.address}
                    onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full address"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addRestaurant}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Add Restaurant
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewRestaurant({ name: '', logoUrl: '', address: '', email: '', slug: '' });
                  }}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Restaurant Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Restaurant</th>
                    <th className="text-left py-3 px-4">Address</th>
                    <th className="text-left py-3 px-4">Visits</th>
                    <th className="text-left py-3 px-4">Date Added</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        {editingId === restaurant.id ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={editForm.logoUrl}
                              onChange={(e) => setEditForm({...editForm, logoUrl: e.target.value})}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                              placeholder="Logo URL"
                            />
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {restaurant.logo.startsWith('http') ? 
                                <img src={restaurant.logo} alt="Logo" className="w-8 h-8 rounded" /> :
                                <span className="text-lg">{restaurant.logo}</span>
                              }
                            </div>
                            <div>
                              <div className="font-semibold">{restaurant.name}</div>
                              <div className="text-xs text-gray-500">{restaurant.email}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === restaurant.id ? (
                          <input
                            type="text"
                            value={editForm.address}
                            onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {restaurant.address}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{restaurant.visits}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(restaurant.dateAdded).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === restaurant.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(restaurant)}
                              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteRestaurant(restaurant.id)}
                              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRestaurants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No restaurants found matching your search.' : 'No restaurants added yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
            <div className="space-y-4">
              {restaurants
                .sort((a, b) => b.visits - a.visits)
                .slice(0, 5)
                .map((restaurant, index) => (
                <div key={restaurant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {restaurant.logo.startsWith('http') ? 
                        <img src={restaurant.logo} alt="Logo" className="w-8 h-8 rounded" /> :
                        <span className="text-lg">{restaurant.logo}</span>
                      }
                    </div>
                    <div>
                      <div className="font-semibold">{restaurant.name}</div>
                      <div className="text-sm text-gray-600">{restaurant.address}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{restaurant.visits}</div>
                    <div className="text-sm text-gray-600">visits</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;