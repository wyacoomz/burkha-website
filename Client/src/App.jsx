import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import {
  Home,
  QrCode,
  PlusCircle,
  ShoppingCart,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  List,
  Grid,
  ClipboardList,
  Truck,
  UserPlus,
  BarChart2,
} from "lucide-react";
import { MdOutlinePayments } from "react-icons/md";
import ScanQRCode from "./pages/ScanQRCode";
import CreateProduct from "./pages/CreateProduct";
import ProductList from "./pages/ProductList";
import { CartProvider, useCart } from "./CartContext";
import CartPage from "./pages/CartPage";
import CategoryManagement from "./pages/CategoryManagement";
import SubCategoryManagement from "./pages/SubCategory";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Sidbar from "./pages/Navbar";
import Orders from "./pages/Orders";
import AllPayment from "./pages/Allpayment";
import PaymentDetail from "./pages/Paymentdetail";
import PurchaseScanQRCode from "./pages/PurchaseScanQRCode";
import AdminLogin from "./pages/AdminLogin";
import { useState } from "react";
import TodayOrders from "./pages/TodayOrders";
import Dashboard from "./pages/Dashboard";
import DeliverOrder from "./pages/Dispacthed";
import ShippingModal from "./pages/ShippedOrder";
import CancelOrderModal from "./pages/CancelOrder";
import DeliveredOrder from "./pages/DilveredOrder";
import ShippedOrdersDisplay from "./pages/ShippedOrdersDiplsay";
import CancelledOrders from "./pages/CancelledOrder";
import Invoice from "./pages/Invoice";
import PurchaseScanstocks from "./pages/PurchaseScanstocks";
import ChartComponent from "./pages/ChartCompoenent";
import ContactDisplay from "./pages/ContactDisplay";
import Brand from "./pages/Brand";
import BrandDisplay from "./pages/BrandDisplay";
import Banner from "./pages/Banner/Banner";
import Bannerdisplay from "./pages/Banner/Bannerdisplay";
import Customer from "./pages/ViewCustomer/Customer";
import AllDetail from "./pages/ViewCustomer/AllDetail";
import VendorDetail from "./pages/ViewCustomer/vendordeatil";
import RegistrationVendor from "./pages/RegsitartionVendor/RegistrationVendor";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <CartProvider>
      <Router>
        {isAuthenticated ? (
          <AppContent onLogout={handleLogout} />
        ) : (
          <Routes>
            <Route path='*' element={<AdminLogin onLogin={handleLogin} />} />
          </Routes>
        )}
      </Router>
    </CartProvider>
  );
}

