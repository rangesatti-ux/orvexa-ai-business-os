import { Users, CalendarCheck, Wallet, Package } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  {
    title: "Employees",
    value: "120",
    icon: Users,
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Attendance",
    value: "98%",
    icon: CalendarCheck,
    color: "from-green-500 to-green-700",
  },
  {
    title: "Payroll",
    value: "₹2.5L",
    icon: Wallet,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Inventory",
    value: "320",
    icon: Package,
    color: "from-purple-500 to-purple-700",
  },
];

function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`bg-gradient-to-r ${card.color} rounded-2xl p-6 text-white shadow-lg`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">{card.title}</p>

                <h2 className="text-3xl font-bold mt-2">
                  {card.value}
                </h2>

                <p className="text-xs mt-2 opacity-80">
                  +12% from last month
                </p>
              </div>

              <div className="bg-white/20 p-3 rounded-full">
                <Icon size={36} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default DashboardCards;