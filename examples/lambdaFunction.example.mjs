import {
  RekognitionClient,
  DetectLabelsCommand,
} from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({ region: "ap-southeast-1" });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Replace with the frontend application's URL
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: "",
      };
    }

    const body = JSON.parse(event.body || "{}");

    const base64Image = body.image;

    const imageBuffer = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );

    const command = new DetectLabelsCommand({
      Image: { Bytes: imageBuffer },
      MaxLabels: 10,
      MinConfidence: 70,
    });

    const result = await client.send(command);

    const labels = result.Labels || [];

    if (labels.length === 0) {
      return response("unknown", [], "No labels detected");
    }

    // Sort by confidence
    const sorted = labels.sort((a, b) => b.Confidence - a.Confidence);

    const topLabels = sorted.slice(0, 3);

    // Try to infer category dynamically
    const category = inferCategory(topLabels);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Image analyzed successfully",
        category: category,
        topLabels: topLabels.map((l) => ({
          name: l.Name,
          confidence: l.Confidence,
        })),
        allLabels: labels.map((l) => ({
          name: l.Name,
          confidence: l.Confidence,
        })),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Error processing image",
        error: error.message,
      }),
    };
  }
};

// Fully dynamic inference (no hardcoding specific objects like cat/dog)
function inferCategory(labels) {
  const names = labels.map((l) => l.Name.toLowerCase());

  const hasAnimalContext = names.some(
    (n) =>
      n.includes("animal") ||
      n.includes("mammal") ||
      n.includes("bird") ||
      n.includes("wildlife") ||
      n.includes("pet"),
  );

  const hasFoodContext = names.some(
    (n) =>
      n.includes("food") ||
      n.includes("dish") ||
      n.includes("fruit") ||
      n.includes("vegetable"),
  );

  const hasHumanContext = names.some(
    (n) => n.includes("person") || n.includes("human") || n.includes("face"),
  );

  const hasVehicleContext = names.some(
    (n) =>
      n.includes("vehicle") || n.includes("car") || n.includes("transport"),
  );

  if (hasAnimalContext) return "animal";
  if (hasFoodContext) return "food";
  if (hasHumanContext) return "human";
  if (hasVehicleContext) return "vehicle";

  // fallback
  return "other";
}

// helper response (optional reuse)
function response(category, labels, message) {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      message,
      category,
      labels,
    }),
  };
}