function AppContent({ onLogout }) {
  const { cart } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (item) => {
    setOpenDropdown(openDropdown === item ? null : item);
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: BarChart2,
    },

    {
      label: "Master",
      icon: Layers,
      subItems: [
        { to: "/categories", label: "All Categories", icon: List },
        { to: "/subcategories", label: "Sub-Categories", icon: Grid },
        { to: "/create", label: "Add Product", icon: PlusCircle },
      ],
    },

    {
      label: "View Products",
      icon: Package,
      subItems: [{ to: "/", label: "All Products", icon: Home }],
    },

    {
      label: "Orders",
      icon: Package,
      subItems: [
        { to: "/todayorder", label: "Today Order", icon: ClipboardList },
        { to: "/orders", label: "Total Orders", icon: ClipboardList },
        { to: "/deliverorder", label: "Dispatch Order", icon: Truck },
        { to: "/shippedorderdisplay", label: "Shipped Orders", icon: QrCode },
        { to: "/cancelorder", label: "Cancel Order", icon: QrCode },
      ],
    },

    {
      label: "Stock-in",
      icon: Package,
      subItems: [{ to: "/purchasescan", label: "purchaseStock", icon: QrCode }],
    },

    {
      label: "Billing",
      icon: Package,
      subItems: [
        // { to: "/scan", label: "Scan QR", icon: QrCode },
        { to: "/purchaseScanQRCode", label: "Scan QR", icon: QrCode },

        { to: "/invoice", label: "All Invoices", icon: ClipboardList },
      ],
    },

    {
      label: "Registration",
      icon: Layers,
      subItems: [
        { to: "/registration", label: "Registration", icon: UserPlus },

        { to: "/contactdisplay", label: "Contact", icon: QrCode },
        // {to:"/brand", label:"Brand", icon:QrCode},
        // {to:"/branddisplay", label:"Brandshow", icon:QrCode},
        { to: "/registrationvendor", label: "registrationvendor", icon: Home },
      ],
    },
  ];
  return (
    <div className='min-h-screen flex bg-gray-50'>
      <div className='hidden md:block'>
        <Sidbar onLogout={onLogout} />
      </div>

      <div className='flex-1 flex flex-col w-full'>
        {/* Header */}
        <header className='bg-white shadow-sm sticky top-0 z-10'>
          <div className='w-full mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between h-16 items-center'>
              <div className='md:hidden flex items-center'>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className='text-gray-500 hover:text-gray-700 focus:outline-none'
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              <div className='flex-shrink-0 flex items-center'>
                <h1 className='text-xl font-bold text-primary-600'>
                  ProductScan
                </h1>
              </div>

              <div className='md:hidden flex items-center'>
                <NavLink
                  to='/cart'
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary-600 relative"
                      : "text-gray-500 hover:text-gray-700 relative"
                  }
                >
                  <ShoppingCart size={24} />
                  {cart.length > 0 && (
                    <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5'>
                      {cart.length}
                    </span>
                  )}
                </NavLink>
              </div>

              <div className='hidden md:flex items-center space-x-6'>
                <button
                  onClick={onLogout}
                  className='text-gray-500 hover:text-gray-700 flex items-center'
                >
                  <LogOut size={20} className='mr-1' />
                  <span className='text-sm hidden buttons lg:inline'>
                    Logout
                  </span>
                </button>

                <NavLink
                  to='/cart'
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary-600 relative"
                      : "text-gray-500 hover:text-gray-700 relative"
                  }
                >
                  <ShoppingCart size={24} />
                  {cart.length > 0 && (
                    <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5'>
                      {cart.length}
                    </span>
                  )}
                </NavLink>
              </div>
            </div>
          </div>

          {/* Mobile Menu with Dropdowns */}
          {mobileMenuOpen && (
            <div className='md:hidden bg-white py-2 px-4 shadow-md h-[calc(100vh-4rem)] overflow-y-auto'>
              <div className='flex flex-col space-y-1'>
                {navItems.map((item) => {
                  if (item.subItems) {
                    return (
                      <div key={item.label} className='mb-1'>
                        <button
                          onClick={() => toggleDropdown(item.label)}
                          className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium ${
                            openDropdown === item.label
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          }`}
                        >
                          <div className='flex items-center'>
                            <item.icon className='w-5 h-5 mr-3' />
                            {item.label}
                          </div>
                          {openDropdown === item.label ? (
                            <ChevronUp className='w-4 h-4' />
                          ) : (
                            <ChevronDown className='w-4 h-4' />
                          )}
                        </button>
                        {openDropdown === item.label && (
                          <div className='ml-8 mt-1 space-y-1'>
                            {item.subItems.map((subItem) => (
                              <NavLink
                                key={subItem.to}
                                to={subItem.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                    isActive
                                      ? "bg-blue-100 text-blue-600"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                  }`
                                }
                              >
                                <subItem.icon className='w-4 h-4 mr-3' />
                                {subItem.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-3 rounded-md text-sm font-medium ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        }`
                      }
                    >
                      <item.icon className='w-5 h-5 mr-3' />
                      {item.label}
                      {item.to === "/cart" && cart.length > 0 && (
                        <span className='ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5'>
                          {cart.length}
                        </span>
                      )}
                    </NavLink>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className='flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                >
                  <LogOut className='w-5 h-5 mr-3' />
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area with Fixed Width and Scroll */}
        <main className='flex-1 py-6 px-2 sm:px-4 overflow-hidden'>
          <div className='w-full max-w-6xl mx-auto h-full overflow-auto px-4 py-4 bg-white rounded-lg shadow'>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/' element={<ProductList />} />
              <Route path='/scan' element={<ScanQRCode />} />
              <Route path='/create' element={<CreateProduct />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/categories' element={<CategoryManagement />} />
              <Route
                path='/subcategories'
                element={<SubCategoryManagement />}
              />
              <Route path='/registration' element={<Registration />} />
              <Route path='/orders' element={<Orders />} />
              <Route path='/allpayment/:id' element={<AllPayment />} />
              <Route path='/paymentdetail' element={<PaymentDetail />} />
              <Route
                path='/purchaseScanQRCode'
                element={<PurchaseScanQRCode />}
              />
              <Route path='/todayorder' element={<TodayOrders />} />
              <Route path='/deliver-order/:id' element={<DeliverOrder />} />
              <Route path='/ship-order/:id' element={<ShippingModal />} />
              <Route path='/cancel-order/:id' element={<CancelOrderModal />} />
              <Route path='/deliverorder' element={<DeliveredOrder />} />
              <Route
                path='/shippedorderdisplay'
                element={<ShippedOrdersDisplay />}
              />
              <Route path='/cancelorder' element={<CancelledOrders />} />
              <Route path='/invoice' element={<Invoice />} />
              <Route path='/purchasescan' element={<PurchaseScanstocks />} />
              <Route path='/cardcompoenent' element={<ChartComponent />} />
              <Route path='/contactdisplay' element={<ContactDisplay />} />
              <Route path='/banner' element={<Banner />} />
              <Route path='/bannerdisplay' element={<Bannerdisplay />} />
              <Route path='/customer' element={<Customer />} />
              <Route path='/vendordetails/:id' element={<AllDetail />} />
              <Route path='/vendor/:id' element={<VendorDetail />} />
              <Route
                path='/registrationvendor'
                element={<RegistrationVendor />}
              />
            </Routes>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50'>
          <div className='flex justify-around'>
            {[
              { to: "/", icon: <Home />, label: "Products" },
              { to: "/scan", icon: <QrCode />, label: "Scan" },
              { to: "/create", icon: <PlusCircle />, label: "Add" },
              { to: "/categories", icon: <Layers />, label: "Categories" },
              // { to: "/paymentdetail", icon: <MdOutlinePayments />, label: "Payments" },
            ].map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? "text-primary-600 flex flex-col items-center py-2 px-3"
                    : "text-gray-500 hover:text-gray-700 flex flex-col items-center py-2 px-3"
                }
              >
                {icon}
                <span className='text-xs mt-1'>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
