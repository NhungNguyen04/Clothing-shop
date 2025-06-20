import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const DeliveryInformation = ({ deliveryInfo, onDeliveryChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [tempData, setTempData] = useState({ street: "", ward: "", district: "", province: "" });

  useEffect(() => {
    axiosInstance.get("https://provinces.open-api.vn/api/?depth=3")
      .then((response) => setProvinces(response.data));
  }, []);

  const updateAddress = (newData) => {
    const { street, ward, district, province } = newData;
    if (street && ward && district && province) {
      const fullAddress = [street, ward, district, province].filter(Boolean).join(", ");
      onDeliveryChange("address", fullAddress);
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
    const ward = wards.find((w) => w.code === Number(e.target.value))?.name || "";
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
    }
  };

  return (
    <div>
      <h2 className="text-lg border-b pb-2 text-[#171717]">Your Information</h2>
      <form className="space-y-4">

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
        </select>

        {/* Ward Select */}
        <select className="w-full p-3 border rounded-lg" value={deliveryInfo.ward || ""} onChange={handleWardChange} disabled={!selectedDistrict}>
          <option value="">Select Ward</option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>

        {/* Street Address */}
        <input
          type="text"
          name="street"
          value={deliveryInfo.street || ""}
          onChange={handleInputChange}
          placeholder="Street"
          className="w-full p-3 border rounded-lg"
        />
      </form>
    </div>
  );
};

export default DeliveryInformation;
