import "./globals.css";
export const metadata = {
  title: "QuestMood — квест по настроению",
  description: "Собери квест на день под текущее настроение",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
