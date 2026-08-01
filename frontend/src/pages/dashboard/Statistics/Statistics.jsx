import { TrendingUp, ShoppingCart, Users } from "lucide-react";

function Statistics() {
  const stats = [
    {
      title: "Total Orders",
      value: "1,520",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Revenue",
      value: "₹2,45,000",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Customers",
      value: "980",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="border dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {item.title}
                  </p>

                  <h3 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">
                    {item.value}
                  </h3>
                </div>

                <Icon
                  size={34}
                  className={item.color}
                />

              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Statistics;