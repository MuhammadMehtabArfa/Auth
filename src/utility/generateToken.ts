import jwt from "jsonwebtoken";

export const generateToken = (userId: string, email: string) => {
  const token = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET || "dhgsahjjfsaghsfjg",
    { expiresIn: "1h" }
  );

  return token;
};
