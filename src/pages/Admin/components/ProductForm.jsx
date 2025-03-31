import PropTypes from "prop-types";
import { useForm, useWatch  } from "react-hook-form";
import { useState, useEffect } from "react";
import { FaCamera, FaImage } from "react-icons/fa";

const categories = {
  men: ["topwear", "bottomwear", "winterwear"],
  women: ["topwear", "bottomwear", "winterwear"],
  kids: ["topwear", "bottomwear", "winterwear"],
};

const sizes = ["S", "M", "L", "XL", "XXL"];

const ProductForm = ({ isOpen, setIsOpen, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm();

  const [mainImage, setMainImage] = useState(initialData?.image?.[0] ?? null);
  const [subImages, setSubImages] = useState(() => {
    const images = initialData?.image?.slice(1, 5) ?? [];
    return images.concat(Array(4 - images.length).fill(null));
  });
  const [sizeStock, setSizeStock] = useState(() => {
    return initialData.stockSize?.reduce((acc, item) => {
      acc[item.size] = item.quantity;
      return acc;
    }, {}) || {};
  });
  const selectedSizes = useWatch({
    control,
    name: "sizes",
    defaultValue: Object.keys(sizeStock),
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setValue("name", initialData.name || "");
      setValue("price", parseFloat(initialData.price.replace(/[^0-9.]/g, "")) || "");
      setValue("description", initialData.description || "");
      setValue("category", initialData.category || "");
      setValue("subCategory", initialData.subCategory || "");
    }
  }, [initialData, setValue]);

  useEffect(() => {
    if (selectedCategory) {
      setValue("subCategory", categories[selectedCategory]?.[0] || "");
    } else {
      setValue("subCategory", "");
    }
  }, [selectedCategory, setValue]);

  useEffect(() => {
    setSizeStock((prevSizeStock) => {
      const newSizeStock = {};
      let isChanged = false;

      selectedSizes.forEach((size) => {
        newSizeStock[size] = prevSizeStock[size] || 0;
        if (newSizeStock[size] !== prevSizeStock[size]) {
          isChanged = true;
        }
      });

      return isChanged ? newSizeStock : prevSizeStock;
    });
  }, [selectedSizes]);

  const handleMainImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result);
        setValue("mainImage", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSubImages = [...subImages];
        newSubImages[index] = reader.result;
        setSubImages(newSubImages);
        setValue(`subImages[${index}]`, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStockChange = (size, value) => {
    setSizeStock({ ...sizeStock, [size]: parseInt(value) || 0 });
  };

  const onSubmitHandler = (data) => {
    onSubmit({ ...data, sizeStock });
    setIsOpen(false);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[40rem] max-h-[80vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Product</h3>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="flex justify-center">
            <label className="cursor-pointer relative">
              <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} />
              {mainImage ? (
                <img src={mainImage} alt="Main" className="w-48 h-48 object-cover rounded-lg border" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center border rounded-lg bg-gray-200">
                  <FaCamera size={50} className="text-gray-500" />
                </div>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" placeholder="Product Name" {...register("name", { required: "Required" })} className="w-full p-2 border rounded" />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <input type="number" placeholder="Price" {...register("price", { required: "Required", min: 1 })} className="w-full p-2 border rounded" />
              {errors.price && <p className="text-red-500">{errors.price.message}</p>}
            </div>
          </div>

          <textarea placeholder="Description" {...register("description")} className="w-full p-2 border rounded"></textarea>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Category</label>
              <select {...register("category", { required: "Required" })} className="w-full p-2 border rounded">
                <option value="">Select Category</option>
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block font-medium">Sub-Category</label>
              <select {...register("subCategory", { required: "Required" })} className="w-full p-2 border rounded">
                <option value="">Select Sub-Category</option>
                {categories[watch("category")]?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subCategory && <p className="text-red-500">{errors.subCategory.message}</p>}
            </div>
          </div>

          <div>
            <label className="font-medium">Available Sizes:</label>
            <div className="flex space-x-2 mt-2">
              {sizes.map((size) => (
                <label key={size} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("sizes")}
                    value={size}
                    defaultChecked={!!sizeStock[size]}
                    className="w-4 h-4"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedSizes.length > 0 && (
            <div>
              <h4 className="font-medium mt-4">Stock Size Allocation:</h4>
              <div className="grid grid-cols-3 gap-2">
                {selectedSizes.map((size) => (
                  <div key={size}>
                    <label className="block text-sm">{size}:</label>
                    <input
                      type="number"
                      min="0"
                      value={sizeStock[size] || ""}
                      onChange={(e) => handleStockChange(size, e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            {subImages.map((subImage, index) => (
              <label key={index} className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleSubImageUpload(event, index)} />
                {subImage ? (
                  <img src={subImage} alt={`Sub ${index}`} className="w-24 h-24 object-cover rounded-lg border" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center border rounded-lg bg-gray-200">
                    <FaImage size={30} className="text-gray-500" />
                  </div>
                )}
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsOpen(false)}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProductForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object.isRequired,
};

export default ProductForm;
