
// import React, { useState, useEffect } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   Home,
//   QrCode,
//   PlusCircle,
//   Layers,
//   LayoutGrid,
//   UserPlus,
//   LogIn,
//   Menu,
//   X,
//   ChevronDown,
//   ChevronUp,
//   Package,
//   List,
//   Grid,
//   ClipboardList,
//   BarChart2,
//   Truck,
// } from "lucide-react";

// const Sidebar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [openDropdown, setOpenDropdown] = useState(null);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("isAuthenticated");
//     localStorage.removeItem("userToken");
//     localStorage.removeItem("userData");
//     localStorage.clear();
//     setIsAuthenticated(false);
//   };

//   const toggleSidebar = () => setIsOpen(!isOpen);

//   const toggleDropdown = (item) => {
//     setOpenDropdown(openDropdown === item ? null : item);
//   };

//   const navItems = [
//     {
//       to: "/dashboard",
//       label: "Dashboard",
//       icon: BarChart2,
//     },

//     {
//       label: "Master",
//       icon: Layers,
//       subItems: [
//         { to: "/categories", label: "All Categories", icon: List },
//         { to: "/subcategories", label: "Sub-Categories", icon: Grid },
//         { to: "/create", label: "Add Product", icon: PlusCircle },
//       ],
//     },

//     {
//       label: "View Products",
//       icon: Package,
//       subItems: [
//         { to: "/", label: "All Products", icon: Home },

//       ],
//     },

//       {
//       label: "View Customer",
//       icon: Package,
//       subItems: [
//         { to: "/customer", label: "view Customer", icon: Home },

//       ],
//     },



//     {
//       label: "Orders",
//       icon: Package,
//       subItems: [
//         { to: "/todayorder", label: "Today Order", icon: ClipboardList },
//         { to: "/orders", label: "Total Orders", icon: ClipboardList },
//         { to: "/deliverorder", label: "Dispatch Order", icon: Truck },
//         { to: "/shippedorderdisplay", label: "Shipped Orders", icon: QrCode },
//         { to: "/cancelorder", label: "Cancel Order", icon: QrCode },
//       ],
//     },


//     {
//       label: "Stock-in",
//       icon: Package,
//       subItems: [
//         {to:"/purchasescan", label:"purchaseStock", icon:QrCode},
//           {to:"/contactdisplay", label:"Contact", icon:QrCode},



//       ],
//     },


//       {
//       label: "Billing",
//       icon: Package,
//       subItems: [
//         // { to: "/scan", label: "Scan QR", icon: QrCode },
//         { to: "/purchaseScanQRCode", label: "Scan QR", icon: QrCode },

//         { to: "/invoice", label: "All Invoices", icon: ClipboardList },


//       ],
//     },


//     {
//       label: "Banner",
//       icon: Package,
//       subItems: [

//           {to:"/banner", label:"Banner", icon:QrCode},
//           {to:"/bannerdisplay", label:"BannerShow", icon:QrCode}


//       ],
//     },




//   {
//         label: "Registration",
//         icon: Layers,
//         subItems: [
//           { to: "/registration", label: "Registration", icon: UserPlus },


//           {to:"/contactdisplay", label:"Contact", icon:QrCode},
//                   // {to:"/brand", label:"Brand", icon:QrCode},
//                   // {to:"/branddisplay", label:"Brandshow", icon:QrCode},
//                    {to:"/registrationvendor", label:"registrationvendor", icon:Home}
//         ],
//       },




//     // { to: "/registration", label: "Registration", icon: UserPlus },







//   ];

//   return (
//     <>
//       {/* Mobile Hamburger Button */}
//       {isMobile && (
//         <button
//           onClick={toggleSidebar}
//           className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
//           aria-label="Toggle menu"
//         >
//           {isOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       )}

