# Changelog

## [0.8.0](https://github.com/fjavidcr/pasapalabra-js/compare/v0.6.0...v0.8.0) (2026-03-15)

### Features

- Add a footer displaying the project version and wrap content in a main tag. ([31f5fa4](https://github.com/fjavidcr/pasapalabra-js/commit/31f5fa45d0416a4d94b61004f50c354581d2e550))
- add RAE dictionary lookup button for each word on the results screen. ([9cbf6e3](https://github.com/fjavidcr/pasapalabra-js/commit/9cbf6e3bc14e41425994dc88b046a2796369fad8))
- Add system instruction for word variety and increase Gemini model temperature. ([37f584e](https://github.com/fjavidcr/pasapalabra-js/commit/37f584e86e501c9b45dd6b2576123e027c6435bf))
- refine Gemini prompt rules for dictionary-accurate definitions and reduce generation temperature for increased precision. ([7b867cb](https://github.com/fjavidcr/pasapalabra-js/commit/7b867cbb5adff6cdbe0bcc277d7974ecc7ad6d3e))
- update favicon.svg to a rosco design, delete favicon.ico, and archive previous favicon assets. ([94577de](https://github.com/fjavidcr/pasapalabra-js/commit/94577def17534faeba254e92ba2c823940fe21e4))

### Bug Fixes

- Correct "Pasapalabra AI" to "Pasapalabra IA" in the setup screen title. ([3fa4a9f](https://github.com/fjavidcr/pasapalabra-js/commit/3fa4a9f44ccc10c9a4ebb23d202aa31a2bd67a4f))

## [0.7.0](https://github.com/fjavidcr/pasapalabra-js/compare/v0.6.0...v0.7.0) (2026-03-15)

### Features

- update favicon.svg to a rosco design, delete favicon.ico, and archive previous favicon assets. ([94577de](https://github.com/fjavidcr/pasapalabra-js/commit/94577def17534faeba254e92ba2c823940fe21e4))

### Bug Fixes

- Correct "Pasapalabra AI" to "Pasapalabra IA" in the setup screen title. ([3fa4a9f](https://github.com/fjavidcr/pasapalabra-js/commit/3fa4a9f44ccc10c9a4ebb23d202aa31a2bd67a4f))

## 0.6.0 (2026-03-12)

### Features

- Add game category selection to the setup screen, save the preference, and use it to theme AI-generated roscos. ([7c473f7](https://github.com/fjavidcr/pasapalabra-js/commit/7c473f770089af3395006fdff6a3ba36e1264ade))
- Implement difficulty selection for AI-generated Pasapalabra roscos, including UI, session storage, and AI prompt adjustments. ([56fca9e](https://github.com/fjavidcr/pasapalabra-js/commit/56fca9ee4b18b2d4f41da9779e4685a986e7fd53))

## 0.5.0 (2026-03-12)

### Features

- Add security tokens and SSR streaming for rosco generation.

## 0.4.0 (2026-03-12)

### Features

- Add release-it for automated versioning and changelog generation. ([3f7facd](https://github.com/fjavidcr/pasapalabra-js/commit/3f7facd87bbee89e94ca6b77e931e6314b043ea4))
- add session services ([b06ad82](https://github.com/fjavidcr/pasapalabra-js/commit/b06ad82868012bab3e2a675030bb920c98b2d2de))
- change default model ([c763cd0](https://github.com/fjavidcr/pasapalabra-js/commit/c763cd07257f2eeb8833b73ca49aa21bd2fab669))
- complete refactor to Astro, Cloudflare, and Gemini AI ([b55f196](https://github.com/fjavidcr/pasapalabra-js/commit/b55f19672b11ce828d6abd60378055db8e878767))
- Configure Cloudflare adapter with `imageService: 'compile'`, add `node:async_hooks` to Vite SSR externals, and enable Svelte core manual chunking. ([4c8e005](https://github.com/fjavidcr/pasapalabra-js/commit/4c8e005ebb5db028ddafc57cb4b43f270ba9eec7))
- Configure Cloudflare Workers deployment, update project dependencies and metadata, and enhance API robustness. ([2e0ef8e](https://github.com/fjavidcr/pasapalabra-js/commit/2e0ef8e44badfa20c346d36472b99069bd160646))
- Configure explicit production and preview environments in wrangler and CI workflow. ([86b9033](https://github.com/fjavidcr/pasapalabra-js/commit/86b90333f5f8845f29e1088948b1b0c27ffdbd2d))
- Consolidate CI and CD workflows into a single `ci.yml` file. ([2f19c81](https://github.com/fjavidcr/pasapalabra-js/commit/2f19c8196469f34180ad55f20a5cd2e2d7b828b4))
- Display game difficulty in the active game screen and apply minor styling adjustments to input fields and result screen word size. ([703bffe](https://github.com/fjavidcr/pasapalabra-js/commit/703bffeab85a9c9f3489dc0dbef425021d7bce04))
- Implement Cloudflare KV for session management and update deployment configurations and instructions. ([3ecf223](https://github.com/fjavidcr/pasapalabra-js/commit/3ecf2234f044f8d9950a207c5e78b49d91d5aea5))
- Implement game state saving to session and allow resuming from a saved index, with updated types. ([291e908](https://github.com/fjavidcr/pasapalabra-js/commit/291e90881307937dbe87b9ab8e6260850aee1147))
- Implement Gemini model selection, persistence, and quota management for word generation. ([1152870](https://github.com/fjavidcr/pasapalabra-js/commit/1152870da00d00cc1d35dc3b944d67292bf623f3))
- Implement HMAC-based API security for rosco generation and display incorrect words in the results screen. ([cca876b](https://github.com/fjavidcr/pasapalabra-js/commit/cca876b387d088c1a9caf09ee1f41679d4d7dc25))
- Implement Pasapalabra game with Svelte components and Shadcn UI integration. ([cb56d12](https://github.com/fjavidcr/pasapalabra-js/commit/cb56d129a858ca19afe670d182ea401dfe91445f))
- Implement POST-redirect-GET for game setup, persist game state in session, and add an abandon game button. ([9cfce49](https://github.com/fjavidcr/pasapalabra-js/commit/9cfce4927712f43ac514814ec438e82a4215f4a4))
- Implement secure token validation for POST requests and display session expiration messages on GET requests. ([e9dcd17](https://github.com/fjavidcr/pasapalabra-js/commit/e9dcd17057457131edaec0b254c63bafa073907f))
- Implement Server-Side Rendering (SSR) for the Rosco game board, generating words on the server during a POST request. ([29fe525](https://github.com/fjavidcr/pasapalabra-js/commit/29fe5250dd2b0dbb8df3803eecc53769174a5924))
- Implement server-side Rosco generation via form submission, introducing security tokens, shared types, and SSR streaming. ([46c73c7](https://github.com/fjavidcr/pasapalabra-js/commit/46c73c73337ee394b6ee1b068daa2f031ef528a2))
- Introduce CI/CD workflows, code quality tooling, and update core game logic and UI components. ([8efab45](https://github.com/fjavidcr/pasapalabra-js/commit/8efab450479bede0f521d3ad06a73cda0489654b))
- Introduce CI/CD workflows, code quality tooling, and update core game logic and UI components. ([f2907aa](https://github.com/fjavidcr/pasapalabra-js/commit/f2907aa89637b3d07250cd700c681b7de52f4549))
- Migrate environment variable access to Astro's new `astro:env/server` module and configure them in `astro.config.mjs`. ([c169916](https://github.com/fjavidcr/pasapalabra-js/commit/c1699168db2229ed2050f52afba155c2d913f299))
- Redirect to the home page when the game is reset. ([952057a](https://github.com/fjavidcr/pasapalabra-js/commit/952057ae4c8611784fca2dcc36d1fb94f70170e6))
- refine deployment scripts for preview and production environments. ([7de9f16](https://github.com/fjavidcr/pasapalabra-js/commit/7de9f160b88f124dfae6e7814b4fa0d5feaac6d6))
- Refine rosco generation prompt to mix "starts with" and "includes" words, and enhance error handling for Gemini API rate limits. ([61cfde3](https://github.com/fjavidcr/pasapalabra-js/commit/61cfde3478e69f94c525e849ec588372c7188ea2))
- Replace `wrangler.example.jsonc` with a tracked `wrangler.jsonc` containing concrete KV IDs and environment configurations. ([de851bc](https://github.com/fjavidcr/pasapalabra-js/commit/de851bc628b106e24e237206c217c5c2c9420fd3))
- Update AI model to gemini-2.5-flash and refresh UI with new global styling and component designs. ([a7f9e49](https://github.com/fjavidcr/pasapalabra-js/commit/a7f9e490f82cd1e9c60b85aa489c80d8b710d332))

## 0.3.0 (2026-03-12)

### Features

- Initial release with Gemini AI integration and Svelte components.
