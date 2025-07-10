import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
// import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyArticles from './pages/MyArticles';
// import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import ArticleHistory from './pages/ArticleHistory';
import Home from './pages/Home';
import UserSideList from './components/UserSideList';
import { useState } from 'react';
import ViewArticle from './pages/ViewArticle';
import ListArticles from './pages/ListArticles';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import MessagesPage from './pages/MessagePage';
import PublicRoute from './components/PublicRoute';


function App() {
    const [showUsers, setShowUsers] = useState(false);
    const {user}= useAuth()
    console.error(user,"from app");
    
  return (
    <Router>
      <Navbar onShowUsers={() => setShowUsers(true)}/>
      
      <Routes>
        <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/my-articles" element={<PrivateRoute><MyArticles /></PrivateRoute>} />
        {/* <Route path="/create-article" element={<PrivateRoute><CreateArticle /></PrivateRoute>} /> */}
        <Route path="/chat" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/articles/:id/edit" element={<PrivateRoute><EditArticle /></PrivateRoute>} />
        <Route path="/articles/:id/history" element={<PrivateRoute><ArticleHistory /></PrivateRoute>} />
        <Route path="/" element={user?<Navigate to={'/Home'}/>:<ListArticles />} />
        <Route path="/all-articles" element={<ListArticles />} />
        <Route path="/articles/:id" element={<ViewArticle />} />
        <Route path="*" element={<Navigate to="/" />} />
        {/* <Route path='/message' element={<MessagesPage/>}/> */}
      </Routes>
      {user && <Sidebar/>}
      <UserSideList open={showUsers} onClose={() => setShowUsers(false)} />
    </Router>
  );
}

export default App;


    
