import React, { useState } from "react";

export default function ImageTest() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [filename, setFilename] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      setStatus(text);

      // Optional: auto-fill filename for testing
      setFilename(file.name);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
    }
  };

  const handleLoadImage = () => {
    if (!filename) return;
    setImageUrl(`http://localhost:5000/image/${filename}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Image</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>

      <p>{status}</p>

      <hr />

      <h2>View Image</h2>
      <input
        type="text"
        placeholder="Enter filename"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
      />
      <button onClick={handleLoadImage}>Load Image</button>

      <div style={{ marginTop: "20px" }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview"
            style={{ maxWidth: "400px" }}
          />
        )}
      </div>
    </div>
  );
}