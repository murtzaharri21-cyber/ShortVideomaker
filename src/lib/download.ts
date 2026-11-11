export async function downloadClip(
  id: string,
  mode: "captioned" | "original",
  options: { resolution?: string; font?: string } = {},
) {
  const search = new URLSearchParams({ mode });
  if (options.resolution) search.set("resolution", options.resolution);
  if (options.font) search.set("font", options.font);
  const response = await fetch(`/api/clips/${id}/download?${search.toString()}`);
  const type = response.headers.get("content-type") || "";
  if (!response.ok) {
    if (type.includes("application/json")) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error || "Download failed.");
    }
    throw new Error("Download failed.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const header = response.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/.exec(header);
  link.href = url;
  link.download = match?.[1] || `voltcut-${mode}.mp4`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadFullVideo(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/download`);
  const type = response.headers.get("content-type") || "";
  if (!response.ok) {
    if (type.includes("application/json")) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error || "Download failed.");
    }
    throw new Error("Download failed.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const header = response.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/.exec(header);
  link.href = url;
  link.download = match?.[1] || `voltcut-full-video.mp4`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
