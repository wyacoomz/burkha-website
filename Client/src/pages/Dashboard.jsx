// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
//   const [todaysTotal, setTodaysTotal] = useState({ count: 0, price: 0 });
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [totalOrdersCount, setTotalOrdersCount] = useState(0);
//   const [canceledCount, setCanceledCount] = useState(0);
//   const [deliveredCount, setDeliveredCount] = useState(0);
//   import ChartComponent from './ChartCompoenent'; 
//   const navigate = useNavigate();

//   const fetchOrders = async () => {
//     try {
//       // Fetch all orders first
//       const allOrdersRes = await axios.get(`${import.meta.env.VITE_API_URL}/order`);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       // Filter today's orders
//       const todaysOrders = allOrdersRes.data.orders.filter(order => {
//         const orderDate = new Date(order.createdAt);
//         return orderDate >= today;
//       });

//       // Fetch shipped orders
//       const shippedRes = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/shipped`);
//       const shippedOrders = shippedRes.data.orders || [];

//       // Fetch delivered orders
//       const deliveredRes = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/delivered`);
//       const deliveredOrders = deliveredRes.data.orders || [];

//       setOrders(allOrdersRes.data.orders);
//       setFilteredOrders(todaysOrders);
//       setTotalOrdersCount(allOrdersRes.data.orders.length);
//       setCanceledCount(shippedOrders.length);
//       setDeliveredCount(deliveredOrders.length);
//       calculateTodaysTotals(todaysOrders);
//     } catch (err) {
//       console.error("Failed to fetch orders:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const calculateTodaysTotals = (orders) => {
//     let totalPrice = 0;

//     orders.forEach(order => {
//       order.orderItems?.forEach(item => {
//         totalPrice += (item.priceAfterDiscount || item.price || 0) * (item.quantity || 0);
//       });
//     });

//     setTodaysTotal({
//       count: orders.length,
//       price: totalPrice
//     });
//   };

//   // Stats data
//   const stats = [
//     {
//       title: "New Orders",
//       value: todaysTotal.count,
//       info: "Today's orders count",
//       color: "bg-blue-100 text-blue-800",
//       onClick: () => navigate("/todayorder")
//     },
//     {
//       title: "Total Order",
//       value: totalOrdersCount,
//       info: "All orders count",
//       color: "bg-green-100 text-green-800",
//       onClick: () => navigate("/orders")
//     },
//     {
//       title: "Dispatched",
//       value: canceledCount,
//       info: "Total shipped orders",
//       color: "bg-purple-100 text-purple-800",
//       onClick: () => navigate("/shippedorderdisplay")
//     },
//     {
//       title: "Delivered",
//       value: deliveredCount,
//       info: "Total delivered orders",
//       color: "bg-yellow-100 text-yellow-800",
//       onClick: () => navigate("/deliverorder")
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p>Loading...</p>
//       </div>
//     );
//   }

  
//     // <div className="max-w-5xl ms-auto py-8 bg-gray-50">
//     //   {/* Header */}
//     //   <header className="bg-white shadow">
//     //     <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
//     //       <h1 className="text-3xl font-bold text-gray-900">Dashbaord</h1>
//     //       <div className="text-sm text-gray-500">Admin</div>
//     //     </div>
//     //   </header>

//     //   {/* Main Content */}
//     //   <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
//     //     {/* Dashboard Title */}
//     //     <div className="mb-8">
//     //       <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
//     //       <p className="text-gray-600">All data for today</p>
//     //     </div>

//     //     {/* Stats Grid */}
//     //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//     //       {stats.map((stat, index) => (
//     //         <div
//     //           key={index}
//     //           className={`p-6 rounded-lg shadow ${stat.color} cursor-pointer hover:shadow-md transition-shadow`}
//     //           onClick={stat.onClick}
//     //         >
//     //           <h3 className="text-lg font-medium">{stat.title}</h3>
//     //           <p className="text-3xl font-bold my-2">{stat.value}</p>
//     //           <p className="text-sm">{stat.info}</p>
//     //         </div>
//     //       ))}
//     //     </div>
//     //   </main>
//     // </div>
//     return (
//     <div className="max-w-5xl ms-auto py-8 bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//           <div className="text-sm text-gray-500">Admin</div>
//         </div>
//       </header>
//       {/* Main Content */}
   
