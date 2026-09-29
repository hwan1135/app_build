# app_build
BLUF: Build this as an Expo React Native app for Android and iOS, with a small backend that calls Perplexity. Do not put the Perplexity API key in the mobile app—Expo public environment variables are visible in compiled apps. 
expo.dev

Recommended design
Mobile: Expo / React Native

AI backend: Node.js + Express (or a serverless API)

AI provider: Perplexity Chat Completions using the sonar model

User flow: User enters a question → app sends it to your backend → backend calls Perplexity → app displays a friendly chat answer and optional sources.

Perplexity’s API supports a chat-completions request with messages and models including sonar; its web-grounded response may include citations and related questions. 
perplexity.ai

*****
Production considerations
Protect the API key. Do not place it in App.tsx, .env variables beginning with EXPO_PUBLIC_, or any mobile-client configuration. Those values can be exposed to users of the app. 
expo.dev

Add authentication and rate limiting to the backend before public release.

Add conversation history by sending a limited prior-message history with each request.

Add content safeguards for your intended audience and use case.

Deploy the backend over HTTPS and replace YOUR-BACKEND-DOMAIN.com in the app.

Use device secure storage only for user session tokens, not as a substitute for protecting a shared provider API key. Expo SecureStore provides encrypted key-value storage on the device. 
expo.dev

This is a functional starter design, but I have not executed or tested the code.