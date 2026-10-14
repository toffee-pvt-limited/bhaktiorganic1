// import { FileText, FlaskConical } from "lucide-react";

export default function ProductInfo({
  ingredients,
  description3,
  nutrition,
  saturatedFat,
  servingSize,
  servingsPerContainer,
  totalCarbohydrate,
  totalFat,
  protein,
  sodium,
  dietaryFiber,
  calories,
}: {
  ingredients: string;
  description3: string;
  nutrition: string;
  saturatedFat: string;
  servingSize: string;
  servingsPerContainer: string;
  totalCarbohydrate: string;
  totalFat: string;
  protein: string;
  sodium: string;
  dietaryFiber: string;
  calories: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
          {/* Product Description */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              {/* <FileText className="h-5 w-5 text-[#5a3a28]" /> */}
              <h2 className="text-xl font-semibold text-gray-900">
                Product Description
              </h2>
            </div>

            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p>{description3}</p>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-14">
            <div className="mb-4 flex items-center gap-2">
              {/* <FlaskConical className="h-5 w-5 text-[#5a3a28]" /> */}
              <h2 className="text-xl font-semibold text-gray-900">
                Ingredients
              </h2>
            </div>

            <p className="text-gray-700 leading-relaxed">{ingredients}</p>

            <p className="mt-3 text-sm italic text-gray-500">
              May contain traces of peanuts and tree nuts due to shared
              processing equipment.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — NUTRITION FACTS */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#181511]">
            Nutrition Facts
          </h3>

          <div className="divide-y">
            {/* Serving Info */}
            <div className="space-y-3 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#897961]">Serving Size</span>
                <span className="font-medium text-[#181511]">1 Cup (30g)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#897961]">Servings Per Container</span>
                <span className="font-medium text-[#181511]">
                  {servingsPerContainer}
                </span>
              </div>
            </div>

            {/* Calories */}
            <div className="flex items-center justify-between py-6">
              <span className="text-lg font-semibold text-[#181511]">
                Calories
              </span>
              <span className="text-2xl font-bold text-[#181511]">
                {calories}
              </span>
            </div>

            {/* Nutrients */}
            <div className="space-y-4 py-6 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-[#4E4539]">Total Fat</span>
                <span className="font-medium text-[#181511]">{totalFat}</span>
              </div>
              <div className="flex justify-between pl-4 text-[#897961]">
                <span>Saturated Fat</span>
                <span>{saturatedFat}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-[#4E4539]">Sodium</span>
                <span className="font-medium text-[#181511]">{sodium}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-[#4E4539]">
                  Total Carbohydrate
                </span>
                <span className="font-medium text-[#181511]">
                  {totalCarbohydrate}
                </span>
              </div>
              <div className="flex justify-between pl-4 text-[#897961]">
                <span>Dietary Fiber</span>
                <span>{dietaryFiber}</span>
              </div>

              <div className="flex justify-between text-base font-semibold">
                <span className="text-[#181511]">Protein</span>
                <span className="text-[#181511]">{protein}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
