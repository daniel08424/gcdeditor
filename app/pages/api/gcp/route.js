export async function POST(req) {
  try {
    // Read JSON body
    const body = await req.json();
    const gcpPoints = body.gcpPoints; // Get the array directly

    if (!Array.isArray(gcpPoints) || gcpPoints.length === 0) {
      return new Response(JSON.stringify({ message: "Invalid GCP points format." }), { status: 400 });
    }

    // Convert GCP points to TXT format
    const txtContent = gcpPoints
      .map((point) => `${point.name}, ${point.lat}, ${point.lng}`)
      .join('\n');

    // ✅ Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
    const fileName = `gcp_points_${timestamp}.txt`;


    // ✅ Return file for download with correct headers
    return new Response(txtContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename=${fileName}`,
      },
    });

  } catch (error) {
    console.error("Error writing file:", error);
    return new Response(JSON.stringify({ message: "Error exporting GCP points." }), { status: 500 });
  }
}
