import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  // console.log(req.body);
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // res.status(500).json({ message: error.message });
    next(error);
    // next(errorHandler(300, "something went wrong"));
  }
};


export const signin = async (req, res, next) => {
  // Ambil email dan password dari bagian body permintaan (request)
  const { email, password } = req.body;
  try {
    // Cari user di database berdasarkan email
    const validUser = await User.findOne({ email });

    // Jika user tidak ditemukan, kirim error dengan kode status 404
    if (!validUser) return next(errorHandler(404, "User not found"));

    // Bandingkan password yang diberikan dengan password yang disimpan di database
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    // Jika password tidak cocok, kirim error dengan kode status 401
    if (!validPassword) return next(errorHandler(401, "Wrong credentials"));

    // Jika user ditemukan dan password valid, buat JSON Web Token (JWT)
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    // Ambil password dari objek user (untuk keamanan) dan dapatkan sisa data user
    const { password: hashedPassword, ...rest } = validUser._doc;

    // Tetapkan tanggal kedaluwarsa untuk JWT (1 jam dari waktu sekarang)
    const expiryDate = new Date(new Date() + 3600000);
    // Tetapkan JWT sebagai cookie HTTP-only dengan tanggal kedaluwarsa
    res;
    res
      .cookie("access_token", token, { httpOnly: true, expires: expiryDate })
      .status(200)
      .json(rest);
  } catch (error) {
    // Jika terjadi kesalahan selama proses, lewatkan ke middleware penanganan kesalahan
    next(error);
  }
};
