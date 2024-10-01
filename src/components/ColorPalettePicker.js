import React, { useState } from "react";
import { ChromePicker } from "react-color";
import { motion } from "framer-motion";

const ColorPalettePicker = () => {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hexToRgb = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const fetchPalette = async (colorInput) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch three different palettes from the API
      const responses = await Promise.all([
        fetch("http://localhost:5000/color-picker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: colorInput, model: "default" }),
        }),
        fetch("http://localhost:5000/color-picker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: colorInput, model: "default" }),
        }),
        fetch("http://localhost:5000/color-picker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: colorInput, model: "default" }),
        }),
      ]);

      // Collect all results from the responses
      const results = await Promise.all(responses.map((res) => res.json()));
      const allPalettes = results.map((data) => data.result || []);
      setPalettes(allPalettes);
    } catch (err) {
      console.error("Error fetching color palette:", err);
      setError("Failed to fetch color palette. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
  };

  const generatePalette = () => {
    const rgb = hexToRgb(selectedColor);
    const colorInput = [[rgb[0], rgb[1], rgb[2]], "N", "N", "N", "N"];
    fetchPalette(colorInput);
  };

  const copyRowToClipboard = (row) => {
    const rowColors = row.map((color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`).join(", ");
    navigator.clipboard.writeText(rowColors);
    alert(`Copied colors: ${rowColors}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.h1
        className="text-5xl font-bold mb-8 text-transparent bg-clip-text"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{
          backgroundImage: "linear-gradient(90deg, #ff007f, #ffdd00, #00ff7f, #007fff, #ff007f)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Color Palette Generator
      </motion.h1>

      <div className="w-full max-w-md mb-8">
        <ChromePicker color={selectedColor} onChange={handleColorChange} width="100%" />
      </div>

      <button
        className="bg-indigo-600 text-white px-8 py-3 rounded-md mb-8 hover:bg-indigo-700 transition focus:outline-none shadow-lg"
        onClick={generatePalette}
      >
        Generate Palette
      </button>

      {loading && (
        <div className="text-lg font-medium text-indigo-600">
          Fetching palette...
        </div>
      )}

      {error && <div className="text-red-500 font-medium">{error}</div>}

      {palettes.length > 0 && (
        <motion.div
          className="p-6 rounded-lg shadow-xl bg-white mt-8 w-full max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {palettes.map((palette, rowIndex) => (
            <div key={rowIndex} className="mb-4">
              <div className="grid grid-cols-4 gap-0">
                {/* First color is always the selected color */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-full h-24"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <div className="text-sm text-center mt-2">{selectedColor}</div>
                </div>
                {/* Next 3 colors come from the API */}
                {palette.slice(0, 3).map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-full h-24"
                      style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                    ></div>
                    <div className="text-sm text-center mt-2">{`rgb(${color[0]}, ${color[1]}, ${color[2]})`}</div>
                  </div>
                ))}
              </div>
              <button
                className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition mt-4"
                onClick={() =>
                  copyRowToClipboard([[...hexToRgb(selectedColor)], ...palette.slice(0, 3)])
                }
              >
                Copy Row Colors
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ColorPalettePicker;
