import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import appConfig from "./config/app.json";

document.title = appConfig.meta.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', appConfig.meta.description);
document.querySelector('meta[name="keywords"]')?.setAttribute('content', appConfig.meta.keywords);
document.querySelector('meta[name="author"]')?.setAttribute('content', appConfig.meta.author);

createRoot(document.getElementById("root")!).render(<App />);
