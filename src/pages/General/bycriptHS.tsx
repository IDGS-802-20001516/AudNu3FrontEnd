import bcrypt from 'bcryptjs';

// Función para encriptar una contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10); // Generar un salt con 10 rondas
  const hash = await bcrypt.hash(password, salt); // Encriptar la contraseña
  return hash; // Devolver el hash
};

// Función para verificar una contraseña
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const match = await bcrypt.compare(password, hash); // Comparar la contraseña con el hash
  return match; // Devolver true si coinciden, false si no
};