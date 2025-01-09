export async function POST(req) {
  try {
    const body = await req.json();
    const gcpPoints = body.gcpPoints;

    if (!Array.isArray(gcpPoints) || gcpPoints.length === 0) {
      return new Response(JSON.stringify({ message: "Invalid GCP points format." }), { status: 400 });
    }

    const txtContent = gcpPoints
      .map((point) => `${point.name}, ${point.lat}, ${point.lng}`)
      .join('\n');

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
    const fileName = `gcp_points_${timestamp}.txt`;

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
