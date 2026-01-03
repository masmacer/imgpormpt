import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - imageprompt",
  description: "Learn more about imageprompt and our mission to transform images into better AI prompts.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">About imageprompt</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Transforming the way you create AI prompts from images
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>Our Mission</h2>
          <p>
            At imageprompt, we believe that every image has a story to tell. Our mission is to help creators, 
            artists, and AI enthusiasts unlock the full potential of their visual content by generating 
            compelling and accurate AI prompts.
          </p>

          <h2>What We Do</h2>
          <p>
            Our advanced AI technology analyzes your images and generates detailed, contextual prompts that 
            can be used with various AI art generation tools like Stable Diffusion, Midjourney, Flux, 
            and more. Whether you're looking to:
          </p>
          <ul>
            <li>Recreate similar artwork with AI tools</li>
            <li>Understand the visual elements in your images</li>
            <li>Generate inspiration for new creative projects</li>
            <li>Learn about AI prompt engineering</li>
          </ul>
          <p>
            imageprompt makes the process simple, fast, and accurate.
          </p>

          <h2>Our Technology</h2>
          <p>
            We leverage cutting-edge computer vision and natural language processing technologies to 
            analyze images and generate high-quality prompts. Our system understands:
          </p>
          <ul>
            <li>Visual composition and artistic style</li>
            <li>Colors, lighting, and mood</li>
            <li>Objects, people, and scenes</li>
            <li>Artistic techniques and mediums</li>
          </ul>

          <h2>Why Choose imageprompt?</h2>
          <ul>
            <li><strong>Accuracy:</strong> Our AI generates precise and detailed prompts</li>
            <li><strong>Speed:</strong> Get results in seconds, not minutes</li>
            <li><strong>Versatility:</strong> Works with multiple AI art platforms</li>
            <li><strong>Privacy:</strong> Your images are processed securely and not stored</li>
          </ul>

          <h2>Get Started</h2>
          <p>
            Ready to transform your images into powerful AI prompts? 
            <a href="/" className="text-primary hover:underline"> Try imageprompt today</a> and 
            discover the stories your images are waiting to tell.
          </p>
        </div>
      </div>
    </div>
  );
}