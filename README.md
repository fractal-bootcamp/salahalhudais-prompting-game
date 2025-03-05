# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Game Image Generation

The game uses AI-generated images as targets for the prompt guessing game. You can generate new images using DALL-E 2 with the following steps:

1. Make sure you have an OpenAI API key set in your `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Run the image generation script:
   ```bash
   bun generate-images
   ```
   This will generate 10 new images and save them to the `public/game-images` directory.

3. Seed the database with the new images:
   ```bash
   bun db:seed
   ```

Alternatively, you can run both steps with a single command:
```bash
bun generate-and-seed
```

The generated images will be added to the game's image pool, and players will see them randomly during gameplay.
