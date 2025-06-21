import { useEffect, useState } from "react";

const DeliveryInformation = ({ deliveryInfo, onDeliveryChange, onLocationChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [tempData, setTempData] = useState({ street: "", ward: "", district: "", province: "" });

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);
  const updateAddress = (newData) => {
    const { street, ward, district, province } = newData;
    if (street && ward && district && province) {
      const fullAddress = [street, ward, district, province].filter(Boolean).join(", ");
      onDeliveryChange("address", fullAddress);
      
      if (onLocationChange) {
        onLocationChange({ ward, district, province });
      }
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setWards([]);
    
    const province = provinces.find((p) => p.code === Number(provinceCode));
    setDistricts(province ? province.districts : []);

    const newData = { ...tempData, province: province?.name || "" };
    setTempData(newData);
    updateAddress(newData);
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);

    const district = districts.find((d) => d.code === Number(districtCode));
    setWards(district ? district.wards : []);

    const newData = { ...tempData, district: district?.name || "" };
    setTempData(newData);
    updateAddress(newData);
  };
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const ward = wards.find((w) => w.code === Number(wardCode))?.name || "";
    onDeliveryChange("ward", ward);
    onDeliveryChange("wardCode", wardCode);
    const newData = { ...tempData, ward };
    setTempData(newData);
    updateAddress(newData);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onDeliveryChange(name, value);
    
    if (name === "street") {
      const newData = { ...tempData, street: value };
      setTempData(newData);
      updateAddress(newData);
    } else if (name === "postalCode") {
      // Just pass the postal code value to the parent component
      // No need to update the address string with the postal code
      onDeliveryChange("postalCode", value);
    }
  };

  return (
    <div>
      <h2 className="text-lg border-b pb-2 text-[#171717]">Your Information</h2>
      <form className="space-y-4">
        {/* Full Name */}
        <input
          type="text"
          name="name"
          value={deliveryInfo.name || ""}
          onChange={handleInputChange}
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          value={deliveryInfo.email || ""}
          onChange={handleInputChange}
          placeholder="Email"
          className="w-full p-3 border rounded-lg"
        />

        {/* Phone Number */}
        <input
          type="text"
          name="phoneNumber"
          value={deliveryInfo.phoneNumber || ""}
          onChange={handleInputChange}
          placeholder="Phone Number"
          className="w-full p-3 border rounded-lg"
        />

        {/* Province Select */}
        <select className="w-full p-3 border rounded-lg" value={selectedProvince} onChange={handleProvinceChange}>
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>

        {/* District Select */}
        <select className="w-full p-3 border rounded-lg" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince}>
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>        {/* Ward Select */}
        <select className="w-full p-3 border rounded-lg" value={deliveryInfo.wardCode || ""} onChange={handleWardChange} disabled={!selectedDistrict}>
          <option value="">Select Ward</option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>      {/* Street Address */}
        <input
          type="text"
          name="street"
          value={deliveryInfo.street || ""}
          onChange={handleInputChange}
          placeholder="Street"
          className="w-full p-3 border rounded-lg"
        />

        {/* Postal Code */}
        <input
          type="text"
          name="postalCode"
          value={deliveryInfo.postalCode || ""}
          onChange={handleInputChange}
          placeholder="Postal Code"
          className="w-full p-3 border rounded-lg"
        />
      </form>
    </div>
  );
};

export default DeliveryInformation;
