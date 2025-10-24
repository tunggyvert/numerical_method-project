import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null); // เก็บ dropdown ที่เปิดอยู่

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name); // ถ้าเปิดอยู่แล้วปิด
  };

  const menuItems = [
    {
      name: "Root Equation",
      links: [
        { to: "/graphical", label: "Graphical" },
        { to: "/bisection", label: "Bisection" },
        { to: "/falseposition", label: "False Position" },
        { to: "/onepoint", label: "Onepoint" },
        { to: "/newton", label: "Newton Raphson" },
        { to: "/secant", label: "Secant" },
      ],
    },
    {
      name: "Linear Algebra",
      links: [{ to: "/Cramer", label: "Cramer Rule" }],
    },
    {
      name: "Interpolation",
      links: [{ to: "/Lagrange", label: "Lagrange Interpolation" }],
    },
    {
      name: "Regression",
      links:[
        {to: "/MultiRe", label: "Multiple Regression"},
        {to: "/LinearP", label: "Linear/Poly Regression"}
      ],
    },
    {
      name: "Integration",
      links: [
        { to: "/CompoTrap", label: "Composite Trapezoid Rule" },
      ],
    },
    {
      name: "Differentiation",
      links: [

      ]
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <ul className="flex justify-evenly items-center p-4 text-lg text-black">
        {menuItems.map((menu) => (
          <li key={menu.name} className="relative">
            <button
              className="px-4 py-2 hover:bg-gray-100 rounded focus:outline-none"
              onClick={() => toggleDropdown(menu.name)}
            >
              {menu.name}
            </button>

            {openDropdown === menu.name && (
              <ul className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-lg">
                {menu.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setOpenDropdown(null)} // ปิด dropdown เมื่อเลือก
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
