import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Home from './pages/Home';
import Publications from './pages/Publications';
import PublicationDetail from './pages/PublicationDetail';
import Projects from './pages/Projects';
import ProjectPost from './pages/ProjectPost';
import CV from './pages/CV';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import News from './pages/News';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/publications" element={<Layout><Publications /></Layout>} />
        <Route path="/publications/:slug" element={<Layout><PublicationDetail /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
        <Route path="/projects/:slug" element={<Layout><ProjectPost /></Layout>} />
        <Route path="/cv" element={<Layout><CV /></Layout>} />
        <Route path="/blog" element={<Layout><Blog /></Layout>} />
        <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
