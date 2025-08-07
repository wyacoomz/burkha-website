"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Save, X, FolderTree } from "lucide-react"
import { addCategory, deleteCategory, fetchcategory, updateCategory } from "../api"
import LoadingSpinner from "../components/LoadingSpinner"

const CategoryManagement = () => {
  // const [categories, setCategories] = useState([])
const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState(null)
  const [editName, setEditName] = useState("")


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        // This would be replaced with actual API call
        // Simulating API response
        const response = await fetchcategory();
        if (response.data) {
          setCategories(response.data)
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError("Failed to load categories. Please try again.")
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      // This would be replaced with actual API call
      // Simulating API response
      const newId = (categories.length + 1).toString()
      const response = await addCategory(newCategory);
      const newCategoryObj = response.data

      if (response.data){setCategories([...categories, newCategoryObj])}
      setNewCategory("")
    } catch (error) {
      console.error("Error adding category:", error)
      setError("Failed to add category. Please try again.")
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category._id)
    setEditName(category.name)
  }

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return

    try {
      // This would be replaced with actual API call
      const response = await updateCategory(id, editName.trim());
      setCategories(categories.map((cat) => (cat._id === id ? { ...cat, name: editName.trim() } : cat)))
      setEditingCategory(null)
      setEditName("")
    } catch (error) {
      console.error("Error updating category:", error)
      setError("Failed to update category. Please try again.")
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      // This would be replaced with actual API call
      const response = await deleteCategory(id);
      setCategories(categories.filter((cat) => cat._id !== id))
    } catch (error) {
      console.error("Error deleting category:", error)
      setError("Failed to delete category. Please try again.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-primary-600 text-white flex items-center">
        <FolderTree className="mr-2" size={24} />
        <h2 className="text-xl font-bold">Category Management</h2>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border-b border-red-100">{error}</div>}

      <div className="p-6">
        {/* Add New Category */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Add New Category</h3>
          <div className="flex">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div>
          <h3 className="text-lg font-medium mb-3">Categories</h3>

          {loading ? (
            <div className="text-center py-4 text-black"><LoadingSpinner /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No categories found.</div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCategory === category._id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingCategory === category._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleSaveEdit(category._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryManagement
