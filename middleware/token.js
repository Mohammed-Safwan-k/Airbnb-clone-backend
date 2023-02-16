// instead of this token we can pass req
export default function getUserDataFromToken(token) {
  return new Promise((resolve, reject) => {
    // insted of token we can use req.cookies.token
    jwt.verify(token, process.env.JWT_KEY, {}, async (error, userData) => {
      if (error) throw error;
      resolve(userData);
    });
  });
}
