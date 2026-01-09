import Link from "next/link";
import { ArrowRight, CheckCircle, Users, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* --- Navigation --- */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-extrabold tracking-tight text-blue-600">
            OPOLO<span className="text-slate-900">CBT</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="#about" className="hover:text-blue-600 transition">About Us</Link>
            <Link href="#contact" className="hover:text-blue-600 transition">Contact</Link>
          </div>
          <div>
            <Link 
              href="/login" 
              className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition shadow-lg"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="flex-grow">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Empowering the Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">
                Generation of Minds.
              </span>
            </h1>
            <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto mb-10">
              Opolo CBT Resort is a premier education consulting firm dedicated to preparing teenagers for academic excellence through advanced testing and guidance.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="#contact" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-blue-500/30 shadow-xl hover:bg-blue-700 transition flex items-center">
                Get in Touch <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#about" className="px-8 py-4 bg-slate-100 text-slate-700 rounded-lg font-bold text-lg hover:bg-slate-200 transition">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* --- Features / About Snippet --- */}
        <section id="about" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Consulting</h3>
              <p className="text-slate-500">Tailored educational advice to help students navigate their academic path.</p>
            </div>
             {/* Feature 2 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">CBT Preparation</h3>
              <p className="text-slate-500">State-of-the-art facilities for Computer Based Testing practice and exams.</p>
            </div>
             {/* Feature 3 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Student Focused</h3>
              <p className="text-slate-500">A resort-like environment designed to make learning stress-free for teenagers.</p>
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Opolo CBT Resort LTD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}