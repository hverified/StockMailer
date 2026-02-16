import "./globals.css";
import PwaRegister from "./components/PwaRegister";

export const metadata = {
  title: "Tradewise",
  description: "Stock screening dashboard",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/tradewise.svg",
    apple: "/tradewise.svg",
  },
};

export const viewport = {
  themeColor: "#0f5fa8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
