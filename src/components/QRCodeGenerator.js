import React, { useState } from "react";
import { QRCode } from "react-qrcode-logo";

const QRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrCodeURL, setQRCodeURL] = useState("");
  const [width, setWidth] = useState(256);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [qrStyle, setQrStyle] = useState("squares");
  const [eyeColor, setEyeColor] = useState("#000000");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [fgColor, setFgColor] = useState("#000000");

  const handleGenerateQRCode = () => {
    if (!text) {
      alert("Please enter text or a URL");
      return;
    }

    setQRCodeURL(
      <QRCode
        qrStyle={qrStyle}
        value={text}
        size={width}
        logoImage={logoFile ? URL.createObjectURL(logoFile) : null}
        logoWidth={logoFile ? width / 4 : undefined}
        fgColor={fgColor}
        bgColor={bgColor}
        eyeColor={eyeColor}
        removeQrCodeBehindLogo={true}
        logoPadding={1}
      />
    );
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qrcode.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-700">
        QR Code Generator
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <div className="mb-4">
          <label
            htmlFor="qrText"
            className="block text-sm font-medium text-gray-700"
          >
            Enter Text or URL
          </label>
          <input
            id="qrText"
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or URL"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="qrWidth"
            className="block text-sm font-medium text-gray-700"
          >
            QR Code Size
          </label>
          <select
            id="qrWidth"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value={16}>16</option>
            <option value={32}>32</option>
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
            <option value={512}>512</option>
            <option value={1024}>1024</option>
            <option value={2048}>2048</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="qrStyle"
            className="block text-sm font-medium text-gray-700"
          >
            QR Code Style
          </label>
          <select
            id="qrStyle"
            value={qrStyle}
            onChange={(e) => setQrStyle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="squares">Squares</option>
            <option value="dots">Dots</option>
            <option value="fluid">Fluid</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="bgColor"
            className="block text-sm font-medium text-gray-700"
          >
            Background Color
          </label>
          <input
            id="bgColor"
            type="color"
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="eyeColor"
            className="block text-sm font-medium text-gray-700"
          >
            Eye Color (Positional Patterns)
          </label>
          <input
            id="eyeColor"
            type="color"
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={eyeColor}
            onChange={(e) => setEyeColor(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="fgColor"
            className="block text-sm font-medium text-gray-700"
          >
            Select QR Code Color
          </label>
          <input
            id="fgColor"
            type="color"
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="qrLogo"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Logo (optional)
          </label>
          <input
            id="qrLogo"
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
            onChange={handleLogoUpload}
          />
          {logoPreview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Logo Preview:</p>
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="max-w-20 h-auto border border-gray-300 rounded-md shadow-sm"
              />
              <button
                className="mt-2 bg-red-500 text-white py-1 px-3 rounded-md shadow-sm hover:bg-red-600"
                onClick={handleRemoveLogo}
              >
                Remove Logo
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerateQRCode}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 transition-all duration-300"
        >
          Generate QR Code
        </button>

        {qrCodeURL && (
          <div className="mt-6 text-center">
            <div>{qrCodeURL}</div>
            <button
              onClick={handleDownload}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md shadow hover:bg-green-600 transition-all duration-300"
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
