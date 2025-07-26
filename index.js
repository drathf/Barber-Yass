const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.createUserByAdmin = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Debes estar autenticado.");
  }

  // Obtener rol del usuario que llama
  const currentUser = await admin.firestore().collection("usuarios").doc(context.auth.uid).get();
  if (!currentUser.exists) {
    throw new functions.https.HttpsError("not-found", "Usuario no registrado en Firestore.");
  }

  const rolActual = currentUser.data().rol;

  // Validar roles permitidos
  if (!["god", "admin", "barberyass"].includes(rolActual)) {
    throw new functions.https.HttpsError("permission-denied", "No tienes permisos para crear usuarios.");
  }

  // Crear usuario en Firebase Auth
  const userRecord = await admin.auth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.nombre,
  });

  // Definir el rol permitido para crear
  let rolNuevo = data.rol || "user";
  if (rolNuevo === "god" && rolActual !== "god") {
    // Solo otro god puede asignar rol god
    rolNuevo = "user";
  }

  // Guardar en Firestore
  await admin.firestore().collection("usuarios").doc(userRecord.uid).set({
    nombre: data.nombre,
    email: data.email,
    rol: rolNuevo,
    creado: new Date().toISOString(),
  });

  return { uid: userRecord.uid, rol: rolNuevo };
});
