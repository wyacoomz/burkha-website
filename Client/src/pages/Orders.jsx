import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useReactToPrint } from "react-to-print";
import { debounce } from "lodash";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


const Orders = () => {
  const [state, setState] = useState({
    orders: [],
    filteredOrders: [],
    loading: true,
    error: null,
    search: "",
    selectedOrder: null,
    paymentDetails: [],
    paymentDetailsLoading: false,
    updatingStatus: {}
  });

  const printRef = React.useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOrders = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/order`);
      setState(prev => ({
        ...prev,
        orders: res.data.orders,
        filteredOrders: res.data.orders,
        loading: false
      }));
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to fetch orders. Please try again."
      }));
    }
  }, []);

  const fetchPaymentDetails = async (orderId) => {
    try {
      setState(prev => ({ ...prev, paymentDetailsLoading: true }));
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${orderId}`);
      setState(prev => ({
        ...prev,
        paymentDetails: res.data.payments || [],
        paymentDetailsLoading: false
      }));
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
      setState(prev => ({
        ...prev,
        paymentDetails: [],
        paymentDetailsLoading: false
      }));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setState(prev => ({
        ...prev,
        updatingStatus: { ...prev.updatingStatus, [orderId]: true }
      }));

      const orderToUpdate = state.orders.find(order => order._id === orderId);

      if (newStatus === "shipped") {
        navigate(`/ship-order/${orderId}`, { 
          state: { order: orderToUpdate } 
        });
        return;
      } else if (newStatus === "delivered") {
        navigate(`/deliver-order/${orderId}`, { 
          state: { order: orderToUpdate } 
        });
        return;
      } else if (newStatus === "cancelled") {
        navigate(`/cancel-order/${orderId}`, { 
          state: { order: orderToUpdate } 
        });
        return;
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/order/${orderId}`, { status: newStatus });
      await fetchOrders();
      
      if (state.selectedOrder?._id === orderId) {
        closeModal();
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setState(prev => ({
        ...prev,
        updatingStatus: { ...prev.updatingStatus, [orderId]: false }
      }));
    }
  };

  const handleSearch = debounce((searchValue) => {
    const result = state.orders.filter((order) => {
      const searchLower = searchValue.toLowerCase();
      return (
        order._id?.toLowerCase().includes(searchLower) ||
        (order.orderItems[0]?.discountName?.firmName?.toLowerCase().includes(searchLower)) ||
        new Date(order.createdAt).toLocaleDateString().toLowerCase().includes(searchLower) ||
        `${order.totalPriceAfterDiscount ?? order.totalPrice}`.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower) ||
        order.paymentStatus?.toLowerCase().includes(searchLower)
      );
    });
    setState(prev => ({ ...prev, filteredOrders: result }));
  }, 300);

  const generatePDF = () => {
    if (!state.selectedOrder) return;

    const doc = new jsPDF();
    const vendor = state.selectedOrder.orderItems[0]?.discountName;

    // Header
    doc.setFontSize(18);
    doc.text("Order Invoice", 14, 20);

    // Company Info
    doc.setFontSize(10);
    doc.text("Company Name", 14, 30);
    doc.text("123 Business Street, City", 14, 36);
    doc.text("Phone: (123) 456-7890", 14, 42);

    // Vendor Details
    doc.setFontSize(12);
    doc.text("Vendor Details:", 14, 54);
    doc.setFontSize(10);
    doc.text(vendor?.firmName || "N/A", 14, 62);
    doc.text(vendor?.contactName || "N/A", 14, 68);
    doc.text(vendor?.email || "N/A", 14, 74);
    doc.text(`${vendor?.address || ""}, ${vendor?.city || ""}, ${vendor?.state || ""}`, 14, 80);
    if (vendor?.mobile1) doc.text(`Mobile: ${vendor.mobile1}`, 14, 86);
    if (vendor?.whatsapp) doc.text(`WhatsApp: ${vendor.whatsapp}`, 14, 92);

    // Order Details
    doc.setFontSize(12);
    doc.text(`Order #${state.selectedOrder._id.slice(-6).toUpperCase()}`, 140, 54);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(state.selectedOrder.createdAt).toLocaleDateString()}`, 140, 62);
    doc.text(`Status: ${state.selectedOrder.status.toUpperCase()}`, 140, 68);
    doc.text(`Payment: ${state.selectedOrder.paymentStatus.toUpperCase()}`, 140, 74);

    // Items Table
    const cols = ["Product", "Qty", "Price", "Discount %", "Price After Discount", "Total"];
    const rows = state.selectedOrder.orderItems.map(item => [
      item.productName,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      `${item.discountPercentage}%`,
      `₹${item.priceAfterDiscount.toFixed(2)}`,
      `₹${(item.priceAfterDiscount * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [cols],
      body: rows,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });

    // Summary
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${state.selectedOrder.totalPrice.toFixed(2)}`, 14, finalY);
    if (state.selectedOrder.totalPriceAfterDiscount) {
      doc.text(`After Discount: ₹${state.selectedOrder.totalPriceAfterDiscount.toFixed(2)}`, 14, finalY + 6);
    }
    doc.text(`Paid: ₹${state.selectedOrder.paidAmount || 0}`, 14, finalY + 12);
    doc.text(`Due: ₹${state.selectedOrder.dueAmount || 
      (state.selectedOrder.totalPriceAfterDiscount ?? state.selectedOrder.totalPrice) - 
      (state.selectedOrder.paidAmount || 0)}`, 14, finalY + 18);

    // Payment History
    if (state.paymentDetails.length > 0) {
      finalY += 30;
      doc.setFontSize(12);
      doc.text("Payment History", 14, finalY);
      const paymentCols = ["Date", "Amount", "Method", "Reference"];
      const paymentRows = state.paymentDetails.map(payment => [
        new Date(payment.paymentDate).toLocaleDateString(),
        `₹${payment.amount}`,
        payment.paymentMethod,
        payment.referenceNumber || "N/A"
      ]);

      autoTable(doc, {
        head: [paymentCols],
        body: paymentRows,
        startY: finalY + 10,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      finalY = doc.lastAutoTable.finalY;
    }

    // Footer
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 14, finalY + 20);
    doc.save(`order-${state.selectedOrder._id.slice(-6)}.pdf`);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-header { display: block !important; }
        .print-footer { display: block !important; }
        .print-logo { max-width: 150px; margin-bottom: 20px; }
        .print-signature { margin-top: 50px; display: flex; justify-content: space-between; }
        .print-photo { max-width: 200px; margin-top: 20px; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
      }
    `,
    removeAfterPrint: true
  });

  const viewOrderDetails = async (order) => {
    setState(prev => ({ ...prev, selectedOrder: order }));
    await fetchPaymentDetails(order._id);
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, selectedOrder: null, paymentDetails: [] }));
  };

  const navigateToPayments = (orderId) => {
    navigate(`/allpayment/${orderId}`);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = [
    {
      name: "Order ID",
      selector: (row) => row._id.slice(-6).toUpperCase(),
      sortable: true,
      width: "120px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      width: "120px",
    },
    {
      name: "Vendor",
      selector: (row) => row.orderItems[0].discountName?.firmName || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: "Total",
      selector: (row) => `₹${row.totalPriceAfterDiscount ?? row.totalPrice}`,
      sortable: true,
      width: "120px",
    },
    {
      name: "Due Amount",
      selector: (row) => `₹${row.dueAmount ?? (row.totalPriceAfterDiscount ?? row.totalPrice) - (row.paidAmount || 0)}`,
      sortable: true,
      width: "120px",
    },
      {
      name: "limit",
      selector: (row) => row.orderItems[0].discountName?.limit,
      sortable: true,
      width: "120px",
    },
    
  
  
    {
      name: "Payment Status",
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${row.paymentStatus === "paid" ? "bg-green-100 text-green-800" : 
              row.paymentStatus === "partially_paid" ? "bg-blue-100 text-blue-800" : 
              "bg-yellow-100 text-yellow-800"}`}
        >
          {(row.paymentStatus || "pending").toUpperCase()}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Order Status",
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${row.status === "delivered" ? "bg-green-100 text-green-800" : 
              row.status === "processing" || row.status === "shipped" ? "bg-blue-100 text-blue-800" : 
              row.status === "cancelled" ? "bg-red-100 text-red-800" : 
              "bg-yellow-100 text-yellow-800"}`}
        >
          {(row.status || "pending").toUpperCase()}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => viewOrderDetails(row)}
            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100"
            disabled={state.updatingStatus[row._id]}
          >
            View
          </button>
          <select
            value={row.status || "pending"}
            onChange={(e) => {
              const selectedValue = e.target.value;
              updateOrderStatus(row._id, selectedValue);
            }}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            disabled={state.updatingStatus[row._id]}
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {state.updatingStatus[row._id] && (
            <span className="text-xs text-gray-500">Updating...</span>
          )}
        </div>
      ),
      width: "180px",
    },
    {
      name: "Payment",
      cell: (row) => (
        <button
          onClick={() => navigateToPayments(row._id)}
          className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
        >
          {row.paymentStatus === "paid" ? "View Payments" : "Add Payment"}
        </button>
      ),
      width: "120px",
    },
    {
      name: "Print",
      cell: (row) => (
        <button
          onClick={() => {
            viewOrderDetails(row);
            setTimeout(() => generatePDF(), 500);
          }}
          className="px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded hover:bg-purple-100"
        >
          Print PDF
        </button>
      ),
      width: "100px",
    },
  ];

  return (
    <div className="max-w-5xl py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search orders..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={fetchOrders}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {state.error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {state.error}
          <button 
            onClick={fetchOrders}
            className="ml-2 text-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={state.filteredOrders}
          progressPending={state.loading}
          progressComponent={<LoadingSpinner />}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          responsive
          noDataComponent={
            <div className="p-4 text-center text-gray-500">
              {state.error ? 'Error loading orders' : 'No orders found'}
            </div>
          }
        />
      </div>

      {state.selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6" ref={printRef}>
              <div className="print-header hidden mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">Company Name</h1>
                    <p className="text-gray-600">123 Business Street, City</p>
                    <p className="text-gray-600">Phone: (123) 456-7890</p>
                  </div>
                  <div className="print-logo">
                    <div className="bg-gray-200 w-32 h-32 flex items-center justify-center">
                      <span className="text-gray-500">Company Logo</span>
                    </div>
                  </div>
                </div>
                <hr className="my-4 border-t-2 border-gray-300" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">Order #{state.selectedOrder._id.slice(-6).toUpperCase()}</h3>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(state.selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="nicest-right">
                  <p className="font-semibold">Status: 
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${state.selectedOrder.status === "delivered" ? "bg-green-100 text-green-800" : 
                        state.selectedOrder.status === "processing" || state.selectedOrder.status === "shipped" ? "bg-blue-100 text-blue-800" : 
                        state.selectedOrder.status === "cancelled" ? "bg-red-100 text-red-800" : 
                        "bg-yellow-100 text-yellow-800"}`}>
                      {(state.selectedOrder.status || "pending").toUpperCase()}
                    </span>
                  </p>
                  <p className="font-semibold">Payment: 
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${state.selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-800" : 
                        state.selectedOrder.paymentStatus === "partially_paid" ? "bg-blue-100 text-blue-800" : 
                        "bg-yellow-100 text-yellow-800"}`}>
                      {(state.selectedOrder.paymentStatus || "pending").toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-bold mb-2">Vendor Details</h4>
                  {state.selectedOrder.orderItems[0]?.discountName ? (
                    <>
                      <p><span className="font-semibold">Firm Name:</span> {state.selectedOrder.orderItems[0].discountName.firmName}</p>
                      <p><span className="font-semibold">Contact Person:</span> {state.selectedOrder.orderItems[0].discountName.contactName}</p>
                      <p><span className="font-semibold">Mobile:</span> {state.selectedOrder.orderItems[0].discountName.mobile1}</p>
                      <p><span className="font-semibold">Mobile 2:</span> {state.selectedOrder.orderItems[0].discountName.mobile2 || "N/A"}</p>
                      <p><span className="font-semibold">WhatsApp:</span> {state.selectedOrder.orderItems[0].discountName.whatsapp || "N/A"}</p>
                      <p><span className="font-semibold">Email:</span> {state.selectedOrder.orderItems[0].discountName.email || "N/A"}</p>
                      <p><span className="font-semibold">Address:</span> {state.selectedOrder.orderItems[0].discountName.address}, {state.selectedOrder.orderItems[0].discountName.city}, {state.selectedOrder.orderItems[0].discountName.state}</p>
                      <p><span className="font-semibold">Discount:</span> {state.selectedOrder.orderItems[0].discountPercentage}%</p>
                    </>
                  ) : (
                    <p>No vendor details available</p>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-bold mb-2">Order Summary</h4>
                  <p><span className="font-semibold">Subtotal:</span> ₹{state.selectedOrder.totalPrice.toFixed(2)}</p>
                  {state.selectedOrder.totalPriceAfterDiscount && (
                    <p><span className="font-semibold">After Discount:</span> ₹{state.selectedOrder.totalPriceAfterDiscount.toFixed(2)}</p>
                  )}
                  <p><span className="font-semibold">Paid Amount:</span> ₹{(state.selectedOrder.paidAmount || 0).toFixed(2)}</p>
                  <p><span className="font-semibold">Due Amount:</span> ₹{(state.selectedOrder.dueAmount || 
                    (state.selectedOrder.totalPriceAfterDiscount ?? state.selectedOrder.totalPrice) - 
                    (state.selectedOrder.paidAmount || 0)).toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-2">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="print-table min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price After Discount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {state.selectedOrder.orderItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.productName}
                            {item.productImage && (
                              <div className="print-photo hidden mt-2">
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName} 
                                  className="max-w-xs border border-gray-300"
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.discountPercentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{item.priceAfterDiscount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{(item.priceAfterDiscount * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {state.selectedOrder.status === "cancelled" && state.selectedOrder.cancellationReason && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">Cancellation Reason</h4>
                  <p className="text-red-700">{state.selectedOrder.cancellationReason}</p>
                </div>
              )}

              {state.paymentDetails.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold mb-2">Payment History</h4>
                  <div className="overflow-x-auto">
                    <table className="print-table min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {state.paymentDetails.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payment.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.paymentMethod}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.referenceNumber || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="print-footer hidden mt-8">
                <div className="print-signature">
                  <div>
                    <p className="border-t border-gray-400 pt-2">Customer Signature</p>
                  </div>
                  <div>
                    <p className="border-t border-gray-400 pt-2">Company Representative</p>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Thank you for your business!
                </div>
              </div>
            </div>
            
            <div className="no-print p-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateToPayments(state.selectedOrder._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {state.selectedOrder.paymentStatus === "paid" ? "View Payments" : "Add Payment"}
                </button>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;