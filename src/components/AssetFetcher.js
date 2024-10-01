import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";

const AssetFetcher = () => {
  const [url, setUrl] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAssets([]);

    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" +
        "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" +
        "(\\#[-a-zA-Z\\d_]*)?$",
      "i"
    );

    if (!urlPattern.test(url)) {
      setError("Please enter a valid URL.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/fetch-media-assets`,
        { params: { url } }
      );
      setAssets(response.data.mediaAssets);
    } catch (err) {
      setError("Failed to fetch assets from the URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-700">Assets Fetcher</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block text-lg font-medium text-gray-700">
          Enter a webpage URL:
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          placeholder="https://example.com"
        />
        {error && (
          <p className="mt-2 text-red-600 flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
          </p>
        )}
        <p className="text-sm text-gray-600 mb-2">
          Please note: Not all URLs will work, as some websites may block access
          due to privacy policies or security reasons.
        </p>
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Fetch Assets
        </button>
      </form>

      {loading && (
        <div className="flex justify-center my-6">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="3x"
            className="text-blue-500"
          />
        </div>
      )}

      {!loading && assets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {assets.map((asset, index) => (
            <div
              key={index}
              className="border rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => window.open(asset, "_blank")}
            >
              <div className="p-4 flex justify-center items-center">
                <img
                  src={asset}
                  alt={`Asset ${index + 1}`}
                  className="max-h-48 object-contain"
                />
              </div>
              <div className="p-2 bg-gray-100 text-center">
                <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
                Open Asset
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && assets.length === 0 && error === "" && (
        <p className="text-center text-gray-500">
          No assets found for this URL.
        </p>
      )}
    </div>
  );
};

export default AssetFetcher;