//       {/* Overlay for mobile */}
//       {isMobile && isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`bg-white shadow-lg border-r z-50 transition-transform duration-300 ease-in-out ${
//           isMobile
//             ? `fixed top-0 left-0 h-full w-64 transform ${
//                 isOpen ? "translate-x-0" : "-translate-x-full"
//               }`
//             : "hidden md:block md:fixed md:top-16 md:left-0 md:w-64 md:h-[calc(100%-4rem)]"
//         } overflow-y-auto`}
//       >
//         <div className="p-4 h-full flex flex-col">
//           <h2 className="text-xl font-bold text-gray-800 mb-6 px-3 py-2 border-b border-gray-200">
//             Admin Panel
//           </h2>
//           <nav className="flex-1 overflow-y-auto space-y-1">
//             {navItems.map((item) => {
//               if (item.subItems) {
//                 return (
//                   <div key={item.label} className="mb-1">
//                     <button
//                       onClick={() => toggleDropdown(item.label)}
//                       className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
//                         openDropdown === item.label
//                           ? "bg-blue-50 text-blue-600"
//                           : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
//                       }`}
//                     >
//                       <div className="flex items-center">
//                         <item.icon className="w-5 h-5 mr-3" />
//                         {item.label}
//                       </div>
//                       {openDropdown === item.label ? (
//                         <ChevronUp className="w-4 h-4" />
//                       ) : (
//                         <ChevronDown className="w-4 h-4" />
//                       )}
//                     </button>
//                     {openDropdown === item.label && (
//                       <div className="ml-8 mt-1 space-y-1">
//                         {item.subItems.map((subItem) => (
//                           <NavLink
//                             key={subItem.to}
//                             to={subItem.to}
//                             onClick={() => isMobile && setIsOpen(false)}
//                             className={({ isActive }) =>
//                               `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
//                                 isActive
//                                   ? "bg-blue-100 text-blue-600"
//                                   : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
//                               }`
//                             }
//                           >
//                             <subItem.icon className="w-4 h-4 mr-3" />
//                             {subItem.label}
//                           </NavLink>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 );
//               }
//               return (
//                 <NavLink
//                   key={item.to}
//                   to={item.to}
//                   onClick={() => isMobile && setIsOpen(false)}
//                   className={({ isActive }) =>
//                     `flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
//                       isActive
//                         ? "bg-blue-50 text-blue-600"
//                         : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
//                     }`
//                   }
//                 >
//                   <item.icon className="w-5 h-5 mr-3" />
//                   {item.label}
//                 </NavLink>
//               );
//             })}
//           </nav>

//           {/* Mobile close button inside sidebar */}
//           {isMobile && (
//             <button
//               onClick={toggleSidebar}
//               className="mt-auto p-3 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center md:hidden"
//             >
//               <X className="w-5 h-5 mr-2" />
//               Close Menu
//             </button>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  QrCode,
  PlusCircle,
  Layers,
  LayoutGrid,
  UserPlus,
  LogIn,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  List,
  Grid,
  ClipboardList,
  BarChart2,
  Truck,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleDropdown = (item) =>
    setOpenDropdown(openDropdown === item ? null : item);

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
      label: "View Customer",
      icon: Package,
      subItems: [{ to: "/customer", label: "View Customer", icon: Home }],
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
      subItems: [
        { to: "/purchasescan", label: "Purchase Stock", icon: QrCode },
        { to: "/contactdisplay", label: "Contact", icon: QrCode },
      ],
    },
    {
      label: "Billing",
      icon: Package,
      subItems: [
        { to: "/purchaseScanQRCode", label: "Scan QR", icon: QrCode },
        { to: "/invoice", label: "All Invoices", icon: ClipboardList },
      ],
    },
    {
      label: "Banner",
      icon: Package,
      subItems: [
        { to: "/banner", label: "Banner", icon: QrCode },
        { to: "/bannerdisplay", label: "Banner Show", icon: QrCode },
      ],
    },
    {
      label: "Registration",
      icon: Layers,
      subItems: [
        { to: "/registration", label: "Registration", icon: UserPlus },
        { to: "/contactdisplay", label: "Contact", icon: QrCode },
        { to: "/registrationvendor", label: "Registration Vendor", icon: Home },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow text-black hover:bg-gray-200 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white text-black shadow-lg border-r z-50 transition-transform duration-300 ease-in-out w-64 h-screen ${
          isMobile
            ? `fixed top-0 left-0 h-full w-64 transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : " "
        } overflow-y-auto`}
      >
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-6 px-3 py-2 border-b border-gray-200">
            Admin Panel
          </h2>

          <nav className="flex-1 overflow-y-auto space-y-1">
            {navItems.map((item) =>
              item.subItems ? (
                <div key={item.label} className="mb-1">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition ${
                      openDropdown === item.label
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-800 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </div>
                    {openDropdown === item.label ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {openDropdown === item.label && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          onClick={() => isMobile && setIsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                              isActive
                                ? "bg-blue-100 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`
                          }
                        >
                          <subItem.icon className="w-4 h-4 mr-3" />
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-md text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-800 hover:bg-gray-100 hover:text-blue-600"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="mt-auto p-3 rounded-md bg-gray-200 text-black hover:bg-gray-300 transition"
            >
              <X className="w-5 h-5 mr-2" />
              Close Menu
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
