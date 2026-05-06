import React, { useState, useRef } from "react";
import "./ImageUpload.css";

export default function ImageUpload() {
  const [image, setImage] = useState(null);
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

  // Handle file selection
  const handleImageChange = (file) => {
    if (!validateFile(file)) return;

    setImage(file);
    setFileName(file.name);
    setResponse(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  // Upload to API
  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      // 👉 Replace with your real API
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove image
  const handleRemove = () => {
    setImage(null);
    setPreview(null);
    setFileName("");
    setResponse(null);
    setError("");
  };

  return (
    <div className="upload-container">
      {!preview ? (
        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <p>Drag & Drop or Click to Upload</p>
          <span>PNG, JPG up to 5MB</span>
        </div>
      ) : (
        <div className="preview-box">
          <img src={preview} alt="preview" />

          {/* File name */}
          <p style={{ marginTop: "8px", fontSize: "14px" }}>
            📄 {fileName}
          </p>

          {/* Buttons */}
          <div style={{ marginTop: "10px" }}>
            <button onClick={uploadImage} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>

            <button
              onClick={handleRemove}
              style={{ marginLeft: "10px", background: "#6b7280" }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={(e) => handleImageChange(e.target.files[0])}
      />

      {/* Error */}
      {error && (
        <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
          {error}
        </p>
      )}

      {/* API Response */}
      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            maxWidth: "400px",
            background: "#f9fafb",
          }}
        >
          <h4>Response:</h4>
          <pre style={{ fontSize: "12px", overflowX: "auto" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}