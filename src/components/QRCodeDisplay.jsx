"use client";

import QRCode from "react-qr-code";

export default function QRCodeDisplay({ value }) {
  return (
    <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-gray-100">
      <QRCode 
        value={value} 
        size={150} // Ukuran QR Code dalam pixel
        level="H" // Error correction level High (tetap bisa discan meski agak buram)
      />
    </div>
  );
}