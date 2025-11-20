"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadResult {
  success: boolean;
  message: string;
  summary?: {
    totalHorses: number;
    totalImages: number;
    successful: number;
    failed: number;
  };
  results?: {
    success: Array<{ stable: string; horse: string; images: number }>;
    errors: Array<{ stable: string; horse: string; error: string }>;
  };
}

export default function UploadHorsesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jsonData, setJsonData] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  if (status === "loading") {
    return <div className="container py-8">Loading...</div>;
  }

  if (!session || (session.user.role !== "admin" && session.user.role !== "stable_owner")) {
    router.push("/dashboard");
    return null;
  }

  const exampleJson = `[
  {
    "stableName": "Beit Zeina",
    "horses": [
      {
        "name": "Thunder",
        "description": "Beautiful black stallion, very gentle and perfect for beginners.",
        "pricePerHour": 500,
        "age": 8,
        "skills": ["Beginner-friendly", "Calm", "Well-trained"],
        "imageUrls": [
          "https://drive.google.com/uc?id=YOUR_FILE_ID_1",
          "https://drive.google.com/uc?id=YOUR_FILE_ID_2"
        ]
      }
    ]
  }
]`;

  async function handleUpload() {
    if (!jsonData.trim()) {
      setError("Please paste your JSON data");
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      // Parse JSON to validate
      const parsed = JSON.parse(jsonData);

      // Upload to API
      const response = await fetch("/api/admin/upload-horses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed),
      });

      const data: UploadResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setResult(data);
      setJsonData(""); // Clear form on success
    } catch (err: any) {
      setError(err.message || "Failed to upload horses. Please check your JSON format.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }

  function loadExample() {
    setJsonData(exampleJson);
    setError(null);
    setResult(null);
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Horses</CardTitle>
          <CardDescription>
            Upload multiple horses with images from Google Drive. Paste your JSON data below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <p className="font-semibold">📋 Quick Guide:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Get Google Drive image URLs (see guide below)</li>
              <li>Paste your JSON data in the textarea</li>
              <li>Click "Upload Horses"</li>
            </ol>
            <p className="mt-3 font-semibold">🔗 Getting Google Drive URLs:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Right-click image in Google Drive → "Get link"</li>
              <li>Set to "Anyone with the link can view"</li>
              <li>Copy link: <code className="bg-background px-1 rounded">https://drive.google.com/file/d/FILE_ID/view</code></li>
              <li>Convert to: <code className="bg-background px-1 rounded">https://drive.google.com/uc?id=FILE_ID</code></li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              onClick={loadExample}
              className="mt-2"
            >
              Load Example Format
            </Button>
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste JSON Data:</label>
            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your horses JSON data here..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive font-medium">Error:</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 space-y-3">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                ✅ {result.message}
              </p>
              {result.summary && (
                <div className="text-sm space-y-1">
                  <p>📊 Summary:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Total Horses: {result.summary.totalHorses}</li>
                    <li>Total Images: {result.summary.totalImages}</li>
                    <li>Successful: {result.summary.successful}</li>
                    {result.summary.failed > 0 && (
                      <li className="text-destructive">Failed: {result.summary.failed}</li>
                    )}
                  </ul>
                </div>
              )}
              {result.results && (
                <div className="text-sm space-y-2 max-h-[200px] overflow-y-auto">
                  {result.results.success.length > 0 && (
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">✅ Success:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        {result.results.success.map((item, idx) => (
                          <li key={idx}>
                            {item.stable} → {item.horse} ({item.images} images)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.results.errors.length > 0 && (
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-200">❌ Errors:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        {result.results.errors.map((item, idx) => (
                          <li key={idx}>
                            {item.stable} → {item.horse}: {item.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || !jsonData.trim()}
            className="w-full"
            size="lg"
          >
            {isUploading ? "Uploading..." : "🚀 Upload Horses"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

