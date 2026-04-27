import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Article from "./pages/Article";
import About from "./pages/About";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminEditor from "./pages/Admin/Editor";
import AdminCategories from "./pages/Admin/Categories";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/about" element={<About />} />
            <Route path="/category/:id" element={<Home />} />
            
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/editor" element={<AdminEditor />} />
            <Route path="/admin/editor/:id" element={<AdminEditor />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
