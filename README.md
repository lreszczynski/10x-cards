# 10x-cards

## Project Description

10x-cards is a web application designed to streamline the process of creating and managing educational flashcards. Leveraging advanced AI models, the application can automatically generate flashcard suggestions based on text input, significantly reducing the manual effort required. In addition to AI-generated flashcards, users can manually create, edit, and manage flashcards, and participate in spaced repetition learning sessions to improve retention.

## Tech Stack

- **Frontend**:
  - Astro 5
  - React 19 (for interactive components)
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui for UI components
- **Backend**:
  - Supabase for database and authentication
- **AI Integration**:
  - Openrouter.ai for communication with various language models
- **Testing**:
  - Vitest and React Testing Library for unit testing
  - Playwright for E2E testing
  - ESLint and Prettier for static code analysis
- **CI/CD & Hosting**:
  - GitHub Actions for continuous integration and deployment
  - DigitalOcean for hosting (via Docker image)

## Getting Started Locally

1. **Prerequisites**:
   - Node.js (version specified in `.nvmrc`: **22.14.0**)
   - Git

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/lreszczynski/10x-cards>
   cd 10x-cards
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build and Preview**:
   - Build the project:
     ```bash
     npm run build
     ```
   - Preview the production build:
     ```bash
     npm run preview
     ```

## Available Scripts

- `npm run dev` - Starts the Astro development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build.
- `npm run astro` - Runs Astro commands.
- `npm run lint` - Lints the project using ESLint.
- `npm run lint:fix` - Automatically fixes linting errors.
- `npm run format` - Formats the project using Prettier.

## Project Scope

10x-cards is designed to enable users to quickly create and manage flashcards for efficient learning through spaced repetition. Key features include:

- **Automated AI Flashcard Generation**: 
  - Users can paste text excerpts to receive AI-generated flashcard suggestions.
- **Manual Flashcard Management**:
  - Create, edit, and delete flashcards manually.
- **Learning Sessions**:
  - Engage in spaced repetition sessions to reinforce learning.
- **User Authentication**:
  - Secure account registration and login.
- **Data Privacy**:
  - Flashcards and user data are handled securely in compliance with data protection regulations.

## Project Status

This project is currently in the MVP stage and under active development.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 