import {  useState } from "react";
import {AiFillDelete} from 'react-icons/ai'

const UserGenerations = () => {
  const [userGenerations, setUserGenerations] = useState<string[]>(
    JSON.parse(localStorage.getItem("waifus") ?? "[]")
  );
  const [userPrompts, setUserPrompts] = useState<string[]>(
    JSON.parse(localStorage.getItem("prompts") ?? "[]")
  )

  const handleDelete = () => {
    if(confirm("Are you sure you want to delete all your waifus?") ===true){
      localStorage.removeItem("waifus")
      localStorage.removeItem("prompts")
      setUserGenerations([])
      setUserPrompts([])
    }{
      return
    }
    
    
  }

  return (
   <div className="flex p-5 justify-between gap-x-5">
     
     <div className="bg-[#413f3f] grid grid-cols-6 h-1/6 mt-3">
      {userGenerations.map((imageData, index) => {
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
        return <img key={index} src={imageUrl} alt="waifu" className="object-cover " />;
      })}
      </div>
      <div className="w-3/12">
        <p className="text-2xl font-semibold flex items-center">Your Latest Prompts <AiFillDelete className="mt-1 mx-2 text-red-500 hover:text-red-700" onClick={handleDelete}/>  </p>
        {
          userPrompts.map((prompt, index)=>(
            <div className="" key={index}>
                <p className="overflow-wrap pt-2 overflow-wrap break-words text-sm"><span className="text-green-300">{1+ index}</span>: {prompt}</p>
            </div>
          ))
        }
      </div>
      
   </div>

  );
};

export default UserGenerations;
