import { GoogleGenAI } from "https://esm.run/@google/genai";
import { API_KEY } from "./config.js";


let imageInput = null;

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

document.getElementById("icon").src="upload-icon.svg";


document.getElementById("image").addEventListener("input", async function (event) {
    imageInput = event.target.files[0];
    let base64;
    try {
     base64 = await toBase64(imageInput);
    
    } catch (error) {
        document.getElementById("result-text").innerText = "Image processing failed.";
        document.getElementById("result-text").style.color = '#be0000';
        return;
    }
    
    
    const url = URL.createObjectURL(imageInput);
    document.getElementById("icon").src = url;
    document.getElementById("icon").style.cssText = 'width: 95%; height: 95%; border-radius: 10px;';

    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const contents = [
  {
    inlineData: {
      mimeType: imageInput.type,
      data: base64.split(",")[1],
    },
  },
  `Analyze the image.

If it is a car part, return in lowercase only with space between words and in the following format:
name: <name>,  category: <category>,  status: <status>

If it is NOT a car part, return exactly:
this image is not a car part`,
];

document.getElementById("result-text").innerHTML = "RESULT:";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    
    
    document.getElementById("result").innerHTML = response.text;
  } catch (apiError) {
    console.error(apiError);
    
    document.getElementById("result").innerHTML = "The AI server is currently overloaded. Please try again later.";
    
    
  }
  

});


