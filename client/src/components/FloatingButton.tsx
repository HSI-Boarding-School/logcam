import { useState } from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"

export default function FloatingButton() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const menus = [
    { href: "/take-laptop", emot: "🫴💻", label: "Take Laptop" },
    { href: "/take-phone", emot: "🫴📱", label: "Take Phone" },
    { href: "/return-laptop", emot: "🔁💻", label: "Return Laptop" },
    { href: "/return-phone", emot: "🔁📱", label: "Return Phone" },
  ]

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="fixed bottom-5 left-5 py-5 rounded-full px-4 shadow-lg cursor-pointer z-50"
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-5 bg-slate-950 shadow-2xl rounded-xl px-6 pb-2 pt-6 flex flex-col gap-4 z-40"
          >
            <div className="grid grid-cols-2 gap-3 h-full mb-4">
              {menus.map((menu) => {
                const isActive = location.pathname === menu.href
                return (
                  <Link
                    key={menu.href}
                    to={menu.href}
                    className={`w-44 h-32 bg-slate-800 text-slate-300 border flex flex-col justify-center items-center rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "border-cyan-500 border-2 bg-slate-200 text-slate-900"
                        : "border-slate-700 hover:bg-slate-900"
                    }`}
                    onClick={() => setMenuOpen(false)} // close menu after click
                  >
                    <p className="text-2xl">{menu.emot}</p>
                    <p className="font-medium">{menu.label}</p>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
