import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Publications from './pages/Publications';
import Projects from './pages/Projects';
import ProjectPost from './pages/ProjectPost';
import CV from './pages/CV';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="publications" element={<Publications />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectPost />} />
          <Route path="cv" element={<CV />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
