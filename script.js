import { GoogleGenAI } from "https://esm.run/@google/genai";
import { API_KEY } from "./config.js";


let imageInput = null;
const savedImageKey = "part-properties-detector-image";
const icon = document.getElementById("icon");
const imageElement = document.getElementById("image");
const imageDatabaseName = "part-properties-detector";
const imageStoreName = "images";

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const showImagePreview = image => {
    icon.src = image;
    icon.style.cssText = "width: 95%; height: 95%; border-radius: 10px;";
};

const openImageDatabase = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(imageDatabaseName, 1);
    request.onupgradeneeded = () => {
        request.result.createObjectStore(imageStoreName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const saveImage = async image => {
    const database = await openImageDatabase();
    await new Promise((resolve, reject) => {
        const transaction = database.transaction(imageStoreName, "readwrite");
        transaction.objectStore(imageStoreName).put(image, savedImageKey);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
    });
    database.close();
};

const restoreImage = async () => {
    try {
        const database = await openImageDatabase();
        const image = await new Promise((resolve, reject) => {
            const request = database
                .transaction(imageStoreName, "readonly")
                .objectStore(imageStoreName)
                .get(savedImageKey);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        database.close();
        if (image) {
            showImagePreview(image);
        }
    } catch (storageError) {
        console.error("The saved image could not be restored.", storageError);
        try {
            const savedImage = localStorage.getItem(savedImageKey);
            if (savedImage) {
                showImagePreview(savedImage);
            }
        } catch (fallbackError) {
            console.error("No browser storage is available for the saved image.", fallbackError);
        }
    }
};

restoreImage();


imageElement.addEventListener("change", async function (event) {
    imageInput = event.target.files[0];
    if (!imageInput) {
        return;
    }

    let base64;
    try {
     base64 = await toBase64(imageInput);
    
    } catch (error) {
        document.getElementById("result-text").innerText = "Image processing failed.";
        document.getElementById("result-text").style.color = '#be0000';
        return;
    }
    
    showImagePreview(base64);
    try {
        await saveImage(base64);
    } catch (storageError) {
        console.error("The selected image could not be saved for the next reload.", storageError);
        try {
            localStorage.setItem(savedImageKey, base64);
        } catch (fallbackError) {
            console.error("No browser storage is available for the selected image.", fallbackError);
        }
    }

    
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
document.getElementById("result").innerText = "Analysis in progress...";
document.getElementById("result").style.color = "#ffffff";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const resultText = typeof response.text === "string"
      ? response.text
      : response.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("")
          .trim();

    if (!resultText) {
      throw new Error("Gemini returned an empty response.");
    }

    document.getElementById("result").innerText = resultText;
  } catch (apiError) {
    console.error(apiError);
    
    document.getElementById("result").innerText =
      "Analysis failed. Check the API key and the browser console for details.";
    document.getElementById("result").style.color = '#be0000';
    
    
  }
  

});
