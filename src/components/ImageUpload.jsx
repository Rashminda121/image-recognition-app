import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";

export default function ImageUpload() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  // Validate file
  const validateFile = (file) => {
    if (!file) return false;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!validTypes.includes(file.type)) {
      setError("Only JPG, JPEG, and PNG files are allowed.");
      return false;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      return false;
    }

    setError("");
    return true;
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        // Remove "data:image/png;base64,"
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };

      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image selection
  const handleImageChange = async (file) => {
    if (!validateFile(file)) return;

    try {
      setImage(file);
      setFileName(file.name);
      setResponse(null);

      // Preview image
      const previewReader = new FileReader();

      previewReader.onloadend = () => {
        setPreview(previewReader.result);
      };

      previewReader.readAsDataURL(file);

      // Convert to base64
      const base64 = await convertToBase64(file);
      setImageBase64(base64);
    } catch (err) {
      setError("Failed to process image.");
    }
  };

  // Drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  // Upload image to API
  const uploadImage = async () => {
    if (!image || !imageBase64) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      // Payload to send
      const payload = {
        fileName: fileName,
        image: imageBase64,
      };

      const res = await fetch(process.env.REACT_APP_IMAGE_RECOGNITION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await res.json();

      setResponse(data);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Remove image
  const handleRemove = () => {
    setImage(null);
    setImageBase64("");
    setPreview(null);
    setFileName("");
    setResponse(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        {/* LEFT SECTION */}
        <div className="p-8 border-r border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800">
            AI Image Recognition
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Upload an image and detect labels using AI.
          </p>

          {!preview ? (
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
              ${
                dragActive
                  ? "border-slate-900 bg-slate-100"
                  : "border-slate-300 hover:border-slate-500 hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-slate-900 text-white p-5 rounded-full">
                  <Upload size={32} />
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-700">
                    Drag & Drop or Click to Upload
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    PNG, JPG or JPEG up to 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview */}
              <div className="relative overflow-hidden rounded-3xl shadow-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-[400px] object-cover"
                />

                <button
                  onClick={handleRemove}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-red-500 p-3 rounded-full shadow-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* File Info */}
              <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <ImageIcon className="text-slate-700" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Uploaded File</p>

                  <p className="font-medium text-slate-800">{fileName}</p>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={uploadImage}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          )}

          {/* Hidden Input */}
          <input
            type="file"
            hidden
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => handleImageChange(e.target.files[0])}
          />

          {/* Error */}
          {error && (
            <div className="mt-5 bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="p-8 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Detection Results
          </h2>

          {!response ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <Sparkles size={60} />

              <p className="mt-4 text-lg">
                Results will appear here after image analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Category */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Detected Category</p>

                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold capitalize text-slate-800">
                    {response.category}
                  </h3>

                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Success
                  </div>
                </div>
              </div>

              {/* Top Labels */}
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">
                  Top Labels
                </h3>

                <div className="space-y-4">
                  {response.topLabels?.map((label, index) => (
                    <div
                      key={index}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-700">
                          {label.name}
                        </span>

                        <span className="text-sm font-bold text-slate-500">
                          {label.confidence.toFixed(2)}%
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-700"
                          style={{
                            width: `${label.confidence}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Labels */}
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">
                  All Detected Labels
                </h3>

                <div className="flex flex-wrap gap-3">
                  {response.allLabels?.map((label, index) => (
                    <div
                      key={index}
                      className="bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-2"
                    >
                      <span className="font-medium text-slate-700">
                        {label.name}
                      </span>

                      <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded-full">
                        {label.confidence.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Response */}
              <div className="bg-slate-900 rounded-3xl p-5 overflow-auto">
                <p className="text-slate-300 mb-3 text-sm">API Raw Response</p>

                <pre className="text-green-400 text-xs whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
