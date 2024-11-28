import jwt from "jsonwebtoken";

export const generateToken = (userId: string, email: string )=>{

    const token = jwt.sign(
        { id: userId, email },
        "hslLKKl",
        { expiresIn: "1h" }
      );

      return token

}