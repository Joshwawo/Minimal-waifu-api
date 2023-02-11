import { useState, useEffect } from "react";
import axios from "axios";
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {AiOutlineLoading} from 'react-icons/ai'


const WaifuDifusion = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("worst quality, low quality, medium quality, deleted, lowres, comic, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username, blurry,poorly drawn facea");
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]); 
  const [images, setImages] = useState<string[]>([]);
  const [singleUseImage, setSingleUseImage] = useState<string[]>([]);
  const [blockButton, setBlockButton] = useState(false);

  useEffect(() => {
    const storedImages = localStorage.getItem("waifus");
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
    const storedPrompt = localStorage.getItem("prompts");
    if (storedPrompt) {
      setSavedPrompts(JSON.parse(storedPrompt));
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (!prompt || prompt === "" || negativePrompt === "") {
        return toast.warn("Please enter a prompt", {theme:"dark"})
      }
    setBlockButton(true);
     const data = await axios.post("http://192.168.1.7:5000/prompt/image", { prompt, negative_prompt:negativePrompt })
     
      // const data = await toast.promise(axios.post("http://192.168.1.7:5000/prompt/image", { prompt }), {
      //   pending: "Processing...",
      //   success: "Success!",
      //   error: "Error",
        
      // },{
      //   theme:"dark",
      //   position:"bottom-right"

      // });
      setSingleUseImage([...singleUseImage, data.data.image_data])
      setImages([...images, data.data.image_data]);
      localStorage.setItem("waifus", JSON.stringify([...images,data.data.image_data]));
      setSavedPrompts([...savedPrompts, prompt]);
      localStorage.setItem("prompts", JSON.stringify([...savedPrompts, prompt]));
    } catch (error:any) {
      console.log(error);
      toast.error(error.message || "Error");
    } finally {
      setBlockButton(false);
    }
  };

  

  return (
    <div className="container mx-auto h-screen">
      <h1 className="text-5xl font-semibold mb-5">Waifu Difusion</h1>
      {
        prompt === "" ? (<p className="text-xl text-yellow-500">Please enter a prompt</p>) 
        : 
        (<p className="text-lg overflow-wrap break-words">Clean Prompt: <span className="text-sm text-orange-400">{prompt}</span></p> )
      }
      <form onSubmit={handleSubmit} className="mt-10">
        <div>
          <label className="text-xl">
            Prompt:
          </label>
          <textarea
              className="w-full rounded-md py-2 px-2 mt-4"
              name="prompt"
              rows={4}
              value={prompt}
              // onChange={(e) => setPrompt(e.target.value)}
              onChange={(e) => setPrompt(e.target.value.replaceAll(" ", ",").replaceAll("_", " "))}
            />
            <label className="text-xl">
          Negative Prompt:
        </label>
        <textarea
            className="w-full rounded-md py-2 px-2 mt-4"
            name="prompt"
            rows={4}
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            // onChange={(e) => setPrompt(e.target.value.replaceAll(" ", ",").replaceAll("_", " "))}
          />
        </div>
        <button type="submit" className={`my-2 w-full ${blockButton ? 'border-yellow-700 hover:border-yellow-600 text-[#ffffff67] text-center': 'border-green-700 hover:border-green-600'}`} disabled={blockButton}>
          {
            blockButton ? <p className="flex items-center gap-x-2 justify-center">Processing <AiOutlineLoading className="animate-spin"/></p>
             : <p>Submit</p>
          }
        </button>
      </form>
      <div className="bg-[#413f3f] grid grid-cols-3 mb-5">
      {singleUseImage.map((imageData, index) => {
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

    </div>
  );
}

export default WaifuDifusion