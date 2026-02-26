"use client";

import { useState } from "react";

type PipelineStep1 = {
  presignedUrl: string;
  cdnUrl: string;
};

type PipelineStep3 = {
  imageId: string;
};

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [captions, setCaptions] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const runPipeline = async () => {
    if (!file) return;

    setBusy(true);
    setStatus("Getting token...");
    setCaptions([]);

    try {
      // Step 0: get JWT token from our server
      const tokenRes = await fetch("/api/token");
      const tokenJson = await tokenRes.json();
      const token: string | null = tokenJson.token;

      if (!token) {
        setStatus("No token. Please login first.");
        setBusy(false);
        return;
      }

      // Step 1: Generate presigned upload URL
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
        const txt = await step1Res.text();
        throw new Error(`Step1 failed: ${txt}`);
      }

      const step1: PipelineStep1 = await step1Res.json();
      const { presignedUrl, cdnUrl } = step1;

      if (!presignedUrl || !cdnUrl) {
        throw new Error("Step1 response missing presignedUrl/cdnUrl");
      }

      // Step 2: Upload bytes to S3 via presignedUrl
      setStatus("Step 2/4: Uploading image to presigned URL...");
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!putRes.ok) {
        // presigned PUT may return empty body, so just throw status
        throw new Error(`Step2 PUT failed: ${putRes.status} ${putRes.statusText}`);
      }

      // Step 3: Register uploaded image URL
      setStatus("Step 3/4: Registering image URL...");
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
        const txt = await step3Res.text();
        throw new Error(`Step3 failed: ${txt}`);
      }

      const step3: PipelineStep3 = await step3Res.json();
      const imageId = step3.imageId;

      if (!imageId) {
        throw new Error("Step3 response missing imageId");
      }

      // Step 4: Generate captions
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
        const txt = await step4Res.text();
        throw new Error(`Step4 failed: ${txt}`);
      }

      const step4Json = await step4Res.json();

      // step4 response shape may vary; try common cases
      const produced =
        Array.isArray(step4Json) ? step4Json :
        Array.isArray(step4Json.captions) ? step4Json.captions :
        Array.isArray(step4Json.data) ? step4Json.data :
        [step4Json];

      setCaptions(produced);
      setStatus("Done ✅ Captions generated.");
    } catch (e: any) {
      console.error(e);
      setStatus(e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #333" }}>
      <h2 style={{ marginTop: 0 }}>Image → Captions Pipeline</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button disabled={!file || busy} onClick={runPipeline}>
          {busy ? "Working..." : "Upload & Generate Captions"}
        </button>
      </div>

      {status && <p style={{ marginTop: 12 }}>Status: {status}</p>}

      {captions.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3>Generated Captions</h3>
          <ul>
            {captions.map((c: any, i: number) => (
              <li key={c?.id ?? i}>
                {c?.content ?? c?.caption ?? c?.text ?? JSON.stringify(c)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}