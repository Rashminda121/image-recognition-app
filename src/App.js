import logo from './logo.svg';
import './App.css';
import ImageUpload from './components/ImageUpload';

function App() {
  return (
    <div className="App">
      <h2 style={{ textAlign: "center" }}>Upload Image</h2>
      <ImageUpload />
    </div>
  );
}

export default App;
