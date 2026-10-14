"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VariantsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productIdFilter = searchParams.get("productId");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [variants, setVariants] = useState<any[]>([]);
  const [form, setForm] = useState({
    productId: productIdFilter ? Number(productIdFilter) : 1,
    name: "",
    flavor: "",
    description: "",
    price: "",
    image: "",
    gallery_images: "",
    tag: "",
    size: "",
    variant_sizes: [] as {
      size: string;
      price: number;
      is_default: number;
    }[], // New field
    description2: "",
    description3: "",
    discount: "",
    serving_size: "",
    servingsPerContainer: "",
    calories: "",
    totalFat: "",
    saturatedFat: "",
    sodium: "",
    totalCarbohydrate: "",
    dietaryFiber: "",
    protein: "",
    ingredients: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  // State for existing images when editing
  const [existingImage, setExistingImage] = useState<string>("");
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(
    [],
  );
  // Track images to delete from database
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [deleteMainImage, setDeleteMainImage] = useState<boolean>(false);

  // Update form productId when URL changes
  useEffect(() => {
    if (productIdFilter) {
      setForm((prev) => ({ ...prev, productId: Number(productIdFilter) }));
    }
  }, [productIdFilter]);

  // 🔥 Compress image before upload (to stay under Vercel's 4.5MB limit)
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.8, // 80% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const submit = async () => {
    if (!form.name || !form.flavor || !form.description) {
      alert("Please fill all required fields (Name, Flavor, Description).");
      return;
    }

    // Validate that at least one size with price is added
    if (!form.variant_sizes || form.variant_sizes.length === 0) {
      alert("Please add at least one size with price.");
      return;
    }

    // Check if all sizes have valid size name and price
    const invalidSize = form.variant_sizes.find(
      (s) => !s.size || !s.price || s.price <= 0,
    );
    if (invalidSize) {
      alert("Please make sure all sizes have a valid name and price.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("productId", String(form.productId));
      formData.append("name", form.name);
      formData.append("flavor", form.flavor);
      formData.append("description", form.description);
      formData.append("price", String(form.price));
      formData.append("variant_sizes", JSON.stringify(form.variant_sizes)); // Send as JSON
      formData.append("tag", form.tag);

      // Append new fields
      formData.append("size", form.size);
      formData.append("description2", form.description2);
      formData.append("description3", form.description3);
      formData.append("discount", form.discount);
      formData.append("servingSize", form.serving_size); // Map to servingSize
      formData.append("servingsPerContainer", form.servingsPerContainer);
      formData.append("calories", form.calories);
      formData.append("totalFat", form.totalFat);
      formData.append("saturatedFat", form.saturatedFat);
      formData.append("sodium", form.sodium);
      formData.append("totalCarbohydrate", form.totalCarbohydrate);
      formData.append("dietaryFiber", form.dietaryFiber);
      formData.append("protein", form.protein);
      formData.append("ingredients", form.ingredients);

      // 🔥 Compress main image before upload
      if (file) {
        const compressedFile = await compressImage(file);
        formData.append("image", compressedFile);
      }

      // 🔥 Compress gallery images before upload
      if (galleryFiles) {
        for (const gf of galleryFiles) {
          if (gf) {
            const compressedGf = await compressImage(gf);
            formData.append("gallery_images", compressedGf);
          }
        }
      }

      // Send images to delete (for editing)
      if (imagesToDelete.length > 0) {
        formData.append("images_to_delete", JSON.stringify(imagesToDelete));
      }
      if (deleteMainImage) {
        formData.append("delete_main_image", "true");
      }
      const res = await fetch(
        editingId ? `/api/admin/variants/${editingId}` : "/api/admin/variants",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        },
      );

      if (res.ok) {
        alert("Variant added successfully!");
        setForm({
          productId: productIdFilter ? Number(productIdFilter) : 1,
          name: "",
          flavor: "",
          description: "",
          price: "",
          image: "",
          gallery_images: "",
          tag: "",
          size: "",
          variant_sizes: [],
          description2: "",
          description3: "",
          discount: "",
          serving_size: "",
          servingsPerContainer: "",
          calories: "",
          totalFat: "",
          saturatedFat: "",
          sodium: "",
          totalCarbohydrate: "",
          dietaryFiber: "",
          protein: "",
          ingredients: "",
        });
        setFile(null);
        setGalleryFiles([null, null, null, null]);
        setExistingImage("");
        setExistingGalleryImages([]);
        setImagesToDelete([]);
        setDeleteMainImage(false);
        setEditingId(null);

        loadVariants();
      } else {
        const errorData = await res.json();
        alert(`Failed to add variant: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const loadVariants = async () => {
    const res = await fetch("/api/admin/variants");
    const data = await res.json();
    setVariants(data);
  };
  console.log("variants", variants);

  useEffect(() => {
    loadVariants();
    console.log("variants", variants);
  }, []);

  const deleteVariant = async (id: number) => {
    await fetch(`/api/admin/variants/${id}`, {
      method: "DELETE",
    });
    loadVariants();
  };

  //edit vairenrts
  const startEdit = (variant: any) => {
    setEditingId(variant.id);

    setForm({
      productId: variant.product_id,
      name: variant.name,
      flavor: variant.flavor,
      variant_sizes: variant.available_sizes || [], // Populate from GET response
      description: variant.description || "",
      price: variant.price || "",
      image: "",
      gallery_images: "",
      tag: variant.tag || "",
      size: variant.size || "",
      description2: variant.description2 || "",
      description3: variant.description3 || "",
      discount: variant.discount || "",
      serving_size: variant.serving_size || "",
      servingsPerContainer: variant.servings_per_container || "",
      calories: variant.calories || "",
      totalFat: variant.total_fat || "",
      saturatedFat: variant.saturated_fat || "",
      sodium: variant.sodium || "",
      totalCarbohydrate: variant.total_carbohydrate || "",
      dietaryFiber: variant.dietary_fiber || "",
      protein: variant.protein || "",
      ingredients: variant.ingredients || "",
    });

    setFile(null);
    setGalleryFiles([null, null, null, null]);

    // Set existing images for preview
    setExistingImage(variant.image || "");
    // Gallery images are in variant.images array (after the first which is main)
    const galleryImgs = variant.images?.slice(1) || [];
    setExistingGalleryImages(galleryImgs);

    // Reset delete tracking
    setImagesToDelete([]);
    setDeleteMainImage(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //discount logic
  const getFinalPrice = (price: number, discount: number) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price - (price * discount) / 100);
  };

  const filteredVariants = productIdFilter
    ? variants.filter((v) => v.product_id === Number(productIdFilter))
    : variants;

  const getDefaultSize = (variant: any) => {
    if (!variant.available_sizes || variant.available_sizes.length === 0)
      return null;

    return (
      variant.available_sizes.find((s: any) => s.is_default === 1) ||
      variant.available_sizes[0]
    );
  };

  const getPriceFromSize = (variant: any) => {
    const defaultSize = getDefaultSize(variant);
    return defaultSize ? defaultSize.price : variant.price;
  };

  return (
    <div className="mx-auto px-10 py-8 bg-[#CBCBCB] md:mb-40 ">
      <div className="flex gap-8 h-[85vh]">
        {/* ================= RIGHT : ADD VARIANT FORM ================= */}
        <div className="w-2/3 sticky top-10 h-[80vh] flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-black">
            {editingId ? "Edit Variant" : "Add New Variant"}
          </h2>

          <div className="bg-gray-50 text-black border rounded-xl p-6 flex-1 overflow-y-auto scrollbar">
            <input
              placeholder="Variant Name"
              className="border rounded p-2 w-full mb-3 capitalize"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Description"
              className="border rounded p-2 w-full mb-3 capitalize"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              placeholder="Flavour (e.g. Classic Salted)  "
              className="border rounded p-2 w-full mb-3 capitalize"
              value={form.flavor || ""}
              onChange={(e) => setForm({ ...form, flavor: e.target.value })}
              required
            />
            {/* <input
              placeholder="Price"
              type="number"
              className="border rounded p-2 w-full mb-3"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              placeholder="Size (e.g. 250g)"
              className="border rounded p-2 w-full mb-3"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            /> */}

            {/* Size Manager */}
            <div className="mb-4 border rounded p-4 bg-white">
              <label className="block text-sm font-bold mb-2">
                Available Sizes & Prices
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  placeholder="Size (e.g. 100g)"
                  className="border rounded p-2 w-1/2"
                  id="new-size-input"
                />
                <input
                  placeholder="Price"
                  type="number"
                  className="border rounded p-2 w-1/3"
                  id="new-price-input"
                />
                <button
                  type="button"
                  className="bg-green-600 text-black px-3 rounded"
                  onClick={() => {
                    const sInput = document.getElementById(
                      "new-size-input",
                    ) as HTMLInputElement;
                    const pInput = document.getElementById(
                      "new-price-input",
                    ) as HTMLInputElement;
                    const sVal = sInput.value;
                    const pVal = pInput.value;

                    if (sVal && pVal) {
                      setForm((prev) => ({
                        ...prev,
                        variant_sizes: [
                          ...(prev.variant_sizes || []).map((v) => ({
                            ...v,
                            is_default: 0,
                          })),
                          {
                            size: sVal,
                            price: Number(pVal),
                            is_default: prev.variant_sizes.length === 0 ? 1 : 0,
                          },
                        ],
                      }));
                      sInput.value = "";
                      pInput.value = "";
                    }
                  }}
                >
                  Add
                </button>
              </div>

              {/* List of added sizes */}
              <div className="space-y-2">
                {(form.variant_sizes || []).map((sz, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded"
                  >
                    <div className="flex items-center gap-3">
                      {/* ✅ RADIO BUTTON */}
                      <input
                        type="radio"
                        name="defaultSize"
                        checked={sz.is_default === 1}
                        onChange={() => {
                          setForm((prev) => ({
                            ...prev,
                            variant_sizes: prev.variant_sizes.map((v, i) => ({
                              ...v,
                              is_default: i === idx ? 1 : 0,
                            })),
                          }));
                        }}
                      />

                      <span className="font-medium">
                        {sz.size} – ₹{sz.price}
                      </span>

                      {sz.is_default === 1 && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 rounded">
                          Default
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="text-red-500 text-sm"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          variant_sizes: prev.variant_sizes.filter(
                            (_, i) => i !== idx,
                          ),
                        }));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* {!productIdFilter && (
            <input
              placeholder="Product ID"
              type="number"
              className="border rounded p-2 w-full mb-3"
              value={form.productId}
              onChange={(e) =>
                setForm({
                  ...form,
                  productId: Number(e.target.value),
                })
              }
            />
          )} */}

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Variant Image (Main)
              </label>

              {/* Show existing image when editing */}
              {existingImage && (
                <div className="flex items-center gap-3 mb-2 p-2 bg-gray-100 rounded">
                  <img
                    src={existingImage}
                    className="w-16 h-16 object-cover rounded"
                    alt="Current"
                  />
                  <span className="text-sm text-gray-600 flex-1">
                    Current image
                  </span>
                  <button
                    type="button"
                    className="text-red-500 text-sm"
                    onClick={() => {
                      setDeleteMainImage(true);
                      setExistingImage("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="border rounded p-2 w-full bg-white"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {existingImage && (
                <p className="text-xs text-gray-500 mt-1">
                  Upload new image to replace current
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Gallery Images (Upload up to 4)
              </label>

              {/* Show existing gallery images when editing */}
              {existingGalleryImages.length > 0 && (
                <div className="mb-3 space-y-2">
                  <p className="text-xs text-gray-600">
                    Current gallery images:
                  </p>
                  {existingGalleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-gray-100 rounded"
                    >
                      <img
                        src={img}
                        className="w-14 h-14 object-cover rounded"
                        alt={`Gallery ${idx + 1}`}
                      />
                      <span className="text-sm text-gray-600 flex-1">
                        Gallery {idx + 1}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 text-sm"
                        onClick={() => {
                          // Track this image for deletion from database
                          setImagesToDelete((prev) => [...prev, img]);
                          // Remove from UI
                          setExistingGalleryImages((prev) =>
                            prev.filter((_, i) => i !== idx),
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File inputs for new images */}
              <p className="text-xs text-gray-600 mb-2">Add new images:</p>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="border rounded p-2 w-full bg-white"
                    onChange={(e) => {
                      const newFiles = [...(galleryFiles || [])];
                      newFiles[index] = e.target.files?.[0] || null;
                      setGalleryFiles(newFiles);
                    }}
                  />
                </div>
              ))}
            </div>

            <select
              className="border rounded p-2 w-full mb-4"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            >
              <option value="">Tag(optional)</option>
              <option value="Bestseller">BestSeller</option>
              <option value="Featured">Featured</option>
            </select>

            <textarea
              placeholder="Description Line 2"
              className="border rounded p-2 w-full mb-3"
              value={form.description2}
              onChange={(e) =>
                setForm({ ...form, description2: e.target.value })
              }
            />

            <textarea
              placeholder="Description Line 3 "
              className="border rounded p-2 w-full mb-3 capitalize"
              value={form.description3}
              onChange={(e) =>
                setForm({ ...form, description3: e.target.value })
              }
            />

            <input
              placeholder="Discount (%)"
              type="number"
              className="border rounded p-2 w-full mb-3"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
            />

            <input
              placeholder="Serving Size (e.g. 1–2 people)"
              className="border rounded p-2 w-full mb-3"
              value={form.serving_size}
              onChange={(e) =>
                setForm({ ...form, serving_size: e.target.value })
              }
            />
            <input
              placeholder="Servings Per Container"
              className="border rounded p-2 w-full mb-3"
              value={form.servingsPerContainer}
              onChange={(e) =>
                setForm({ ...form, servingsPerContainer: e.target.value })
              }
            />

            <input
              placeholder="Calories"
              className="border rounded p-2 w-full mb-3"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
            />

            <input
              placeholder="Protein"
              className="border rounded p-2 w-full mb-3"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: e.target.value })}
            />
            <input
              placeholder="Total Fat (e.g. 5g)"
              className="border rounded p-2 w-full mb-3"
              value={form.totalFat}
              onChange={(e) => setForm({ ...form, totalFat: e.target.value })}
            />

            <input
              placeholder="Saturated Fat (e.g. 1g)"
              className="border rounded p-2 w-full mb-3"
              value={form.saturatedFat}
              onChange={(e) =>
                setForm({ ...form, saturatedFat: e.target.value })
              }
            />

            <input
              placeholder="Sodium (e.g. 120mg)"
              className="border rounded p-2 w-full mb-3"
              value={form.sodium}
              onChange={(e) => setForm({ ...form, sodium: e.target.value })}
            />

            <input
              placeholder="Total Carbohydrate (e.g. 15g)"
              className="border rounded p-2 w-full mb-3"
              value={form.totalCarbohydrate}
              onChange={(e) =>
                setForm({ ...form, totalCarbohydrate: e.target.value })
              }
            />

            <input
              placeholder="Dietary Fiber (e.g. 3g)"
              className="border rounded p-2 w-full mb-3"
              value={form.dietaryFiber}
              onChange={(e) =>
                setForm({ ...form, dietaryFiber: e.target.value })
              }
            />

            <textarea
              placeholder="Ingredients"
              className="border rounded p-2 w-full mb-3"
              value={form.ingredients}
              onChange={(e) =>
                setForm({ ...form, ingredients: e.target.value })
              }
            />

            <button
              onClick={submit}
              className="w-full bg-black text-white py-2 rounded-lg font-medium hover:opacity-90 cursor-pointer"
            >
              {editingId ? "Update Variant" : "Save Variant"}
            </button>
          </div>
        </div>
        {/* ================= LEFT : VARIANTS LIST ================= */}
        <div className="w-1/3 border rounded-xl p-6 overflow-y-auto bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">
              {productIdFilter ? "Product Variants" : "All Variants"}
            </h1>

            {productIdFilter && (
              <button
                onClick={() => router.push("/admin/variants")}
                className="text-sm text-blue-600 hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          {filteredVariants.length === 0 && (
            <p className="text-gray-500 text-center py-10">
              No variants found.
            </p>
          )}

          <div className="space-y-4 text-black">
            {filteredVariants.map((v) => (
              <div
                key={v.id}
                className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={v.image}
                    className="w-16 h-16 rounded object-cover bg-gray-100"
                  />

                  <div>
                    <p className="font-semibold capitalize">{v.name}</p>
                    {/* <p className="font-semibold">{v.description}</p> */}
                    {v.discount ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-400 line-through">
                          ₹ {getPriceFromSize(v)}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ₹{" "}
                          {getFinalPrice(
                            Number(getPriceFromSize(v)),
                            Number(v.discount),
                          )}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 rounded">
                          {v.discount}% OFF
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        ₹ {getPriceFromSize(v)}
                      </p>
                    )}

                    {v.tag && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        {v.tag}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(v)}
                    className="text-sm text-blue-600   cursor-pointer border rounded p-1"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      const isConfirmed = window.confirm(
                        "Are you sure you want to delete this variant?",
                      );
                      if (isConfirmed) {
                        deleteVariant(v.id);
                      }
                    }}
                    className="text-sm text-red-600  cursor-pointer border rounded p-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VariantsContent />
    </Suspense>
  );
}
