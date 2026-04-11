let imageInput = null;

// On crée la machine (fonction) pour transformer l'image en texte (Base64)
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

document.getElementById("icon").src="upload-icon.svg";

// On ajoute 'async' ici car la transformation prend un petit peu de temps
document.getElementById("image").addEventListener("input", async function (event) {
    imageInput = event.target.files[0];
    const url = URL.createObjectURL(imageInput);
    document.getElementById("icon").src = url;
    document.getElementById("icon").style.cssText = 'width: 95%; height: 95%; border-radius: 10px;';

    // On utilise 'await' pour attendre que la machine finisse son travail
    const base64 = await toBase64(imageInput);
    console.log(base64);
});


