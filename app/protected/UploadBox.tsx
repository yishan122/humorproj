"use client";

import { useState } from "react";

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setStatus("Getting token...");
    setCaptions([]);

    try {
      //get JWT token from server
      const tokenRes = await fetch("/api/token");
      const { token } = await tokenRes.json();

      if (!token) {
        throw new Error("Not logged in");
      }

      //Generate presigned URL
      setStatus("Step 1/4: Generating presigned URL...");

      const step1Res = await fetch(
        "https://api.almostcrackd.ai/pipeline/generate-presigned-url",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        }
      );

      if (!step1Res.ok) {
        throw new Error(await step1Res.text());
      }

      const { presignedUrl, cdnUrl } = await step1Res.json();

      //Upload image to presigned URL
      setStatus("Step 2/4: Uploading image...");

      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("Upload failed");
      }

      // Preview image immediately
      setImageUrl(cdnUrl);

      //Register image URL
      setStatus("Step 3/4: Registering image...");

      const step3Res = await fetch(
        "https://api.almostcrackd.ai/pipeline/upload-image-from-url",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: cdnUrl,
            isCommonUse: false,
          }),
        }
      );

      if (!step3Res.ok) {
        throw new Error(await step3Res.text());
      }

      const { imageId } = await step3Res.json();

      // Generate captions
      setStatus("Step 4/4: Generating captions...");

      const step4Res = await fetch(
        "https://api.almostcrackd.ai/pipeline/generate-captions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageId }),
        }
      );

      if (!step4Res.ok) {
        throw new Error(await step4Res.text());
      }

      const step4Json = await step4Res.json();

      // API may return array or object
      const result =
        Array.isArray(step4Json)
          ? step4Json
          : step4Json.captions ?? [];

      const captionTexts = result.map(
        (c: any) => c.content ?? c.caption ?? JSON.stringify(c)
      );

      setCaptions(captionTexts);
      setStatus("Done ✅ Captions generated.");
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 24, border: "1px solid #333", padding: 16 }}>
      <h2>Image → Captions Pipeline</h2>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            setCaptions([]);
            setStatus("");
            if (f) {
              setImageUrl(URL.createObjectURL(f)); // local preview
            }
          }}
        />

        <button
          disabled={!file || loading}
          onClick={handleUpload}
        >
          {loading ? "Working..." : "Upload & Generate Captions"}
        </button>
      </div>

      {status && (
        <div style={{ marginTop: 12 }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      {/* 🔥 Image Preview */}
      {imageUrl && (
        <div style={{ marginTop: 16 }}>
          <h3>Preview</h3>
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: 300,
              border: "1px solid #333",
            }}
          />
        </div>
      )}

      {/* 🔥 Captions */}
      {captions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Generated Captions</h3>
          {captions.map((text, i) => (
            <div key={i}>{text}</div>
          ))}
        </div>
      )}
    </div>
  );
}