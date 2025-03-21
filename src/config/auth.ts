import bcrypt from 'bcryptjs';
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10); 
  const hash = await bcrypt.hash(password, salt); 
  return hash; 
};
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const match = await bcrypt.compare(password, hash); // Comparar la contraseña con el hash
  return match; // Devolver true si coinciden, false si no
};