//     <div className="max-w-5xl ms-auto py-8 bg-gray-50">
//     <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
//     <div className="mb-8">
//     <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
//     <p className="text-gray-600">All data for today</p>
//   </div>
  
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//     {stats.map((stat, index) => (
//       <div
//         key={index}
//         className={`p-6 rounded-lg shadow ${stat.color} cursor-pointer hover:shadow-md transition-shadow`}
//         onClick={stat.onClick}
//       >
//         <h3 className="text-lg font-medium">{stat.title}</h3>
//         <p className="text-3xl font-bold my-2">{stat.value}</p>
//         <p className="text-sm">{stat.info}</p>
//       </div>
//     ))}
//   </div>
//   {/* Chart Component */}
//   <div className="mb-8">
//     <h2 className="text-2xl font-semibold text-gray-800">Today's Orders Overview</h2>
//     <ChartComponent todaysTotal={todaysTotal} filteredOrders={filteredOrders} />
//   </div>
// </main>
// </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChartComponent from '../pages/ChartCompoenent';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [todaysTotal, setTodaysTotal] = useState({ count: 0, price: 0 });
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [historicalData, setHistoricalData] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      // Fetch all orders
      const allOrdersRes = await axios.get(`${import.meta.env.VITE_API_URL}/order`);
      
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter today's orders
      const todaysOrders = allOrdersRes.data.orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today;
      });

      // Fetch shipped and delivered orders
      const shippedRes = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/shipped`);
      const deliveredRes = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/delivered`);

      // Mock historical data - in a real app, you would fetch this from your backend
      const mockHistoricalData = generateMockHistoricalData(
        allOrdersRes.data.orders.length,
        shippedRes.data.orders?.length || 0,
        deliveredRes.data.orders?.length || 0
      );

      setOrders(allOrdersRes.data.orders);
      setFilteredOrders(todaysOrders);
      setTotalOrdersCount(allOrdersRes.data.orders.length);
      setCanceledCount(shippedRes.data.orders?.length || 0);
      setDeliveredCount(deliveredRes.data.orders?.length || 0);
      setHistoricalData(mockHistoricalData);
      calculateTodaysTotals(todaysOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate mock historical data
  const generateMockHistoricalData = (total, shipped, delivered) => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate decreasing values as we go back in time
      const dayTotal = Math.max(1, Math.round(total * (0.7 + Math.random() * 0.6 - (6-i)*0.1)));
      const dayShipped = Math.max(0, Math.round(shipped * (0.7 + Math.random() * 0.6 - (6-i)*0.1)));
      const dayDelivered = Math.max(0, Math.round(delivered * (0.7 + Math.random() * 0.6 - (6-i)*0.1)));
      
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: dayTotal,
        shipped: dayShipped,
        delivered: dayDelivered
      });
    }
    
    return days;
  };

  const calculateTodaysTotals = (orders) => {
    let totalPrice = 0;
    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        totalPrice += (item.priceAfterDiscount || item.price || 0) * (item.quantity || 0);
      });
    });
    setTodaysTotal({ count: orders.length, price: totalPrice });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = [
    {
      title: "New Orders",
      value: todaysTotal.count,
      info: "Today's orders count",
      color: "bg-blue-100 text-blue-800",
      onClick: () => navigate("/todayorder")
    },
    {
      title: "Total Order",
      value: totalOrdersCount,
      info: "All orders count",
      color: "bg-green-100 text-green-800",
      onClick: () => navigate("/orders")
    },
    {
      title: "Dispatched",
      value: canceledCount,
      info: "Total shipped orders",
      color: "bg-purple-100 text-purple-800",
      onClick: () => navigate("/shippedorderdisplay")
    },
    {
      title: "Delivered",
      value: deliveredCount,
      info: "Total delivered orders",
      color: "bg-yellow-100 text-yellow-800",
      onClick: () => navigate("/deliverorder")
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">Admin</div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-gray-600">All data for today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg shadow ${stat.color} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={stat.onClick}
            >
              <h3 className="text-lg font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold my-2">{stat.value}</p>
              <p className="text-sm">{stat.info}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Orders Trend (Last 7 Days)</h2>
          <div className="w-full h-72">
            <ChartComponent
              historicalData={historicalData}
              todaysTotal={todaysTotal}
              totalOrdersCount={totalOrdersCount}
              canceledCount={canceledCount}
              deliveredCount={deliveredCount}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;