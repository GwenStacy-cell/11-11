# 📻 11:11 Live Walkie-Talkie (PWA)

> A real-time push-to-talk walkie-talkie web application for close friends, inspired by Ten Ten.

![11:11 Walkie Talkie](public/pwa-512x512.png)

## 🌟 Key Features

- **Push-To-Talk (PTT) Voice Channel**: Hold down to broadcast live voice directly to friends.
- **Dynamic Voice Visualizer**: Live audio frequency waveforms and volume-synced soundwave halo rings.
- **QR Code & Friend PIN Cards**: Instant friend addition by scanning camera QR codes or sharing 4-digit PINs.
- **Audio Filters**: Switch between Classic CB Radio, Crisp Studio, Megaphone, and Tactical Radio filters.
- **Full PWA Support**: Installable on iOS Safari, Android Chrome, and Desktop as a standalone application.
- **Lock Screen & Soundboard**: Transmit hands-free on air, trigger alert sound effects, or send instant pokes.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **PWA Tooling**: `vite-plugin-pwa` with Workbox precaching
- **Icons**: Lucide React
- **QR Code Generation**: `qrcode`

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/11-11-walkie-talkie.git
cd 11-11-walkie-talkie
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

To generate a static production build ready for deployment:

```bash
npm run build
```

The output will be created inside the `dist/` folder.

---

## 🌐 Deploying to Hosting Providers

You can host this application on any static web host or serverless platform:

### Deploy to Vercel / Netlify / Cloudflare Pages
1. Push your code to a GitHub repository.
2. Import the repository in **Vercel** or **Netlify**.
3. Build Command: `npm run build`
4. Output Directory: `dist`

---

## 📱 How to Install as a Mobile App (PWA)

- **iPhone / iPad (iOS Safari)**: Open in Safari $\rightarrow$ Tap **Share** $\rightarrow$ Tap **Add to Home Screen**.
- **Android / Chrome / Desktop**: Tap the in-app **Download & Install App** button or click the **⊕ Install** icon in the URL bar.

---

## 📜 License

MIT License — feel free to customize and expand!
