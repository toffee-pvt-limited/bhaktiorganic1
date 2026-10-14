export default function NutritionFacts() {
  const rows = [
    { label: "Calories", value: "140" },
    { label: "Total Fat", value: "5g" },
    { label: "Sodium", value: "180mg" },
    { label: "Total Carbs", value: "20g" },
    { label: "Protein", value: "5g" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-[#2D2A26]">Nutrition Facts</h3>

      <ul className="mt-4 space-y-3 text-sm">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex justify-between border-b border-gray-100 pb-2"
          >
            <span className="text-gray-600">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
