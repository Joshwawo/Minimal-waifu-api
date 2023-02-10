import { useState } from "react";
import axios from "axios";
import "./App.css";
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [blockButton, setBlockButton] = useState(false);

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      if (!prompt || prompt === "") {
        return;
      }
      setBlockButton(true);
     const data = await toast.promise(axios.post("http://localhost:5000/image", { prompt }), {
        pending: "Loading...",
        success: "Success!",
        error: "Error",
      },{
        theme:"dark"
      });
      // const data = await axios.post("http://localhost:5000/image", { prompt });
      console.log(data.data);
      setImages([...images, data.data.image_data]);
    } catch (error) {
      console.log(error);
    } finally {
      console.log("Ya acabo");
      setBlockButton(false);
    }
  };

  return (
    <div className="App">
      <h1>Waifu Difusion</h1>
      <p>{prompt}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Prompt:
          <textarea
            cols={200}
            rows={5}
            name="prompt"
            onChange={(e) => setPrompt(e.target.value.replaceAll(" ", ",").replaceAll("_", " "))}
          />
        </label>
        <button type="submit" disabled={blockButton}>
          Submit
        </button>
      </form>
      {images.map((imageData, index) => {
        const imageBlob = new Blob(
          [
            new Uint8Array(
              atob(imageData)
                .split("")
                .map((char) => char.charCodeAt(0))
            ),
          ],
          { type: "image/png" }
        );
        const imageUrl = URL.createObjectURL(imageBlob);
        return <img key={index} src={imageUrl} alt="waifu" />;
      })}

    </div>
  );
}


export default App;
