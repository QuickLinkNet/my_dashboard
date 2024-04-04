import "dotenv/config";
import { Midjourney } from "../../.";

async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.Connect();

  const prompts = [
      "A digital portrait of a woman's face, emerging from an explosion of abstract colors on the left side, The face blends realism with surreal elements, capturing a moment of creative explosion, set against a clean White Space on the right for bold artistic expression",
      "An abstract rendering of a woman's head, artistically composed on the right side, featuring vibrant swirls and geometric shapes, The artwork conveys the complexity and beauty of the female mind, balanced with ample White Space on the left for a modern look",
      "A futuristic depiction of a woman's face, merging with digital data streams on the left side, The face is a blend of human features and cybernetic elements, illustrating the fusion of humanity with AI, complemented by White Space on the right for a cyber-art theme",
      "An artistic explosion emanating from a woman's head, illustrated on the right side, symbolizing a burst of creativity and ideas, The head is surrounded by abstract patterns and bright colors, showcasing artistic freedom, paired with White Space on the left for text",
      "A surreal woman's face composed of vibrant paint strokes on the left side, The face emerges from a canvas of chaos, representing the raw emotion and power of artistic expression, flanked by White Space on the right for a stark contrast",
      "A digital artwork showcasing a woman's head as a galaxy of stars on the right side, The head symbolizes the universe within, a space filled with endless creativity and imagination, surrounded by White Space on the left for cosmic contemplation",
      "An abstract woman's face fragmented into digital pixels on the left side, representing the intersection of identity and technology, The fragmented face merges traditional portraiture with digital abstraction, set against a backdrop of White Space on the right for a techno-artistic narrative",
      "A woman's face enveloped in a neon light show, artistically positioned on the right side, The neon lights weave through her features, illuminating her expression with vibrant energy, juxtaposed with White Space on the left for an electrifying presentation",
      "An AI-interpreted portrait of a woman's face, merging with an abstract digital landscape on the left side, The portrait blurs the lines between reality and digital art, creating a unique fusion of form and technology, flanked by White Space on the right for an avant-garde look",
      "A woman's head transforming into a cascade of digital art elements on the right side, The transformation symbolizes the evolution of art and identity in the digital age, surrounded by White Space on the left for a narrative of growth and change",
  ];

  for (const prompt of prompts) {
    for (let i = 0; i < 10; i++) { // Jeden Prompt 10 Mal durchlaufen
      const Imagine = await client.Imagine(
        prompt + ' --ar 16:9',
        (uri: string, progress: string) => {
          console.log("Imagine.loading", uri, "progress", progress);
        }
      );
      console.log({ Imagine });
      if (!Imagine) {
        continue;
      }

      // Beachten Sie, dass Reroll, Variation und Upscale spezifische Aktionen sind.
      // Wenn Sie diese für jedes Bild wiederholen möchten, müssen die folgenden Aufrufe innerhalb dieser Schleife bleiben.
      // Beispiel für Reroll (Sie können ähnliche Schritte für Variation und Upscale hinzufügen)
      const reroll = await client.Reroll({
        msgId: <string>Imagine.id,
        hash: <string>Imagine.hash,
        flags: Imagine.flags,
        loading: (uri: string, progress: string) => {
          console.log("Reroll.loading", uri, "progress", progress);
        },
      });
      console.log({ reroll });
    }
  }

  client.Close();
}

main()
  .then(() => {
    // console.log("finished");
  })
  .catch((err) => {
    console.log("finished");
    console.error(err);
    process.exit(1);
  });
