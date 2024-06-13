import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="components">
      <Header />
      <NavigationBar />
      <MainContent />
      <Footer />
    </div>
  )
}

export default App;