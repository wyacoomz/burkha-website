"use client";

import { useEffect, useState } from "react";
import { deleteProduct, fetchProducts } from "../api";
import {
  Package,
  Search,
  RefreshCw,
  Trash2,
  ShoppingCart,
  Tag,
  Info,
  Edit,
  Printer,
  X,
  Home,
  Upload,
} from "lucide-react";
import { useCart } from "../CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    mrp: "",
    description: "",
    color: "",
    fabric: "",
    size: [],
    category: "",
    subCategory: "",
    stock: "",
    homeVisibility: false,
  });
  const [printQuantity, setPrintQuantity] = useState(1);
  const [stickersPerPage, setStickersPerPage] = useState(4);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [productToPrint, setProductToPrint] = useState(null);

  const navigate = useNavigate();
  const [newImages, setNewImages] = useState([]);

  const Quantity = () => {
    navigate("/purchaseproduct");
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteP = async (id) => {
    const res = await deleteProduct(id);
    if (res.data) {
      setProducts(res.data.data);
    }
  };

  /*   updateProduct  ------------------------------------ */
  const updateProduct = async (id, payload, images, keptOldImages) => {
    try {
      const formData = new FormData();

      // send scalar fields
      Object.entries(payload).forEach(([k, v]) => {
        if (k === "size") {
          formData.append(k, JSON.stringify(v));
        } else if (k !== "images") {
          formData.append(k, v);
        }
      });

      // remaining old images (urls) are sent as a JSON string
      if (keptOldImages.length) {
        formData.append("existingImages", JSON.stringify(keptOldImages));
      }

      // new files
      images.forEach((f) => formData.append("images", f));

      setIsSaving(true);

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/product/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data ?? null;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      const payload = {
        name: editFormData.name,
        price: Number(editFormData.price),
        mrp: Number(editFormData.mrp),
        description: editFormData.description,
        color: editFormData.color,
        fabric: editFormData.fabric,
        size: editFormData.size,
        stock: Number(editFormData.stock),
        homeVisibility: editFormData.homeVisibility,
        category: editFormData.category._id, // ✅ ID bhejo
        subCategory: editFormData.subCategory._id, // ✅ ID bhejo
      };

      const oldKept = editFormData.existingImages;

      const updated = await updateProduct(
        editingProduct._id,
        payload,
        newImages,
        oldKept
      );

      if (updated) {
        if (updated) {
          setEditingProduct(null);
          setNewImages([]);
          setEditFormData({
            name: "",
            price: "",
            mrp: "",
            description: "",
            color: "",
            fabric: "",
            size: [],
            category: "",
            subCategory: "",
            stock: "",
            homeVisibility: false,
            existingImages: [],
          });

          setProducts((prev) =>
            prev.map((p) => (p._id === updated._id ? updated : p))
          );
          setEditingProduct(null); // ✅ Ab tumhara edit form fresh populated hoga!
          toast.success("Product edited successfully!");
          navigate("/");
        } else {
          toast.warn("Error updating product");
        }
      } else {
        toast.warn("Error updating product");
      }
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false); // Set loading state to false when done
    }
  };
  const handlePrintProduct = (product) => {
    setProductToPrint(product);
    setShowPrintDialog(true);
  };

  const toggleHomeVisibility = async (productId) => {
    try {
      // Use latest product from the current state
      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((product) => {
          if (product._id === productId) {
            const newVisibility = !product.homeVisibility;

            // Call API with new visibility
            axios
              .put(
                `${
                  import.meta.env.VITE_API_URL
                }/product/${productId}/home-visibility`,
                { homeVisibility: newVisibility }
              )
              .then((response) => {
                if (response.data.success) {
                  toast.success(
                    `Product ${
                      newVisibility ? "added to" : "removed from"
                    } home page`
                  );
                } else {
                  toast.error("Server did not confirm the update");
                }
              })
              .catch((error) => {
                console.error("Error updating visibility:", error);
                toast.error("Failed to update visibility");
              });

            // Immediately update local state
            return { ...product, homeVisibility: newVisibility };
          }

          return product;
        });

        return updatedProducts;
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong");
    }
  };

  const confirmPrint = () => {
    if (!productToPrint || printQuantity < 1) return;

    const printDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const stickersPerPageCount = Math.min(Math.max(1, stickersPerPage), 8);
    const totalPages = Math.ceil(printQuantity / stickersPerPageCount);

    let printableContent = "";

    for (let page = 0; page < totalPages; page++) {
      printableContent += `
        <div style="
          display: grid;
          grid-template-columns: repeat(${Math.min(
            stickersPerPageCount,
            2
          )}, 1fr);
          gap: 10px;
          padding: 10px;
          ${page < totalPages - 1 ? "page-break-after: always;" : ""}
        ">
      `;

      const stickersOnThisPage = Math.min(
        stickersPerPageCount,
        printQuantity - page * stickersPerPageCount
      );

      for (let i = 0; i < stickersOnThisPage; i++) {
        printableContent += `
          <div style="
            width: 100%;
            height: 100%;
            padding: 10px;
            border: 2px solid #000;
            font-family: Arial, sans-serif;
            background: white;
            box-sizing: border-box;
          ">
            <div style="text-align: center; margin-bottom: 8px;">
              <div style="font-weight: bold; font-size: 18px; display: flex; justify-content: space-between;">
                <span>MRP</span>
                <span style="font-size: 20px;">₹${Number(
                  productToPrint.price
                ).toFixed(2)}</span>
              </div>
              ${
                productToPrint.mrp && productToPrint.mrp > productToPrint.price
                  ? `
                <div style="font-size: 12px; text-decoration: line-through; color: #666;">
                  MRP: ₹${Number(productToPrint.mrp).toFixed(2)}
                </div>
              `
                  : ""
              }
              <div style="font-size: 10px; margin-top: 3px;">
                Inclusive of All Taxes
              </div>
            </div>

            <hr style="border: 1px solid #000; margin: 5px 0;" />

            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                <span>Item No: <strong>${productToPrint._id
                  .slice(-6)
                  .toUpperCase()}</strong></span>
                <span>Type: <strong>${
                  productToPrint.category?.name || "N/A"
                }</strong></span>
              </div>
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 3px; text-align: center;">
                ${productToPrint.name}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>Size: <strong>${
                  productToPrint.size?.join(", ") || "N/A"
                }</strong></span>
                <span>Color: <strong>${
                  productToPrint.color || "N/A"
                }</strong></span>
              </div>
              ${
                productToPrint.fabric
                  ? `
                <div style="font-size: 12px; margin-top: 3px;">
                  Fabric: <strong>${productToPrint.fabric}</strong>
                </div>
              `
                  : ""
              }
            </div>

            <div style="text-align: center; margin: 5px 0;">
              ${
                productToPrint.barcode
                  ? `
                <img
                  src="${productToPrint.barcode}"
                  alt="Barcode"
                  style="width: 100%; height: 40px; object-fit: contain;"
                />
              `
                  : `
                <div style="height: 40px; display: flex; align-items: center; justify-content: center; color: #666;">
                  [Barcode Not Available]
                </div>
              `
              }
              <div style="letter-spacing: 2px; text-align: center; font-family: monospace; margin-top: 3px; font-size: 10px;">
                ${productToPrint._id.slice(-6).toUpperCase()}
              </div>
            </div>

            <div style="text-align: center; margin-top: 5px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 3px;">
                BURKA COLLECTION
              </div>
              <div style="font-size: 10px; line-height: 1.2;">
                Printed on: ${printDate}<br/>
                Customer Care: +91 1234567890<br/>
                Address- Ghetal gali Sironj disit vidhisha
              </div>
            </div>
          </div>
        `;
      }

      printableContent += `</div>`;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${productToPrint.name} - Price Tags (${printQuantity} copies)</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printableContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    setShowPrintDialog(false);
    setProductToPrint(null);
    setPrintQuantity(1);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEditModalClose = () => {
    setEditingProduct(null);
    setNewImages([]);
    setEditFormData({
      name: "",
      price: "",
      mrp: "",
      description: "",
      color: "",
      fabric: "",
      size: [],
      category: "",
      subCategory: "",
      stock: "",
      homeVisibility: false,
      images: [],
      existingImages: [],
    });
  };

  useEffect(() => {
    if (!editingProduct) return;
    setEditFormData({
      name: editingProduct.name || "",
      price: editingProduct.price ?? "",
      mrp: editingProduct.mrp ?? "",
      description: editingProduct.description || "",
      color: editingProduct.color || "",
      fabric: editingProduct.fabric || "",
      size: Array.isArray(editingProduct.size) ? editingProduct.size : [],
      // category: editingProduct.category?.name || "",
      // subCategory: editingProduct.subCategory?.name || "",
      category: {
        _id: editingProduct.category?._id || "",
        name: editingProduct.category?.name || "",
      },
      subCategory: {
        _id: editingProduct.subCategory?._id || "",
        name: editingProduct.subCategory?.name || "",
      },
      stock: editingProduct.stock ?? 0,
      homeVisibility: Boolean(editingProduct.homeVisibility),
      images: Array.isArray(editingProduct.images)
        ? [...editingProduct.images]
        : [],
      existingImages: Array.isArray(editingProduct.images)
        ? [...editingProduct.images]
        : [],
    });
    setNewImages([]);
  }, [editingProduct]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = async (productId, quantity = 1) => {
    const product = products.find((p) => p._id === productId);
    if (!product || product.stock <= 0) {
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/cart/add/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      await fetchCart();
      toast.success("Product added to cart");
    } catch (err) {
      console.error("Failed to add product to cart:", err);
      setError("Failed to add product to cart.");
      toast.error("Failed to add product to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCartClick = (product) => {
    if (product.stock <= 0) return;
    addToCart(product._id, 1);
  };

  const handleRemoveImage = async (imageUrl) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/product/remove-image/${
          editingProduct._id
        }`,
        { imageUrl }
      );

      if (res.status === 200) {
        toast.success("Image removed successfully");

        // ✅ Correct: BOTH arrays updated
        setEditingProduct((prev) => ({
          ...prev,
          images: (prev?.images || []).filter((img) => img !== imageUrl),
          existingImages: (prev?.existingImages || []).filter(
            (img) => img !== imageUrl
          ),
        }));

        setEditFormData((prev) => ({
          ...prev,
          images: (prev?.images || []).filter((img) => img !== imageUrl),
          existingImages: (prev?.existingImages || []).filter(
            (img) => img !== imageUrl
          ),
        }));
      } else {
        toast.error("Could not remove image");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className='bg-white shadow rounded-lg py-8'>
      {showPrintDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full'>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-xl font-bold'>Print Price Tags</h2>
              <button
                onClick={() => setShowPrintDialog(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <X size={24} />
              </button>
            </div>

            <div className='mb-4'>
              <p className='text-gray-700 mb-2'>Enter quantity to print for:</p>
              <p className='font-medium text-lg'>{productToPrint?.name}</p>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Number of Copies
              </label>
              <input
                type='number'
                min='1'
                value={printQuantity}
                onChange={(e) =>
                  setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md mb-4'
              />
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Stickers Per Page
              </label>
              <select
                value={stickersPerPage}
                onChange={(e) => setStickersPerPage(parseInt(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value='1'>1 per page</option>
                <option value='2'>2 per page</option>
                <option value='4'>4 per page</option>
                <option value='6'>6 per page</option>
                <option value='8'>8 per page</option>
              </select>
            </div>

            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowPrintDialog(false)}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md'
              >
                Cancel
              </button>
              <button
                onClick={confirmPrint}
                className='bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center'
              >
                <Printer size={18} className='mr-2' />
                Print {printQuantity} {printQuantity === 1 ? "Copy" : "Copies"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
        <h2 className='text-xl font-bold text-gray-800 flex items-center'>
          <Package className='mr-2' size={24} />
          Product List
        </h2>
        <button
          onClick={loadProducts}
          className='p-2 text-gray-500 hover:text-primary-600 focus:outline-none'
          title='Refresh products'
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className='p-4 border-b border-gray-200'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search size={18} className='text-gray-400' />
          </div>
          <input
            type='text'
            placeholder='Search products...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          />
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center p-8'>
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className='p-8 text-center text-red-600'>{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className='p-8 text-center text-gray-500'>
          {searchTerm
            ? "No products match your search."
            : "No products available."}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className='border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow'
            >
              <div className='relative'>
                <div className='h-48 bg-gray-100 flex items-center justify-center overflow-hidden'>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className='h-[100%]'
                    />
                  ) : (
                    <div className='text-gray-400 flex flex-col items-center'>
                      <Package size={48} />
                      <span className='text-sm mt-2'>No image</span>
                    </div>
                  )}
                </div>

                {product.mrp &&
                  product.price &&
                  product.mrp > product.price && (
                    <div className='absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
                      {Math.round(
                        ((product.mrp - product.price) / product.mrp) * 100
                      )}
                      % OFF
                    </div>
                  )}
              </div>

              <div className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <div className='flex space-x-1'>
                    <button
                      className={`p-1.5 rounded-full ${
                        product.stock <= 0
                          ? "bg-gray-200 cursor-not-allowed"
                          : addingToCart[product._id]
                          ? "bg-gray-200"
                          : "bg-primary-50 hover:bg-primary-100"
                      }`}
                      onClick={() => handleAddToCartClick(product)}
                      disabled={product.stock <= 0 || addingToCart[product._id]}
                      title={
                        product.stock <= 0 ? "Out of Stock" : "Add to cart"
                      }
                    >
                      {addingToCart[product._id] ? (
                        <RefreshCw
                          size={16}
                          className='text-primary-600 animate-spin'
                        />
                      ) : (
                        <ShoppingCart
                          size={16}
                          className={
                            product.stock <= 0
                              ? "text-gray-400"
                              : "text-primary-600"
                          }
                        />
                      )}
                    </button>
                    <button
                      className='p-1.5 rounded-full bg-green-50 hover:bg-green-100'
                      onClick={() => handlePrintProduct(product)}
                      title='Print product details'
                    >
                      <Printer size={16} className='text-green-600' />
                    </button>

                    <button
                      onClick={() => {
                        setEditingProduct(product); // as trigger
                        setEditFormData({
                          name: product.name || "",
                          price: product.price ?? "",
                          mrp: product.mrp ?? "",
                          description: product.description || "",
                          color: product.color || "",
                          fabric: product.fabric || "",
                          size: Array.isArray(product.size) ? product.size : [],
                          category: product.category?._id || "",
                          subCategory: product.subCategory?._id || "",
                          stock: product.stock ?? 0,
                          homeVisibility: Boolean(product.homeVisibility),
                          images: Array.isArray(product.images)
                            ? [...product.images]
                            : [],
                          existingImages: Array.isArray(product.images)
                            ? [...product.images]
                            : [],
                        });
                        setNewImages([]);
                      }}
                      className='p-1.5 rounded-full bg-yellow-50'
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className='p-1.5 rounded-full bg-red-50 hover:bg-red-100'
                      onClick={() => deleteP(product._id)}
                      title='Delete product'
                    >
                      <Trash2 size={16} className='text-red-600' />
                    </button>
                    <button
                      className='p-1.5 rounded-full bg-blue-50 hover:bg-blue-100'
                      onClick={() => setSelectedProduct(product)}
                      title='View details'
                    >
                      <Info size={16} className='text-blue-600' />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      toggleHomeVisibility(product._id, product.homeVisibility)
                    }
                    className={`p-1.5 rounded-full ${
                      product.homeVisibility
                        ? "bg-purple-100 hover:bg-purple-200 text-purple-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                    title={
                      product.homeVisibility === "true"
                        ? "Visible on home"
                        : "Hidden from home"
                    }
                  >
                    <Home size={16} />
                  </button>
                </div>
                <h3 className='text-lg font-medium text-gray-900'>
                  {product.name}
                </h3>
                <div className='flex items-baseline mb-2'>
                  <span className='text-primary-600 font-bold text-lg'>
                    ₹{Number.parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className='ml-2 text-gray-500 text-sm line-through'>
                      ₹{Number.parseFloat(product.mrp).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className='mb-2'>
                  {product.stock > 0 ? (
                    <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse'>
                      <span className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping'></span>
                      {product.stock} in Stock
                    </span>
                  ) : (
                    <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'>
                      Sold Out
                    </span>
                  )}
                </div>

                <div className='flex flex-wrap gap-1 mb-2'>
                  {product.category && (
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 text-black'>
                      <Tag size={12} className='mr-1' />
                      {product.category.name}
                    </span>
                  )}

                  {product.size && product.size.length > 0 && (
                    <div className='flex gap-1 ml-auto'>
                      {product.size.map((size) => (
                        <span
                          key={size}
                          className='inline-block px-1.5 py-0.5 text-xs border border-gray-300 rounded text-black'
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {(product.color || product.fabric) && (
                  <div className='text-sm text-gray-600 mb-2'>
                    {product.color && <span>{product.color}</span>}
                    {product.color && product.fabric && <span> • </span>}
                    {product.fabric && <span>{product.fabric}</span>}
                  </div>
                )}

                {/* {product.description && (
                  <p className='text-sm text-gray-500 line-clamp-2'>
                    {product.description}
                  </p>
                )} */}

                {product.description && (
                  <p className='text-sm  font-semibold line-clamp-2'>
                    {product.description
                      .replace(/<[^>]+>/g, "")
                      .replace(/&nbsp;/g, " ")
                      .replace(/&amp;/g, "&")
                      .replace(/&lt;/g, "<")
                      .replace(/&gt;/g, ">")
                      .replace(/&#39;/g, "'")
                      .replace(/&quot;/g, '"')
                      .trim()}
                  </p>
                )}
              </div>

              {product.barcode && (
                <div className='bg-gray-50 p-2 flex justify-center border-t border-gray-200'>
                  <img
                    src={product.barcode || "/placeholder.svg"}
                    alt={`QR Code for ${product.name}`}
                    className='h-24 w-96 object-contain scale-2'
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-start mb-4'>
                <h2 className='text-2xl font-bold'>{selectedProduct.name}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X size={24} />
                </button>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className='grid grid-cols-4 gap-2 mb-6'>
                  <div className='col-span-4 h-64 bg-gray-100 rounded-lg overflow-hidden'>
                    <img
                      src={selectedProduct.images[0] || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      className='w-full h-full object-contain'
                    />
                  </div>
                  {selectedProduct.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className='h-16 bg-gray-100 rounded-lg overflow-hidden'
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${selectedProduct.name} ${index + 2}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6'>
                  <div className='text-gray-400 flex flex-col items-center'>
                    <Package size={64} />
                    <span className='text-sm mt-2'>No images available</span>
                  </div>
                </div>
              )}

              <div className='flex items-baseline mb-4'>
                <span className='text-primary-600 font-bold text-2xl'>
                  ₹{Number.parseFloat(selectedProduct.price).toFixed(2)}
                </span>
                {selectedProduct.mrp &&
                  selectedProduct.mrp > selectedProduct.price && (
                    <>
                      <span className='ml-2 text-gray-500 text-lg line-through'>
                        ₹{Number.parseFloat(selectedProduct.mrp).toFixed(2)}
                      </span>
                      <span className='ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded'>
                        {Math.round(
                          ((selectedProduct.mrp - selectedProduct.price) /
                            selectedProduct.mrp) *
                            100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
              </div>

              <div className='flex items-center gap-4 mb-4'>
                {selectedProduct.stock > 0 ? (
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse'>
                    <span className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping'></span>
                    {selectedProduct.stock} in Stock
                  </span>
                ) : (
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'>
                    Sold Out
                  </span>
                )}

                <button
                  onClick={() =>
                    toggleHomeVisibility(
                      selectedProduct._id,
                      selectedProduct.homeVisibility
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProduct.homeVisibility
                      ? "bg-purple-100 hover:bg-purple-200 text-purple-800"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  <Home size={14} />
                  {selectedProduct.homeVisibility
                    ? "Visible on Home"
                    : "Hidden from Home"}
                </button>
              </div>

              <div className='grid grid-cols-2 gap-4 mb-6'>
                {selectedProduct.category && (
                  <div>
                    <h3 className='text-sm text-gray-500'>Category</h3>
                    <p className='text-black'>
                      {selectedProduct.category.name}
                    </p>
                  </div>
                )}

                {selectedProduct.subCategory && (
                  <div>
                    <h3 className='text-sm text-gray-500'>Sub-Category</h3>
                    <p className='text-black'>
                      {selectedProduct.subCategory.name}
                    </p>
                  </div>
                )}

                {selectedProduct.color && (
                  <div>
                    <h3 className='text-sm text-gray-500'>Color</h3>
                    <p className='text-black'>{selectedProduct.color}</p>
                  </div>
                )}

                {selectedProduct.fabric && (
                  <div>
                    <h3 className='text-sm text-gray-500'>Fabric</h3>
                    <p className='text-black'>{selectedProduct.fabric}</p>
                  </div>
                )}

                {selectedProduct.size && selectedProduct.size.length > 0 && (
                  <div>
                    <h3 className='text-sm text-gray-500'>Available Sizes</h3>
                    <div className='flex gap-2 mt-1'>
                      {selectedProduct.size.map((size) => (
                        <span
                          key={size}
                          className='inline-block px-2 py-1 border border-gray-300 rounded text-black'
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedProduct.description && (
                <div className='mb-6'>
                  <h3 className='text-lg font-medium mb-2 text-black'>
                    Description
                  </h3>
                  <p className='text-gray-600'>{selectedProduct.description}</p>
                </div>
              )}

              <div className='flex gap-3'>
                <button
                  onClick={() => handleAddToCartClick(selectedProduct)}
                  className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center text-white ${
                    selectedProduct.stock <= 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                  disabled={selectedProduct.stock <= 0}
                >
                  <ShoppingCart size={18} className='mr-2' />
                  {selectedProduct.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className='bg-yellow-50 hover:bg-yellow-100 text-yellow-600 py-2 px-4 rounded-md flex items-center justify-center'
                >
                  <Edit size={18} className='mr-2' />
                  Edit
                </button>
                <button
                  onClick={() => {
                    deleteP(selectedProduct._id);
                    setSelectedProduct(null);
                  }}
                  className='bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-md flex items-center justify-center'
                >
                  <Trash2 size={18} className='mr-2' />
                  Delete
                </button>
                <button
                  onClick={() => {
                    handlePrintProduct(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className='bg-green-50 hover:bg-green-100 text-green-600 py-2 px-4 rounded-md flex items-center justify-center'
                >
                  <Printer size={18} className='mr-2' />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {editingProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-start mb-4'>
                <h2 className='text-2xl font-bold'>Edit Product</h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Product Name
                    </label>
                    <input
                      type='text'
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Price
                    </label>
                    <input
                      type='number'
                      value={editFormData.price}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          price: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      MRP
                    </label>
                    <input
                      type='number'
                      value={editFormData.mrp}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          mrp: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Stock
                    </label>
                    <input
                      type='number'
                      value={editFormData.stock}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          stock: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                      required
                      min='0'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Color
                    </label>
                    <input
                      type='text'
                      value={editFormData.color}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          color: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Fabric
                    </label>
                    <input
                      type='text'
                      value={editFormData.fabric}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          fabric: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    />
                  </div>

                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Sizes (comma separated)
                    </label>
                    <input
                      type='text'
                      value={editFormData.size.join(",")}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          size: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    />
                  </div>

                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md'
                      rows={3}
                    />
                  </div>

                  <div className='col-span-2 flex items-center'>
                    <input
                      type='checkbox'
                      id='homeVisibility'
                      checked={editFormData.homeVisibility}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          homeVisibility: e.target.checked,
                        })
                      }
                      className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='homeVisibility'
                      className='ml-2 block text-sm text-gray-700'
                    >
                      Show on Home Page
                    </label>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <button
                    type='submit'
                    className='flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md'
                  >
                    Save Changes
                  </button>
                  <button
                    type='button'
                    onClick={() => setEditingProduct(null)}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )} */}

      {editingProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold'>Edit Product</h2>
                <button onClick={handleEditModalClose}>
                  <X size={24} />
                </button>
              </div>

              {/* IMAGES SECTION */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Product Images
                </label>

                {/* Existing images */}
                <div className='flex flex-wrap gap-4 mb-4'>
                  {editingProduct?.images?.map((url, index) => (
                    <div key={`existing-${index}`} className='relative group'>
                      <img
                        src={url}
                        alt=''
                        className='h-24 w-24 object-cover rounded-md border'
                      />
                      <button
                        type='button'
                        onClick={() => handleRemoveImage(url)}
                        className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-80 hover:opacity-100 transition-opacity'
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Newly uploaded images preview */}
                {newImages.length > 0 && (
                  <div className='flex flex-wrap gap-4 mb-4'>
                    {newImages.map((file, index) => (
                      <div key={`new-${index}`} className='relative group'>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`new-${index}`}
                          className='h-24 w-24 object-cover rounded-md border'
                        />
                        <button
                          type='button'
                          onClick={() => {
                            const updated = [...newImages];
                            updated.splice(index, 1);
                            setNewImages(updated);
                          }}
                          className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-80 hover:opacity-100 transition-opacity'
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                <label
                  className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary-500 ${
                    (editingProduct?.existingImages?.length || 0) +
                      newImages.length >=
                    5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className='flex flex-col items-center space-y-2'>
                    <Upload size={24} className='text-gray-500' />
                    <span className='font-medium text-gray-600'>
                      Drop files or{" "}
                      <span className='text-primary-600 underline'>browse</span>
                    </span>
                    <span className='text-xs text-gray-500'>
                      {(editingProduct?.existingImages?.length || 0) +
                        newImages.length >=
                      5
                        ? "Maximum 5 images"
                        : `Up to 5 images (${
                            (editingProduct?.existingImages?.length || 0) +
                            newImages.length
                          }/5)`}
                    </span>
                  </div>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const total =
                        (editingProduct?.existingImages?.length || 0) +
                        newImages.length +
                        files.length;

                      if (total > 5) {
                        toast.error("Maximum 5 images allowed");
                        return;
                      }

                      setNewImages((prev) => [...prev, ...files]);
                    }}
                    className='hidden'
                    disabled={
                      (editingProduct?.existingImages?.length || 0) +
                        newImages.length >=
                      5
                    }
                  />
                </label>
              </div>

              {/* EDIT FORM */}
              <form onSubmit={handleEditSubmit} className='mt-4 space-y-4'>
                <div>
                  <label className='block text-sm font-medium'>
                    Product Name
                  </label>
                  <input
                    type='text'
                    value={editFormData.name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        name: e.target.value,
                      })
                    }
                    className='w-full border rounded px-3 py-2'
                    required
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium'>Price</label>
                    <input
                      type='number'
                      value={editFormData.price || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          price: e.target.value,
                        })
                      }
                      className='w-full border rounded px-3 py-2'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium'>MRP</label>
                    <input
                      type='number'
                      value={editFormData.mrp || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          mrp: e.target.value,
                        })
                      }
                      className='w-full border rounded px-3 py-2'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium'>Stock</label>
                    <input
                      type='number'
                      value={editFormData.stock || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          stock: e.target.value,
                        })
                      }
                      className='w-full border rounded px-3 py-2'
                      min='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium'>Color</label>
                    <input
                      type='text'
                      value={editFormData.color || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          color: e.target.value,
                        })
                      }
                      className='w-full border rounded px-3 py-2'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium'>Fabric</label>
                    <input
                      type='text'
                      value={editFormData.fabric || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          fabric: e.target.value,
                        })
                      }
                      className='w-full border rounded px-3 py-2'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium'>
                      Sizes (comma separated)
                    </label>
                    <input
                      type='text'
                      value={editFormData.size.join(",") || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          size: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      className='w-full border rounded px-3 py-2'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium'>Category</label>
                  <input
                    type='text'
                    value={editFormData.category.name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: {
                          ...editFormData.category,
                          name: e.target.value, // agar allow karna hai
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium'>
                    Sub-Category
                  </label>
                  <input
                    type='text'
                    value={editFormData.subCategory.name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        subCategory: {
                          ...editFormData.subCategory,
                          name: e.target.value, // agar allow karna hai
                        },
                      })
                    }
                    className='w-full border rounded px-3 py-2'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium'>
                    Description
                  </label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editFormData.description || ""}
                    onChange={(event, editor) =>
                      setEditFormData({
                        ...editFormData,
                        description: editor.getData(),
                      })
                    }
                  />
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={editFormData.homeVisibility || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        homeVisibility: e.target.checked,
                      })
                    }
                    className='mr-2'
                  />
                  <label>Show on Home Page</label>
                </div>

                <div className='flex gap-3 mt-4'>
                  <button
                    type='submit'
                    className='flex-1 bg-primary-600 text-white py-2 rounded flex items-center justify-center'
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={18} className='animate-spin mr-2' />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type='button'
                    // onClick={() => setEditingProduct(null)}
                    onClick={handleEditModalClose}
                    className='bg-gray-200 text-gray-800 py-2 px-4 rounded'
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
