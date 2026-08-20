# Letter to the Future - Frontend ✉️

This is the frontend component for the "Letter to the Future" application. It is built with Next.js 16 and Tailwind CSS v4.

**Backend Repository:** [letter-to-the-future-backend](https://github.com/peterkahumu/letter-to-the-future-backend)

## Getting Started

First, install the dependencies:
```bash
npm install
```

Copy and configure your environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your backend API URL if different from the default
```

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Compose

If you'd like to run both the frontend and backend together using Docker, you can use the following `docker-compose.yml` configuration (assuming both repositories are cloned in the same parent directory):

<details>
<summary>Click to expand <code>docker-compose.yml</code></summary>

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: lttf-backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    healthcheck:
      test: [ "CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: lttf-frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
```

</details>

## Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
