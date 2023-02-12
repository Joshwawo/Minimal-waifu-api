import {  useState } from "react";
import {AiFillDelete} from 'react-icons/ai'
import axios from 'axios'
import useSWR from 'swr'
import {MyGentsTypes} from "@/types/Types"

const UserGenDB = () => { 
  const url = "http://192.168.1.7:5000/all-prompts"
  const fetcher = (url: string) => axios.get<MyGentsTypes[]>(url).then((res) => res.data)
  const {data, error,isLoading} = useSWR(url, fetcher)
  console.log(data)

  const handleDelete = () => {  
    
  }

  return (
   <div className="md:flex p-5 justify-between gap-x-5">
     
     <div className="bg-[#413f3f] md:grid md:grid-cols-6 md:h-1/6 mt-3">
      {data?.map((imageData, index) => {
        const imageBlob = new Blob(
          [
            new Uint8Array(
              atob(imageData.image_data)
                .split("")
                .map((char) => char.charCodeAt(0))
            ),
          ],
          { type: "image/webp" }
        );
        const imageUrl = URL.createObjectURL(imageBlob);
        return <img key={index} src={imageUrl} alt="waifu" className="object-cover " />;
      })}
      </div>
      <div className="w-3/12">
        <p className="text-2xl font-semibold flex items-center">Your Latest Prompts <AiFillDelete className="mt-1 mx-2 text-red-500 hover:text-red-700" onClick={handleDelete}/>  </p>
        {
          data?.map((prompt, index)=>(
            <div className="" key={prompt._id}>
                <p className="overflow-wrap pt-2 overflow-wrap break-words text-sm"><span className="text-green-300">{1+ index}</span>{prompt.prompt}</p>
            </div>
          ))
        }
      </div>
      
   </div>

  );
};

export default UserGenDB;
