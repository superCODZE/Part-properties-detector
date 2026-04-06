const input = document.getElementById('photo');
const label = document.querySelector('label[for="photo"]');
const uploadBox = document.querySelector('.Upload-image');

input.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    // Supprimer le texte du label
    label.textContent = '';

    // Créer l'image et l'afficher dans la box
    const img = document.createElement('img');
    img.src = e.target.result;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 8px;
      display: block;
    `;

    label.appendChild(img);
  };

  reader.readAsDataURL(file);
});