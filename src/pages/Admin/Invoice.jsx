import { useState, useEffect, useRef } from "react";
import { FaPrint, FaDownload, FaSearch, FaFileInvoice } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Invoice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const invoiceIdFromUrl = searchParams.get("id") || "";
  const [invoiceId, setInvoiceId] = useState(invoiceIdFromUrl);
  const [invoiceData, setInvoiceData] = useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    if (invoiceIdFromUrl) {
      fetchInvoice(invoiceIdFromUrl);
    }
  }, [invoiceIdFromUrl]);

  const fetchInvoice = (id) => {
    if (id === "3453012") {
      setInvoiceData({
        id: "3453012",
        date: "Aug 13, 2022, 4:34PM",
        paymentNo: "4343434343",
        paymentDate: "Jul 09, 2022 - 12:20 PM",
        client: {
          name: "Andres Felipe Posada",
          address: "989 5th Avenue, City of Monterey, 55839, USA",
          email: "jonnydeff@gmail.com",
        },
        receiver: {
          name: "Juan Fernando Arias",
          address: "344 9th Avenue, San Francisco, 99383, USA",
          email: "juanfer@gmail.com",
        },
        items: [
          { description: "T-shirt blue, XXL size", quantity: 3, price: 60.0 },
          { description: "Winter jacket for men", quantity: 1, price: 20.0 },
          { description: "Jeans wear for men", quantity: 2, price: 18.0 },
        ],
        subtotal: 379.0,
        discount: 4.5,
        total: 312.0,
      });
    } else {
      setInvoiceData(null);
    }
  };

  const handleSearch = () => {
    if (!invoiceId.trim()) return;
    setSearchParams({ id: invoiceId });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const generatePDF = () => {
    const hiddenElements = document.querySelectorAll(".hidden-print");
    hiddenElements.forEach((el) => (el.style.display = "none"));

    const input = pdfRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice_${invoiceId}.pdf`);

      hiddenElements.forEach((el) => (el.style.display = ""));
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search Invoice ID..."
            className="border rounded-md px-4 py-2 w-64"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={handleSearch}
          >
            <FaSearch /> Search
          </button>
        </div>

        {/* Nếu chưa nhập ID, hiển thị icon Empty */}
        {!invoiceData && (
          <div className="flex flex-col items-center text-gray-400">
            <FaFileInvoice size={80} />
            <p className="mt-2">No Invoice Found</p>
          </div>
        )}

        {/* Nếu có dữ liệu, hiển thị hóa đơn */}
        {invoiceData && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl" ref={pdfRef}>
            <h1 className="text-3xl font-semibold">Invoice</h1>
            <p className="text-gray-500">Order ID: {invoiceData.id}</p>
            <div className="text-gray-600 border-b pb-3">📅 {invoiceData.date}</div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4 hidden-print">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                onClick={generatePDF}
              >
                <FaDownload /> Save PDF
              </button>
              <button className="bg-gray-500 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <FaPrint /> Print
              </button>
            </div>

            {/* Invoice Body */}
            <div className="border rounded-md p-6 bg-gray-50 mt-4">
              <p>
                Hi Steven Jobs, this is the receipt for a payment of{" "}
                <strong>${invoiceData.total} (USD)</strong> for your works.
              </p>

              <div className="grid grid-cols-2 mt-4">
                <div>
                  <h3 className="font-semibold">Payment No.</h3>
                  <p>{invoiceData.paymentNo}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Payment Date</h3>
                  <p>{invoiceData.paymentDate}</p>
                </div>
              </div>

              {/* Order Table */}
              <table className="w-full mt-6 border-t">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="p-3">Description</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr className="border-t" key={index}>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div></div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>{invoiceData.discount}%</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600 text-lg mt-2">
                    <span>Total:</span>
                    <span>${invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-400 mt-6">
              Copyright © 2022 - company name
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
