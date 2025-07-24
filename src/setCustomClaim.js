// setCustomClaim.js
const admin = require("firebase-admin");

// Reemplaza con la ruta de tu clave privada
const serviceAccount = require("./ruta/clave-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// UID del usuario al que quieres asignar el rol
const uid = "UID_DEL_USUARIO"; // <- Reemplaza por el UID real del usuario
const rol = "admin"; // Puedes cambiarlo por "god", "barberyass", "vip", "user"

admin
  .auth()
  .setCustomUserClaims(uid, { rol })
  .then(() => {
    console.log(`✅ Rol "${rol}" asignado correctamente al usuario con UID: ${uid}`);
  })
  .catch((error) => {
    console.error("❌ Error al asignar el rol:", error);
  });
